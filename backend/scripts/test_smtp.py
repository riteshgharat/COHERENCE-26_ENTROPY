import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.integrations.email_client import send_email
from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger("test_credentials")


async def test_smtp():
    settings = get_settings()
    log.info(
        f"Testing SMTP with Host: {settings.SMTP_HOST}, Port: {settings.SMTP_PORT}, User: {settings.SMTP_USERNAME}"
    )

    if not settings.SMTP_HOST:
        log.error("SMTP_HOST is not set in .env")
        return False

    try:
        # We try to send a test email to the 'From' address as a loopback test
        success = await send_email(
            to_address=settings.SMTP_FROM,
            subject="SMTP Credential Test",
            body="If you are reading this, your SMTP credentials in the AI Outreach Platform are working correctly!",
        )
        if success:
            log.info("✅ SMTP test successful!")
            return True
        else:
            log.error("❌ SMTP test failed (returned False).")
            return False
    except Exception as e:
        log.error(f"❌ SMTP test failed with error: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_smtp())
