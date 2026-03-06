"""LinkedIn Client – interacts with external NodeJS dummy Microservice."""

import os
import httpx
from app.utils.logger import get_logger

log = get_logger("integration.linkedin")

LINKEDIN_SERVICE_URL = os.getenv("LINKEDIN_SERVICE_URL", "http://localhost:3001")


async def send_linkedin_message(profile_url: str, message: str) -> bool:
    """Delivers message via the external Node.js LinkedIn microservice."""
    log.info(f"Sending LinkedIn message to {profile_url} via microservice...")

    payload = {"to": profile_url, "message": message}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{LINKEDIN_SERVICE_URL}/send", json=payload)
            response.raise_for_status()

            data = response.json()
            if data.get("success"):
                log.info(f"LinkedIn message dispatched successfully to {profile_url}")
                return True
            else:
                log.error(f"LinkedIn service returned failure: {data.get('error')}")
                return False

    except Exception as e:
        log.error(
            f"Error communicating with LinkedIn service at {LINKEDIN_SERVICE_URL}: {e}"
        )
        return False


async def send_linkedin_connection(profile_url: str, message: str = None) -> bool:
    """Sends connection request via the external Node.js LinkedIn microservice."""
    log.info(f"Sending LinkedIn connection to {profile_url} via microservice...")

    payload = {"to": profile_url, "message": message}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{LINKEDIN_SERVICE_URL}/connect", json=payload
            )
            response.raise_for_status()

            data = response.json()
            if data.get("success"):
                log.info(f"LinkedIn connection sent successfully to {profile_url}")
                return True
            else:
                log.error(f"LinkedIn service returned failure: {data.get('error')}")
                return False

    except Exception as e:
        log.error(f"Error communicating with LinkedIn service during connect: {e}")
        return False
