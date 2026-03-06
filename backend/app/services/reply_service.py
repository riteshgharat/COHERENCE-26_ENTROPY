"""
Reply Service – stub for Phase 1. Full implementation in Phase 2.
"""

from app.utils.logger import get_logger

log = get_logger("reply_service")


async def classify_reply(reply_text: str) -> str:
    """
    Classify an inbound reply. Phase 2 will use AI classification.
    Returns one of: interested, not_interested, referral, meeting_request, ignore
    """
    log.info("Reply classification is a Phase 2 feature – returning 'interested' stub")
    return "interested"
