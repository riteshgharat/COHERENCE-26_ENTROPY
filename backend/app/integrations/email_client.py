"""
Email Client – sends emails via SMTP.
Supports TLS and async sending via aiosmtplib.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger("integration.email")
settings = get_settings()


async def send_email(
    to_address: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None,
) -> bool:
    """
    Send an email via SMTP.
    Uses synchronous smtplib for Phase 1 reliability.
    Phase 2 can swap to aiosmtplib for async.
    """
    if not settings.SMTP_HOST:
        log.warning(
            "SMTP_HOST not configured – email sending is disabled (dry-run mode)"
        )
        log.info(f"[DRY-RUN] Email to={to_address} subject='{subject}'")
        return True  # Pretend it worked for dev/testing

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_address
    msg["Subject"] = subject

    # Plain text part
    msg.attach(MIMEText(body, "plain"))

    # HTML part (optional)
    if html_body:
        msg.attach(MIMEText(html_body, "html"))

    try:
        if settings.SMTP_USE_TLS:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.ehlo()
            server.starttls()
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)

        if settings.SMTP_USERNAME:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

        server.sendmail(settings.SMTP_FROM, to_address, msg.as_string())
        server.quit()

        log.info(f"Email sent successfully to {to_address}")
        return True

    except Exception as e:
        log.error(f"Email send failed to {to_address}: {e}")
        raise
