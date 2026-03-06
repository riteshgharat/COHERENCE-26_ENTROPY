"""
Reply Worker – polls for inbound replies and classifies them.
Phase 2: full implementation. Phase 1: stub.
"""

from app.workers.celery_app import celery_app
from app.utils.logger import get_logger

log = get_logger("worker.reply")


import asyncio
from app.workers.celery_app import celery_app
from app.utils.logger import get_logger
from app.database import SessionLocal

log = get_logger("worker.reply")


@celery_app.task(bind=True, name="reply.process_inbound", max_retries=2)
def process_inbound_reply_task(self, message_id: str):
    """
    Celery task to fetch a new inbound message, run it through AI classification,
    and update the underlying Lead status.
    """
    log.info(f"[Task {self.request.id}] Processing inbound reply {message_id}")
    db = SessionLocal()

    try:
        from app.models import Message, Lead, LeadStatus
        from app.services.reply_service import classify_reply

        msg = db.query(Message).filter(Message.id == message_id).first()
        if not msg:
            log.error(f"Message {message_id} not found in DB")
            return

        lead = db.query(Lead).filter(Lead.id == msg.lead_id).first()
        if not lead:
            log.error(f"Lead {msg.lead_id} not found")
            return

        # Run async classify_reply in celery thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        classification = loop.run_until_complete(classify_reply(msg.body))
        loop.close()

        # Update lead status based on classification
        prev_status = lead.status
        if classification == "interested":
            lead.status = LeadStatus.INTERESTED
        elif classification == "not_interested":
            lead.status = LeadStatus.NOT_INTERESTED
        else:
            lead.status = LeadStatus.REPLIED

        # Keep converted leads as converted
        if prev_status == LeadStatus.CONVERTED:
            lead.status = LeadStatus.CONVERTED

        db.commit()
        log.info(f"Lead {lead.email} updated to {lead.status}")

        # If lead is interested or replied, generate a contextual AI reply and send it
        if classification in ("interested", "replied"):
            try:
                from app.services.ai_service import generate_conversation_reply
                from app.services.message_service import send_message
                from app.models.message import MessageChannel, MessageDirection

                # Fetch conversation history for this lead
                history = (
                    db.query(Message)
                    .filter(Message.lead_id == lead.id)
                    .order_by(Message.created_at.asc())
                    .all()
                )
                conversation = [
                    {"role": "assistant" if m.direction == MessageDirection.OUTBOUND else "user",
                     "content": m.body}
                    for m in history if m.body
                ]

                loop2 = asyncio.new_event_loop()
                asyncio.set_event_loop(loop2)
                ai_reply = loop2.run_until_complete(
                    generate_conversation_reply(
                        lead_data={"name": lead.name, "email": lead.email, "company": lead.company},
                        conversation_history=conversation,
                    )
                )
                loop2.run_until_complete(
                    send_message(
                        db=db,
                        lead_id=lead.id,
                        channel=msg.channel,
                        body=ai_reply,
                        subject="Re: Following up",
                    )
                )
                loop2.close()
                log.info(f"AI conversation reply sent to {lead.email}")
            except Exception as conv_err:
                log.warning(f"AI conversation reply failed (non-fatal): {conv_err}")

        return {"message_id": message_id, "classification": classification}

    except Exception as exc:
        log.error(f"Failed to process reply {message_id}: {exc}")
        raise self.retry(exc=exc, countdown=10)
    finally:
        db.close()
