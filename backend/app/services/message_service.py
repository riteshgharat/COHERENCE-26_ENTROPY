"""
Message Service – orchestrates sending messages through the correct channel adapter.
Phase 1: Email channel only.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Message, MessageChannel, MessageStatus, MessageDirection
from app.integrations.email_client import send_email
from app.utils.logger import get_logger

log = get_logger("message_service")


async def send_message(
    db: Session,
    lead_id,
    channel: MessageChannel,
    body: str,
    subject: Optional[str] = None,
    workflow_execution_id=None,
) -> Message:
    """
    Create a Message record and dispatch it through the appropriate channel adapter.
    Returns the persisted Message with updated status.
    """
    msg = Message(
        lead_id=lead_id,
        workflow_execution_id=workflow_execution_id,
        channel=channel,
        direction=MessageDirection.OUTBOUND,
        status=MessageStatus.PENDING,
        subject=subject,
        body=body,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    try:
        if channel == MessageChannel.EMAIL:
            # Get lead email from the DB
            from app.models import Lead

            lead = db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead or not lead.email:
                raise ValueError(f"Lead {lead_id} has no email address")

            await send_email(
                to_address=lead.email,
                subject=subject or "Hello!",
                body=body,
            )
            msg.status = MessageStatus.SENT
            msg.sent_at = datetime.utcnow()
            log.info(f"Email sent to {lead.email} for lead {lead_id}")

        elif channel == MessageChannel.LINKEDIN:
            # Phase 2
            log.warning("LinkedIn channel not yet implemented – marking as pending")
            msg.status = MessageStatus.PENDING

        elif channel == MessageChannel.WHATSAPP:
            # Phase 2
            log.warning("WhatsApp channel not yet implemented – marking as pending")
            msg.status = MessageStatus.PENDING

        else:
            raise ValueError(f"Unknown channel: {channel}")

    except Exception as e:
        msg.status = MessageStatus.FAILED
        msg.error_detail = str(e)
        log.error(f"Message send failed for lead {lead_id}: {e}")

    db.commit()
    db.refresh(msg)
    return msg
