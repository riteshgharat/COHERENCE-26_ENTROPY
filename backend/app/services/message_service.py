"""
Message Service – orchestrates sending messages through the correct channel adapter.
Supports Celery async dispatch with direct-execution fallback.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Message, MessageChannel, MessageStatus, MessageDirection, Lead
from app.integrations.email_client import send_email
from app.services.throttle import can_send, record_send
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
    Tries Celery async first, falls back to direct execution if broker unavailable.
    """
    import uuid

    if isinstance(lead_id, str):
        lead_id = uuid.UUID(lead_id)
    if isinstance(workflow_execution_id, str):
        workflow_execution_id = uuid.UUID(workflow_execution_id)

    # Check throttle
    if not can_send(channel.value):
        log.warning(
            f"Throttled: {channel.value} limit reached. Skipping message for lead {lead_id}"
        )
        msg = Message(
            lead_id=lead_id,
            workflow_execution_id=workflow_execution_id,
            channel=channel,
            direction=MessageDirection.OUTBOUND,
            status=MessageStatus.FAILED,
            subject=subject,
            body=body,
            error_detail="Daily send limit reached (throttled)",
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

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

    # Try Celery dispatch first
    try:
        from app.workers.messaging_worker import send_message_task
        import random

        jitter = random.randint(0, 30)
        send_message_task.apply_async(args=[str(msg.id)], countdown=jitter)
        log.info(f"Queued message {msg.id} via Celery with {jitter}s jitter")
        record_send(channel.value)

    except Exception as celery_err:
        log.warning(f"Celery unavailable ({celery_err}), sending directly...")

        # Direct execution fallback
        try:
            lead = db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead:
                raise ValueError(f"Lead {lead_id} not found")

            success = False

            if channel == MessageChannel.EMAIL:
                if lead.email:
                    await send_email(
                        to_address=lead.email,
                        subject=subject or "Hello",
                        body=body,
                    )
                    success = True

            elif channel == MessageChannel.LINKEDIN:
                if lead.linkedin_url:
                    from app.integrations.linkedin_client import send_linkedin_message

                    success = await send_linkedin_message(
                        profile_url=lead.linkedin_url, message=body
                    )

            elif channel == MessageChannel.WHATSAPP:
                if lead.phone:
                    from app.integrations.whatsapp_client import send_whatsapp_message

                    success = await send_whatsapp_message(
                        phone=lead.phone, message=body
                    )

            if success:
                msg.status = MessageStatus.SENT
                msg.sent_at = datetime.utcnow()
                record_send(channel.value)
                log.info(f"Direct-sent {channel.value} message to lead {lead_id}")
            else:
                msg.status = MessageStatus.FAILED
                msg.error_detail = f"Direct send failed for channel {channel.value}"

        except Exception as direct_err:
            msg.status = MessageStatus.FAILED
            msg.error_detail = str(direct_err)
            log.error(f"Direct send failed for message {msg.id}: {direct_err}")

        db.commit()

    return msg
