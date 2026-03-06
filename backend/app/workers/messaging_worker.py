"""
Messaging Worker – handles individual message dispatch tasks.
Phase 1: basic task. Phase 2: adds throttling, rate limiting.
"""

from app.workers.celery_app import celery_app
from app.utils.logger import get_logger

log = get_logger("worker.messaging")


@celery_app.task(bind=True, name="messaging.send", max_retries=3)
def send_message_task(self, message_id: str):
    """
    Celery task to send a single message by ID.
    Phase 1 stub – the actual sending happens inline in the workflow engine.
    Phase 2 will decouple this for throttling.
    """
    log.info(f"[Task {self.request.id}] Message task for {message_id} (Phase 1 stub)")
    return {"message_id": message_id, "status": "stub"}
