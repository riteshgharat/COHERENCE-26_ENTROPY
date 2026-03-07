"""
Application configuration loaded from environment variables.
Uses pydantic-settings for type-safe config with .env support.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # ── App ──
    APP_NAME: str = "AI Outreach Backend"
    APP_ENV: str = "development"
    API_PORT: int = 3000
    DEBUG: bool = True

    # ── Database ──
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/app"

    # ── Redis ──
    REDIS_URL: str = "redis://redis:6379/0"

    # ── SMTP / Email ──
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@example.com"
    SMTP_USE_TLS: bool = True

    # ── AI Providers ──
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    AI_MODEL: str = "llama-3.3-70b-versatile"  # default Groq model

    # ── Google Sheets ──
    GOOGLE_SHEETS_CREDENTIALS_FILE: Optional[str] = None

    # ── Celery ──
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # ── Throttling defaults ──
    EMAIL_DAILY_LIMIT: int = 100
    LINKEDIN_DAILY_LIMIT: int = 40
    WHATSAPP_DAILY_LIMIT: int = 50

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
