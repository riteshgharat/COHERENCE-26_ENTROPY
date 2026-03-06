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
    import uuid

    if isinstance(lead_id, str):
        lead_id = uuid.UUID(lead_id)
    if isinstance(workflow_execution_id, str):
        workflow_execution_id = uuid.UUID(workflow_execution_id)

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
        from app.workers.messaging_worker import send_message_task
        import random

        # Phase 2: Add simple throttling via random task stagger (0 to 30s)
        jitter = random.randint(0, 30)
        send_message_task.apply_async(args=[str(msg.id)], countdown=jitter)
        log.info(f"Queued message {msg.id} via Celery with {jitter}s jitter")

    except Exception as e:
        msg.status = MessageStatus.FAILED
        msg.error_detail = str(e)
        log.error(f"Failed to queue message {msg.id} for lead {lead_id}: {e}")
        db.commit()

    return msg
