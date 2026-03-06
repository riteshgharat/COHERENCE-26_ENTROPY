from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from .email_handler import email_client
from .config import settings
import uvicorn
import asyncio
import logging

app = FastAPI(title="Email Microservice")
logger = logging.getLogger(__name__)

class SendEmailRequest(BaseModel):
    to_email: str
    subject: str
    content: str
    thread_id: Optional[str] = None

@app.get("/health")
async def health():
    return {"status": "ok", "service": "email-service"}

@app.get("/fetch-unread")
async def fetch_unread():
    """Fetch unread emails."""
    try:
        emails = await email_client.fetch_unread_emails()
        return {"emails": emails}
    except Exception as e:
        logger.error(f"Error fetching emails: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send")
async def send_email(req: SendEmailRequest):
    """Send an email."""
    success = await email_client.send_response(
        to_email=req.to_email,
        subject=req.subject,
        content=req.content,
        thread_id=req.thread_id
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    return {"status": "success", "message": f"Email sent to {req.to_email}"}

@app.on_event("shutdown")
async def shutdown_event():
    await email_client.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
