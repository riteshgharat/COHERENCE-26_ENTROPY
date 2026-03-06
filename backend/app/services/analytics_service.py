"""
Analytics Service – computes campaign metrics.
Phase 1: basic counts. Phase 3 will add time-series and channel breakdowns.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Lead, Message, MessageStatus, WorkflowExecution, ExecutionStatus
from app.utils.logger import get_logger

log = get_logger("analytics_service")


def get_dashboard_stats(db: Session) -> dict:
    """Return high-level campaign metrics."""
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    messages_sent = (
        db.query(func.count(Message.id))
        .filter(Message.status == MessageStatus.SENT)
        .scalar()
        or 0
    )
    messages_failed = (
        db.query(func.count(Message.id))
        .filter(Message.status == MessageStatus.FAILED)
        .scalar()
        or 0
    )
    replies = (
        db.query(func.count(Message.id))
        .filter(Message.status == MessageStatus.REPLIED)
        .scalar()
        or 0
    )

    total_executions = db.query(func.count(WorkflowExecution.id)).scalar() or 0
    completed_executions = (
        db.query(func.count(WorkflowExecution.id))
        .filter(WorkflowExecution.status == ExecutionStatus.COMPLETED)
        .scalar()
        or 0
    )

    conversion_rate = (
        round((replies / messages_sent * 100), 2) if messages_sent > 0 else 0.0
    )

    return {
        "leads": total_leads,
        "messages_sent": messages_sent,
        "messages_failed": messages_failed,
        "replies": replies,
        "conversion_rate": conversion_rate,
        "total_executions": total_executions,
        "completed_executions": completed_executions,
    }
