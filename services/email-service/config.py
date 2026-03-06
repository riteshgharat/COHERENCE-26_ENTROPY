import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # SMTP Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "True").lower() == "true"

    # IMAP Settings
    IMAP_HOST: str = os.getenv("IMAP_HOST", "localhost")
    IMAP_PORT: int = int(os.getenv("IMAP_PORT", "993"))
    IMAP_USER: str = os.getenv("IMAP_USER", "")
    IMAP_PASS: str = os.getenv("IMAP_PASS", "")
    IMAP_USE_SSL: bool = os.getenv("IMAP_USE_SSL", "True").lower() == "true"

    # Service Settings
    PORT: int = int(os.getenv("PORT", "3002"))
    CHECK_INTERVAL: int = int(os.getenv("CHECK_INTERVAL", "60")) # seconds

settings = Settings()
