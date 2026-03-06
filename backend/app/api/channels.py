"""
Channels API – channel status & connection endpoints.
Phase 1: Email only. Phase 2: LinkedIn, WhatsApp.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import get_settings
from app.schemas.message_schema import ChannelStatusResponse
from app.models.message import MessageChannel
from app.utils.logger import get_logger

router = APIRouter(prefix="/channels", tags=["Channels"])
log = get_logger("api.channels")
settings = get_settings()


@router.get("/status")
def get_channel_status():
    """Return connection status for all channels."""
    return [
        ChannelStatusResponse(
            channel=MessageChannel.EMAIL,
            connected=bool(settings.SMTP_HOST),
            daily_sent=0,  # Phase 2: query Redis counter
            daily_limit=settings.EMAIL_DAILY_LIMIT,
        ),
        ChannelStatusResponse(
            channel=MessageChannel.LINKEDIN,
            connected=False,  # Phase 2
            daily_sent=0,
            daily_limit=settings.LINKEDIN_DAILY_LIMIT,
        ),
        ChannelStatusResponse(
            channel=MessageChannel.WHATSAPP,
            connected=False,  # Phase 2
            daily_sent=0,
            daily_limit=settings.WHATSAPP_DAILY_LIMIT,
        ),
    ]
