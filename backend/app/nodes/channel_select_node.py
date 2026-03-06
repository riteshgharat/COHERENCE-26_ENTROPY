"""
Channel Select Node – sets the target communication channel.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.message import MessageChannel
from app.utils.logger import get_logger

log = get_logger("node.channel_select")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Set the channel for outbound messaging.
    Defaults to 'email' if not specified.
    """
    channel_str = node_data.get("channel", "email").lower()

    try:
        channel = MessageChannel(channel_str)
    except ValueError:
        log.warning(f"Unknown channel '{channel_str}' – defaulting to email")
        channel = MessageChannel.EMAIL

    context["channel"] = channel.value
    log.info(f"Channel Select Node: selected channel = {channel.value}")
    return context
