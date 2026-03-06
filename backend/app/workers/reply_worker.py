"""
Reply Worker – polls for inbound replies and classifies them.
Phase 2: full implementation. Phase 1: stub.
"""

from app.workers.celery_app import celery_app
from app.utils.logger import get_logger

log = get_logger("worker.reply")


@celery_app.task(bind=True, name="reply.check", max_retries=1)
def check_replies_task(self):
    """
    Celery periodic task to scan for new replies.
    Phase 2 will add inbox polling, AI classification, and status updates.
    """
    log.info(f"[Task {self.request.id}] Reply check (Phase 2 stub)")
    return {"checked": 0, "new_replies": 0}
