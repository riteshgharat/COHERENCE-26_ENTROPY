import aioimaplib
import aiosmtplib
import email
import email.utils
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional, Dict
from config import settings
import asyncio
import logging
import httpx
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
            # Port 587 requires start_tls=True, not use_tls=True (which is for 465)
            is_starttls = self.settings.SMTP_PORT == 587
            await aiosmtplib.send(
                msg,
                hostname=self.settings.SMTP_HOST,
                port=self.settings.SMTP_PORT,
                username=self.settings.SMTP_USER,
                password=self.settings.SMTP_PASS,
                use_tls=self.settings.SMTP_USE_TLS if not is_starttls else False,
                start_tls=is_starttls
            )
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"SMTP Error: {e}")
            return False

    async def poll_and_report_replies(self, backend_webhook_url: str) -> int:
        """
        Fetch UNSEEN emails, detect replies (In-Reply-To header or Re: subject),
        POST each to the backend webhook, then mark them as read.
        Returns the count of replies successfully reported.
        """
        try:
            client = await self._connect_imap()
            await client.select("INBOX")

            res, data = await client.search("UNSEEN")
            if res != "OK" or not data[0]:
                return 0

            msg_ids = data[0].split()
            reported = 0

            for msg_id in msg_ids:
                res, msg_data = await client.fetch(msg_id, "RFC822")
                if res != "OK":
                    continue

                raw_email = msg_data[1]
                parsed = email.message_from_bytes(raw_email)

                subject = parsed.get("Subject", "")
                in_reply_to = parsed.get("In-Reply-To", "")
                from_addr = email.utils.parseaddr(parsed.get("From", ""))[1]

                # Only forward genuine replies
                is_reply = bool(in_reply_to) or subject.strip().lower().startswith("re:")
                if not is_reply:
                    continue

                # Extract plain-text body
                body = ""
                if parsed.is_multipart():
                    for part in parsed.walk():
                        if (
                            part.get_content_type() == "text/plain"
                            and "attachment" not in str(part.get("Content-Disposition"))
                        ):
                            try:
                                body = part.get_payload(decode=True).decode(errors="replace")
                            except Exception:
                                pass
                            break
                else:
                    try:
                        body = parsed.get_payload(decode=True).decode(errors="replace")
                    except Exception:
                        pass

                if not body:
                    body = subject  # fallback so webhook has something to store

                payload = {
                    "channel": "email",
                    "email": from_addr,
                    "body": body.strip(),
                }

                try:
                    async with httpx.AsyncClient(timeout=10) as http:
                        resp = await http.post(backend_webhook_url, json=payload)
                        if resp.status_code == 200:
                            reported += 1
                            await client.store(msg_id, "+FLAGS", "\\Seen")
                            data_json = resp.json()
                            logger.info(
                                f"Reported reply from {from_addr} → lead {data_json.get('lead_id')}"
                            )
                        elif resp.status_code == 404:
                            # No matching lead – mark read to avoid re-processing
                            await client.store(msg_id, "+FLAGS", "\\Seen")
                            logger.warning(f"No lead found for reply from {from_addr}; marked read")
                        else:
                            logger.error(
                                f"Backend webhook returned HTTP {resp.status_code} for {from_addr}"
                            )
                except Exception as exc:
                    logger.error(f"Failed to POST reply from {from_addr} to backend: {exc}")

            return reported

        except Exception as exc:
            logger.error(f"Error during reply poll: {exc}")
            self.imap_client = None  # force reconnect on next poll
            return 0

    async def close(self):
        if self.imap_client:
            await self.imap_client.logout()
            self.imap_client = None

email_client = EmailClient()