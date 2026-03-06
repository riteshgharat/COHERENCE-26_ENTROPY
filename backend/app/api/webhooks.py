"""
Webhooks API – handles inbound events (e.g. replies from leads).
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models import Message, MessageChannel, MessageDirection, MessageStatus, Lead
from app.utils.logger import get_logger
from app.workers.reply_worker import process_inbound_reply_task

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
log = get_logger("api.webhooks")


class InboundReplyPayload(BaseModel):
    # Strict mode (internal/manual): supply lead_id directly
    lead_id: Optional[UUID] = None
    channel: MessageChannel
    body: str
    # Loose mode (from WhatsApp/LinkedIn services): identify lead by contact info
    sender: Optional[str] = None       # phone number from WhatsApp
    message_body: Optional[str] = None # alternate body field from WhatsApp
    email: Optional[str] = None        # email address from email service


@router.post("/reply")
def receive_reply(payload: InboundReplyPayload, db: Session = Depends(get_db)):
    """
    Receives an inbound reply from any channel service.
    Supports both direct lead_id lookup and fuzzy lookup by phone/email.
    """
    # Normalize body — WhatsApp sends 'message_body', internal sends 'body'
    body = payload.body or payload.message_body or ""
    if not body:
        raise HTTPException(status_code=422, detail="Reply body is required")

    # Resolve lead — try lead_id first, then phone (WhatsApp), then email
    lead = None
    if payload.lead_id:
        lead = db.query(Lead).filter(Lead.id == payload.lead_id).first()
    elif payload.sender:
        # Normalize phone: strip +, spaces, dashes
        phone = "".join(filter(str.isdigit, payload.sender))
        lead = db.query(Lead).filter(Lead.phone.contains(phone[-9:])).first()
    elif payload.email:
        lead = db.query(Lead).filter(Lead.email == payload.email).first()

    if not lead:
        log.warning(f"No lead found for reply (sender={payload.sender}, email={payload.email})")
        raise HTTPException(status_code=404, detail="Lead not found")

    # Create inbound message
    msg = Message(
        lead_id=lead.id,
        channel=payload.channel,
        direction=MessageDirection.INBOUND,
        status=MessageStatus.DELIVERED,
        body=body,
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

    log.info(f"Received {payload.channel} reply from {lead.email or str(lead.id)}")

    # Dispatch to Celery for AI classification + conversation response
    process_inbound_reply_task.delay(str(msg.id))

    return {"status": "ok", "message_id": str(msg.id), "lead_id": str(lead.id)}
