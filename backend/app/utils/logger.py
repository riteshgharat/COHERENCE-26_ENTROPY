"""
Structured logging with loguru.
Provides a pre-configured logger used across the application.
"""

import sys
from loguru import logger

# Remove default handler
logger.remove()

# Console handler – human-readable
logger.add(
    sys.stdout,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> – "
        "<level>{message}</level>"
    ),
    level="DEBUG",
    colorize=True,
)

# File handler – JSON for structured queries
logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO",
    serialize=True,
)


def get_logger(name: str = __name__):
    return logger.bind(module=name)
