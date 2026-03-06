"""
Campaigns API – CRUD + start/pause endpoints.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import (
    Campaign,
    CampaignStatus,
    Workflow,
    WorkflowExecution,
    Lead,
    Message,
    MessageStatus,
    LeadStatus,
)
from app.models.execution import ExecutionStatus
from app.schemas.campaign_schema import (
    CampaignCreate,
    CampaignResponse,
    CampaignListResponse,
)
from app.utils.logger import get_logger

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])
log = get_logger("api.campaigns")


@router.post("/", response_model=CampaignResponse, status_code=201)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    """Create a new campaign linking a workflow to a set of leads."""
    # Validate workflow exists
    wf = db.query(Workflow).filter(Workflow.id == payload.workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Resolve leads
    if payload.lead_ids:
        lead_id_strs = [str(lid) for lid in payload.lead_ids]
        leads_count = db.query(Lead).filter(Lead.id.in_(payload.lead_ids)).count()
    else:
        leads_count = db.query(Lead).count()
        lead_id_strs = [str(l.id) for l in db.query(Lead.id).all()]

    campaign = Campaign(
        name=payload.name,
        workflow_id=payload.workflow_id,
        lead_ids=lead_id_strs,
        leads_total=leads_count,
        status=CampaignStatus.DRAFT,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    log.info(f"Created campaign '{campaign.name}' with {leads_count} leads")
    return campaign


@router.get("/", response_model=CampaignListResponse)
def list_campaigns(db: Session = Depends(get_db)):
    """List all campaigns with live stats."""
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()

    # Refresh stats from execution data
    for c in campaigns:
        _refresh_stats(c, db)

    db.commit()
    return CampaignListResponse(campaigns=campaigns, total=len(campaigns))


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    _refresh_stats(c, db)
    db.commit()
    return c


@router.post("/{campaign_id}/start", response_model=CampaignResponse)
def start_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    """Start a campaign – creates a workflow execution and dispatches it."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status == CampaignStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Campaign is already running")

    # Create execution
    import uuid as uuid_mod

    lead_uuids = [uuid_mod.UUID(lid) for lid in (campaign.lead_ids or [])]

    execution = WorkflowExecution(
        workflow_id=campaign.workflow_id,
        status=ExecutionStatus.QUEUED,
        started_at=datetime.utcnow(),
        context={
            "initial_lead_ids": [str(lid) for lid in lead_uuids],
            "campaign_id": str(campaign.id),
        },
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    campaign.status = CampaignStatus.RUNNING
    campaign.execution_id = execution.id
    db.commit()

    # Try Celery dispatch, fall back to direct execution
    try:
        from app.workers.workflow_worker import execute_workflow_task

        execute_workflow_task.delay(str(campaign.workflow_id), str(execution.id))
        log.info(f"Campaign {campaign.id} dispatched to Celery")
    except Exception as e:
        log.warning(f"Celery unavailable ({e}), running workflow directly")
        import asyncio
        from app.services.workflow_engine import WorkflowEngine

        engine = WorkflowEngine(db)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(
                engine.execute(
                    workflow_id=str(campaign.workflow_id),
                    execution_id=str(execution.id),
                )
            )
        finally:
            loop.close()

    _refresh_stats(campaign, db)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/{campaign_id}/pause", response_model=CampaignResponse)
def pause_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = CampaignStatus.PAUSED
    db.commit()
    db.refresh(campaign)
    return campaign


@router.delete("/{campaign_id}", status_code=204)
def delete_campaign(campaign_id: UUID, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(campaign)
    db.commit()


def _refresh_stats(campaign: Campaign, db: Session):
    """Pull live stats from execution/message tables."""
    if not campaign.execution_id:
        return

    execution = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.id == campaign.execution_id)
        .first()
    )
    if not execution:
        return

    # Count messages for this execution
    sent = (
        db.query(Message)
        .filter(
            Message.workflow_execution_id == execution.id,
            Message.status.in_([MessageStatus.SENT, MessageStatus.DELIVERED]),
        )
        .count()
    )

    replied = (
        db.query(Message)
        .filter(
            Message.workflow_execution_id == execution.id,
            Message.status == MessageStatus.REPLIED,
        )
        .count()
    )

    campaign.messages_sent = sent
    campaign.replies_count = replied

    # Update campaign status from execution status
    if execution.status == ExecutionStatus.COMPLETED:
        campaign.status = CampaignStatus.COMPLETED
    elif execution.status == ExecutionStatus.FAILED:
        campaign.status = CampaignStatus.FAILED
    elif execution.status == ExecutionStatus.RUNNING:
        campaign.status = CampaignStatus.RUNNING
