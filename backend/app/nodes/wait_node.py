"""
Wait Node – introduces a delay between workflow steps.
Phase 2: will use Celery ETA for real async delays.
Phase 1: logs the configured delay and passes through.
"""

import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.wait")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Pause execution for a specific duration.
    Calculates the target timestamp and passes it to the engine via context.
    The engine handles Celery task scheduling.
    """
    # Use config or default to 1 day if not specified.
    delay_seconds = node_data.get("delay_seconds", 86400)

    # Calculate target time for resume
    resume_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=delay_seconds)

    log.info(f"Wait Node: Pausing workflow execution until {resume_at}")

    # Passing _pause_until tells WorkflowEngine to pause and schedule a retry
    context["_pause_until"] = resume_at
    context["last_delay"] = delay_seconds

    return context
