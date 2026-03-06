"""
Webhooks API – handles inbound events (e.g. replies from leads).
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID

from app.database import get_db
from app.models import Message, MessageChannel, MessageDirection, MessageStatus, Lead
from app.utils.logger import get_logger
from app.workers.reply_worker import process_inbound_reply_task

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
log = get_logger("api.webhooks")


class InboundReplyPayload(BaseModel):
    lead_id: UUID
    channel: MessageChannel
    body: str


@router.post("/reply")
def receive_reply(payload: InboundReplyPayload, db: Session = Depends(get_db)):
    """
    Simulates receiving an inbound reply from a channel (Email, LinkedIn, WhatsApp).
    """
    lead = db.query(Lead).filter(Lead.id == payload.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Create inbound message
    msg = Message(
        lead_id=lead.id,
        channel=payload.channel,
        direction=MessageDirection.INBOUND,
        status=MessageStatus.DELIVERED,
        body=payload.body,
    )
    db.add(msg)

    # Temporarily mark lead as REPLIED until AI classifies it
    from app.models.lead import LeadStatus

    if lead.status not in (
        LeadStatus.INTERESTED,
        LeadStatus.NOT_INTERESTED,
        LeadStatus.CONVERTED,
    ):
        lead.status = LeadStatus.REPLIED

    db.commit()
    db.refresh(msg)

    log.info(f"Received {payload.channel} reply from {lead.email or payload.lead_id}")

    # Dispatch to Celery for AI classification
    process_inbound_reply_task.delay(str(msg.id))

    return {"status": "ok", "message_id": str(msg.id)}
