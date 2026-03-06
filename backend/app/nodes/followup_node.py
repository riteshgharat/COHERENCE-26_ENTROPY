"""
Follow-up Node – generates follow-up messages for non-responsive leads.
Phase 2: full implementation. Phase 1: stub.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.followup")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    log.info("Follow-up Node: stub (Phase 2 feature)")
    return context
