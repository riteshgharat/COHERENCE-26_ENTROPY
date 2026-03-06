"""
Analytics Service – computes campaign metrics.
Phase 1: basic counts. Phase 3 will add time-series and channel breakdowns.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.models import Lead, Message, MessageStatus, WorkflowExecution, ExecutionStatus
from app.models.campaign import Campaign, CampaignStatus
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

    # Calculate channel performance
    channel_performance_query = (
        db.query(Message.channel, Message.status, func.count(Message.id))
        .group_by(Message.channel, Message.status)
        .all()
    )

    channel_performance = {}
    for channel, status, count in channel_performance_query:
        if not channel:
            continue
        channel_name = channel.value if hasattr(channel, "value") else str(channel)
        status_name = status.value if hasattr(status, "value") else str(status)

        if channel_name not in channel_performance:
            channel_performance[channel_name] = {
                "sent": 0,
                "failed": 0,
                "replied": 0,
                "pending": 0,
            }

        if status_name in channel_performance[channel_name]:
            channel_performance[channel_name][status_name] += count
        else:
            channel_performance[channel_name][status_name] = count

    return {
        "leads": total_leads,
        "messages_sent": messages_sent,
        "messages_failed": messages_failed,
        "replies": replies,
        "conversion_rate": conversion_rate,
        "total_executions": total_executions,
        "completed_executions": completed_executions,
        "channel_performance": channel_performance,
        "recent_activity": _get_recent_activity(db),
        "active_campaigns": _get_active_campaigns(db),
        "daily_chart": _get_daily_chart(db),
    }


def _get_recent_activity(db: Session, limit: int = 6) -> list:
    """Return the most recent messages for the live activity feed."""
    msgs = (
        db.query(Message)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for m in msgs:
        lead = m.lead
        ago = _time_ago(m.created_at)
        status_map = {
            MessageStatus.SENT: "success",
            MessageStatus.DELIVERED: "success",
            MessageStatus.REPLIED: "success",
            MessageStatus.FAILED: "destructive",
            MessageStatus.PENDING: "warning",
        }
        action_map = {
            MessageStatus.SENT: f"{m.channel.value.title()} message sent",
            MessageStatus.DELIVERED: f"{m.channel.value.title()} delivered",
            MessageStatus.REPLIED: "Replied",
            MessageStatus.FAILED: f"{m.channel.value.title()} failed",
            MessageStatus.PENDING: "Pending",
        }
        result.append({
            "id": str(m.id),
            "lead": lead.name if lead else "Unknown",
            "company": lead.company if lead else "",
            "action": action_map.get(m.status, str(m.status)),
            "time": ago,
            "status": status_map.get(m.status, "info"),
        })
    return result


def _get_active_campaigns(db: Session) -> list:
    """Return campaigns with running/paused status for dashboard."""
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.status.in_([CampaignStatus.RUNNING, CampaignStatus.PAUSED]))
        .order_by(Campaign.updated_at.desc())
        .limit(4)
        .all()
    )
    return [
        {
            "name": c.name,
            "leads": c.leads_total,
            "progress": c.progress,
            "status": c.status.value,
        }
        for c in campaigns
    ]


def _get_daily_chart(db: Session) -> list:
    """Return sent/reply counts per day for the past 7 days."""
    today = datetime.utcnow().date()
    days = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        sent = (
            db.query(func.count(Message.id))
            .filter(
                cast(Message.created_at, Date) == d,
                Message.status == MessageStatus.SENT,
            )
            .scalar()
            or 0
        )
        replied = (
            db.query(func.count(Message.id))
            .filter(
                cast(Message.created_at, Date) == d,
                Message.status == MessageStatus.REPLIED,
            )
            .scalar()
            or 0
        )
        days.append({
            "name": day_names[d.weekday()],
            "sent": sent,
            "replies": replied,
        })
    return days


def _time_ago(dt: datetime) -> str:
    """Human-readable relative time."""
    if not dt:
        return ""
    diff = datetime.utcnow() - dt
    mins = int(diff.total_seconds() / 60)
    if mins < 1:
        return "Just now"
    if mins < 60:
        return f"{mins}m ago"
    hrs = mins // 60
    if hrs < 24:
        return f"{hrs}h ago"
    days = hrs // 24
    return f"{days}d ago"
