import aioimaplib
import aiosmtplib
import email
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional, Dict
from .config import settings
import asyncio
import logging
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailClient:
    def __init__(self):
        self.settings = settings
        self.imap_client: Optional[aioimaplib.IMAP4_SSL] = None

    async def _connect_imap(self):
        try:
            if not self.imap_client:
                self.imap_client = aioimaplib.IMAP4_SSL(
                    host=self.settings.IMAP_HOST, 
                    port=self.settings.IMAP_PORT
                )
                await self.imap_client.wait_hello_from_server()
                await self.imap_client.login(self.settings.IMAP_USER, self.settings.IMAP_PASS)
            return self.imap_client
        except Exception as e:
            logger.error(f"IMAP Connection Error: {e}")
            self.imap_client = None
            raise

    async def fetch_unread_emails(self) -> List[Dict]:
        """Fetch unread emails from the inbox."""
        client = await self._connect_imap()
        await client.select("INBOX")
        
        # Search for unread emails
        res, data = await client.search("UNSEEN")
        if res != "OK" or not data[0]:
            return []
        
        msg_ids = data[0].split()
        emails = []
        
        for msg_id in msg_ids:
            res, msg_data = await client.fetch(msg_id, "RFC822")
            if res != "OK":
                continue
            
            raw_email = msg_data[1]
            msg = email.message_from_bytes(raw_email)
            
            # Extract basic info
            email_info = {
                "id": msg_id.decode(),
                "from": msg.get("From"),
                "to": msg.get("To"),
                "subject": msg.get("Subject"),
                "date": msg.get("Date"),
                "body": "",
                "snippet": ""
            }
            
            # Extract body
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        email_info["body"] = part.get_payload(decode=True).decode()
                        break
            else:
                email_info["body"] = msg.get_payload(decode=True).decode()
            
            # Create snippet
            email_info["snippet"] = email_info["body"][:200]
            emails.append(email_info)
            
        return emails

    async def send_response(self, to_email: str, subject: str, content: str, thread_id: Optional[str] = None):
        """Send an email response (SMTP)."""
        msg = EmailMessage()
        msg["From"] = self.settings.SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject if subject.startswith("Re:") else f"Re: {subject}"
        
        if thread_id:
            msg["In-Reply-To"] = thread_id
            msg["References"] = thread_id

        msg.set_content(content)
        
        try:
            await aiosmtplib.send(
                msg,
                hostname=self.settings.SMTP_HOST,
                port=self.settings.SMTP_PORT,
                username=self.settings.SMTP_USER,
                password=self.settings.SMTP_PASS,
                use_tls=self.settings.SMTP_USE_TLS
            )
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"SMTP Error: {e}")
            return False

    async def close(self):
        if self.imap_client:
            await self.imap_client.logout()
            self.imap_client = None

email_client = EmailClient()
