"""LinkedIn Client – stub for Phase 2."""

from app.utils.logger import get_logger

log = get_logger("integration.linkedin")


async def send_linkedin_message(profile_url: str, message: str) -> bool:
    log.warning("LinkedIn integration not yet implemented (Phase 2)")
    return False
