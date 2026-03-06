"""LinkedIn Client – stub for Phase 2."""

from app.utils.logger import get_logger

log = get_logger("integration.linkedin")


async def send_linkedin_message(profile_url: str, message: str) -> bool:
    log.info(f"Simulating LinkedIn message to {profile_url}")
    log.debug(f"LinkedIn body: {message[:50]}...")
    return True
