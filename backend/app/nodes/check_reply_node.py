"""
Check Reply Node – detects whether leads have replied.
Phase 2: will poll inboxes and classify replies with AI.
Phase 1: stub pass-through.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.check_reply")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    log.info("Check Reply Node: stub (Phase 2 feature)")
    context["replies"] = []
    return context
