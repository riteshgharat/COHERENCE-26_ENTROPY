"""
Messaging Worker – handles individual message dispatch tasks.
Phase 1: basic task. Phase 2: adds throttling, rate limiting.
"""

from app.workers.celery_app import celery_app
from app.utils.logger import get_logger

log = get_logger("worker.messaging")


import asyncio
from datetime import datetime
from app.workers.celery_app import celery_app
from app.utils.logger import get_logger
from app.database import SessionLocal
from app.models import Message, MessageChannel, MessageStatus, Lead

log = get_logger("worker.messaging")


@celery_app.task(bind=True, name="messaging.send", max_retries=3)
def send_message_task(self, message_id: str):
    """
    Celery task to send a single message by ID using the appropriate channel adapter.
    Implements Phase 2: Decoupled sending with adapter coordination.
    """
    log.info(f"[Task {self.request.id}] Dispatching message {message_id}")
    db = SessionLocal()

    try:
        msg = db.query(Message).filter(Message.id == message_id).first()
        if not msg or msg.status != MessageStatus.PENDING:
            log.warning(f"Message {message_id} is not pending or not found")
            return

        lead = db.query(Lead).filter(Lead.id == msg.lead_id).first()
        if not lead:
            raise ValueError(f"Lead {msg.lead_id} not found")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        success = False

        if msg.channel == MessageChannel.EMAIL:
            if not lead.email:
                raise ValueError("Lead has no email address")
            from app.integrations.email_client import send_email

            loop.run_until_complete(
                send_email(
                    to_address=lead.email, subject=msg.subject or "Hello", body=msg.body
                )
            )
            success = True

        elif msg.channel == MessageChannel.LINKEDIN:
            if not lead.linkedin_url:
                raise ValueError("Lead has no linkedin URL")
            from app.integrations.linkedin_client import send_linkedin_message

            success = loop.run_until_complete(
                send_linkedin_message(profile_url=lead.linkedin_url, message=msg.body)
            )

        elif msg.channel == MessageChannel.WHATSAPP:
            if not lead.phone:
                raise ValueError("Lead has no phone number")
            from app.integrations.whatsapp_client import send_whatsapp_message

            success = loop.run_until_complete(
                send_whatsapp_message(phone=lead.phone, message=msg.body)
            )

        loop.close()

        if success:
            msg.status = MessageStatus.SENT
            msg.sent_at = datetime.utcnow()
            log.info(f"Successfully sent {msg.channel} for lead {lead.id}")
        else:
            raise ValueError(f"Adapter for {msg.channel} did not return success")

        db.commit()
        return {"message_id": message_id, "status": msg.status.value}

    except Exception as exc:
        log.error(f"[Task {self.request.id}] Message {message_id} failed: {exc}")

        # Failsafe status update
        db.rollback()
        msg = db.query(Message).filter(Message.id == message_id).first()
        if msg:
            msg.status = MessageStatus.FAILED
            msg.error_detail = str(exc)
            db.commit()

        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
