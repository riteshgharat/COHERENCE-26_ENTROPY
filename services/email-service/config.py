import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASS: str
    SMTP_USE_TLS: bool = True

    IMAP_HOST: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    IMAP_USER: str | None = None
    IMAP_PASS: str | None = None
    IMAP_USE_SSL: bool = True

    PORT: int = 3002
    CHECK_INTERVAL: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

    def __init__(self, **values):
        super().__init__(**values)
        self.SMTP_USER = self.SMTP_USER or os.getenv("SMTP_USERNAME", "")
        self.SMTP_PASS = self.SMTP_PASS or os.getenv("SMTP_PASSWORD", "")
        self.IMAP_USER = self.IMAP_USER or self.SMTP_USER
        self.IMAP_PASS = self.IMAP_PASS or self.SMTP_PASS

settings = Settings()