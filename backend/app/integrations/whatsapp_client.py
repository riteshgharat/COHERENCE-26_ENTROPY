"""WhatsApp Client – stub for Phase 2."""

from app.utils.logger import get_logger

log = get_logger("integration.whatsapp")


async def send_whatsapp_message(phone: str, message: str) -> bool:
    log.warning("WhatsApp integration not yet implemented (Phase 2)")
    return False
