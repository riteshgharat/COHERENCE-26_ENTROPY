"""WhatsApp Client – interacts with external NodeJS Microservice."""

import os
import httpx
from app.utils.logger import get_logger

log = get_logger("integration.whatsapp")

WHATSAPP_SERVICE_URL = os.getenv("WHATSAPP_SERVICE_URL", "http://localhost:3000")


async def send_whatsapp_message(phone: str, message: str) -> bool:
    """Delivers message via the external Node.js WhatsApp microservice."""
    log.info(f"Sending WhatsApp message to {phone} via NodeJS microservice...")

    # Strip any non-numeric characters just in case, typical for WhatsApp APIs
    phone_clean = "".join(filter(str.isdigit, phone))

    payload = {"to": phone_clean, "message": message}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(f"{WHATSAPP_SERVICE_URL}/send", json=payload)
            response.raise_for_status()

            data = response.json()
            if data.get("success"):
                log.info(f"WhatsApp message dispatched successfully to {phone_clean}")
                return True
            else:
                log.error(f"WhatsApp service returned failure: {data.get('error')}")
                return False

    except httpx.RequestError as e:
        log.error(
            f"Failed to connect to WhatsApp microservice at {WHATSAPP_SERVICE_URL}: {e}"
        )
        # In a real system, we might queue this for retry. For now, fail gracefully.
        return False
    except Exception as e:
        log.error(f"Unexpected error in WhatsApp client: {e}")
        return False
