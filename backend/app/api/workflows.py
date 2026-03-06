"""
Workflows API – CRUD + execution endpoint.
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Workflow, WorkflowStatus, WorkflowExecution
from app.schemas.workflow_schema import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowListResponse,
    WorkflowExecuteRequest,
    WorkflowExecuteResponse,
)
from app.services.workflow_engine import WorkflowEngine
from app.utils.logger import get_logger

router = APIRouter(prefix="/workflows", tags=["Workflows"])
log = get_logger("api.workflows")


@router.post("/", response_model=WorkflowResponse, status_code=201)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    """Create a new workflow from React Flow JSON."""
    workflow = Workflow(
        name=payload.name,
        description=payload.description,
        flow_data=payload.flow_data.model_dump(),
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    log.info(f"Created workflow '{workflow.name}' ({workflow.id})")
    return workflow


@router.get("/", response_model=WorkflowListResponse)
def list_workflows(
    status: Optional[WorkflowStatus] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Workflow)
    if status:
        query = query.filter(Workflow.status == status)
    workflows = query.all()
    return WorkflowListResponse(workflows=workflows, total=len(workflows))


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: UUID, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.patch("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: UUID, payload: WorkflowUpdate, db: Session = Depends(get_db)
):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    update_data = payload.model_dump(exclude_unset=True)
    if "flow_data" in update_data and update_data["flow_data"]:
        update_data["flow_data"] = (
            update_data["flow_data"].model_dump()
            if hasattr(update_data["flow_data"], "model_dump")
            else update_data["flow_data"]
        )
    for field, value in update_data.items():
        setattr(wf, field, value)
    db.commit()
    db.refresh(wf)
    return wf


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(workflow_id: UUID, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(wf)
    db.commit()


# ── Execution ──


@router.post("/{workflow_id}/execute", response_model=WorkflowExecuteResponse)
def execute_workflow(
    workflow_id: UUID,
    payload: WorkflowExecuteRequest = WorkflowExecuteRequest(),
    db: Session = Depends(get_db),
):
    """
    Execute a workflow. In Phase 2 this dispatches to Celery workers.
    """
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Create Execution Record
    from datetime import datetime
    from app.models.execution import ExecutionStatus

    execution = WorkflowExecution(
        workflow_id=wf.id,
        status=ExecutionStatus.QUEUED,
        started_at=datetime.utcnow(),
        context=(
            {"initial_lead_ids": [str(lid) for lid in payload.lead_ids]}
            if payload.lead_ids
            else {}
        ),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    try:
        from app.workers.workflow_worker import execute_workflow_task

        execute_workflow_task.delay(str(wf.id), str(execution.id))

        return WorkflowExecuteResponse(
            execution_id=execution.id,
            workflow_id=workflow_id,
            status=execution.status.value,
            message="Workflow execution dispatched to background workers successfully.",
        )
    except Exception as e:
        log.error(f"Workflow dispatch failed: {e}")
        execution.status = ExecutionStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=f"Broker connection failed: {e}")


@router.get("/{workflow_id}/executions")
def list_executions(workflow_id: UUID, db: Session = Depends(get_db)):
    """List all executions for a workflow."""
    executions = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.workflow_id == workflow_id)
        .order_by(WorkflowExecution.created_at.desc())
        .all()
    )
    return {
        "workflow_id": str(workflow_id),
        "executions": [
            {
                "id": str(e.id),
                "status": e.status.value,
                "leads_processed": e.leads_processed,
                "messages_sent": e.messages_sent,
                "errors_count": e.errors_count,
                "started_at": str(e.started_at) if e.started_at else None,
                "completed_at": str(e.completed_at) if e.completed_at else None,
            }
            for e in executions
        ],
    }
