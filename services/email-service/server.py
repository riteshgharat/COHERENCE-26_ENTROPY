from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from email_handler import email_client
from config import settings
import uvicorn
import asyncio
import logging

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    yield
    # Shutdown logic
    await email_client.close()

app = FastAPI(title="Email Microservice", lifespan=lifespan)

# Add CORS middleware to allow cross-origin requests from frontend orchestrator
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # Simulate a human typing delay (e.g. 50ms per character, min 1s, max 8s)
    typing_delay = max(min(len(req.content) * 0.05, 8.0), 1.0)
    logger.info(f"Simulating human typing... waiting {typing_delay:.2f} seconds before sending email.")
    await asyncio.sleep(typing_delay)

    success = await email_client.send_response(
        to_email=req.to_email,
        subject=req.subject,
        content=req.content,
        thread_id=req.thread_id
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    return {"status": "success", "message": f"Email sent to {req.to_email}"}


class BroadcastRequest(BaseModel):
    leads: Optional[List[dict]] = None
    subject: str
    message: str
    backendUrl: Optional[str] = None

@app.post("/broadcast")
async def broadcast_email(req: BroadcastRequest):
    import  httpx
    
    leads = req.leads
    if not leads:
        url = req.backendUrl or "http://127.0.0.1:8000"
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{url}/api/v1/leads/?page_size=100")
                res.raise_for_status()
                data = res.json()
                leads = data.get("leads", [])
        except Exception as e:
            logger.error(f"Failed to fetch leads: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch leads from backend")
    
    results = {
        "total": len(leads),
        "successful": 0,
        "failed": 0,
        "details": []
    }
    
    for lead in leads:
        email_addr = lead.get("email")
        if not email_addr:
            results["failed"] += 1
            results["details"].append({"id": lead.get("id"), "name": lead.get("name"), "error": "No email provided"})
            continue
            
        personalized_message = req.message
        if lead.get("name"):
            personalized_message = personalized_message.replace("{name}", lead.get("name")).replace("{NAME}", lead.get("name"))
        if lead.get("company"):
            personalized_message = personalized_message.replace("{company}", lead.get("company")).replace("{COMPANY}", lead.get("company"))
            
        # Simulate typing for each lead
        typing_delay = max(min(len(personalized_message) * 0.05, 8.0), 1.0)
        logger.info(f"Simulating human typing... waiting {typing_delay:.2f} s for {email_addr}")
        await asyncio.sleep(typing_delay)
        
        success = await email_client.send_response(
            to_email=email_addr,
            subject=req.subject,
            content=personalized_message
        )
        
        if success:
            results["successful"] += 1
            results["details"].append({"id": lead.get("id"), "email": email_addr, "status": "success"})
        else:
            results["failed"] += 1
            results["details"].append({"id": lead.get("id"), "email": email_addr, "status": "failed"})
            
    return {"success": True, "results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
