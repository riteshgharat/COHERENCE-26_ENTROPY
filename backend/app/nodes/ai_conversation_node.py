"""
AI Conversation Node – auto-replies on behalf of the user.
Phase 3: full implementation. Phase 1: stub.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.ai_conversation")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    log.info("AI Conversation Node: stub (Phase 3 feature)")
    return context
