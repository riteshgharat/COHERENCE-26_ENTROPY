"""
Safety Throttle – in-memory rate limiter for message sending.
Enforces daily limits per channel to prevent spam detection.
"""

import threading
from datetime import datetime, date
from typing import Dict
from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger("throttle")
settings = get_settings()

# Thread-safe lock
_lock = threading.Lock()

# Counters: {date_str: {channel: count}}
_counters: Dict[str, Dict[str, int]] = {}

# Channel limits from config
LIMITS = {
    "email": settings.EMAIL_DAILY_LIMIT,
    "linkedin": settings.LINKEDIN_DAILY_LIMIT,
    "whatsapp": settings.WHATSAPP_DAILY_LIMIT,
}


def _today() -> str:
    return date.today().isoformat()


def can_send(channel: str) -> bool:
    """Check if we can send another message on this channel today."""
    channel = channel.lower()
    limit = LIMITS.get(channel, 100)

    with _lock:
        today = _today()
        if today not in _counters:
            _counters.clear()  # Auto-reset old days
            _counters[today] = {}

        current = _counters[today].get(channel, 0)
        allowed = current < limit
        if not allowed:
            log.warning(f"Throttle: {channel} daily limit reached ({current}/{limit})")
        return allowed


def record_send(channel: str):
    """Record that a message was sent on this channel."""
    channel = channel.lower()
    with _lock:
        today = _today()
        if today not in _counters:
            _counters.clear()
            _counters[today] = {}
        _counters[today][channel] = _counters[today].get(channel, 0) + 1
        log.debug(
            f"Throttle: {channel} count = {_counters[today][channel]}/{LIMITS.get(channel, 100)}"
        )


def get_counts() -> Dict[str, int]:
    """Get current day's send counts per channel."""
    with _lock:
        today = _today()
        return dict(_counters.get(today, {}))
