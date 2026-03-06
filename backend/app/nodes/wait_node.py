"""
Wait Node – introduces a delay between workflow steps.
Phase 2: will use Celery ETA for real async delays.
Phase 1: logs the configured delay and passes through.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.wait")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    In Phase 1 this is a no-op pass-through.
    Phase 2 will schedule a Celery task with an ETA.
    """
    delay_seconds = node_data.get("delay_seconds", 3600)
    log.info(f"Wait Node: configured delay = {delay_seconds}s (Phase 1: pass-through)")
    context["last_delay"] = delay_seconds
    return context
