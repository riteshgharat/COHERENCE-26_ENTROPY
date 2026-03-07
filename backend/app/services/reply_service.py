"""
Reply Service – AI-powered classification of inbound messages.
"""

from app.utils.logger import get_logger
from app.config import get_settings

log = get_logger("reply_service")
settings = get_settings()


async def classify_reply(reply_text: str) -> str:
    """
    Classifies an inbound reply using Groq (or fallback logic).
    Returns one of: interested, not_interested, replied (neutral)
    """
    text = reply_text.lower()

    if settings.GROQ_API_KEY:
        try:
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            prompt = (
                "You are classifying an email reply from a sales prospect. "
                "Classify the following text into exactly one of these three categories: "
                "'interested', 'not_interested', or 'replied' (for neutral/other queries). "
                "Output ONLY the category name, nothing else.\n\n"
                f"Reply: '{reply_text}'"
            )
            chat_completion = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=settings.AI_MODEL,
                temperature=0.1,
            )
            classification = chat_completion.choices[0].message.content.strip().lower()
            if classification in ["interested", "not_interested"]:
                return classification
            return "replied"
        except Exception as e:
            log.error(f"AI classification failed, using fallback rules: {e}")

    # Fallback Rules
    if any(
        word in text
        for word in ["unsubscribe", "remove", "not interested", "stop", "no thanks"]
    ):
        return "not_interested"
    if any(
        word in text
        for word in ["yes", "interested", "more info", "call", "demo", "pricing"]
    ):
        return "interested"

    return "replied"
