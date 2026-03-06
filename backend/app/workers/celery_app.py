"""
Celery application factory.
Configures broker (Redis), result backend, and task auto-discovery.
"""

from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "outreach_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Auto-discover task modules
    include=[
        "app.workers.workflow_worker",
        "app.workers.messaging_worker",
        "app.workers.reply_worker",
    ],
)
