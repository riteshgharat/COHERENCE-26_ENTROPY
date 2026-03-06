"""
AI Service – abstracts Groq / Gemini LLM calls for message generation.
Phase 1: provides a generate_message helper used by the AI Message node.
"""

from typing import Optional, Dict, Any
from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger("ai_service")
settings = get_settings()


# ── Prompt Templates ──

OUTREACH_PROMPT = """You are a professional outreach assistant.
Write a personalized outreach message based on the following lead information and user instructions.

Lead Info:
- Name: {name}
- Company: {company}
- Industry: {industry}
- Title: {title}

User Instructions / Tone: {tone}
Sample Message (for style reference): {sample_message}

Requirements:
- Keep it concise (3-5 sentences)
- Sound human, not robotic
- Include a clear call to action
- Do NOT use generic filler

Output ONLY the message body, no subject line or signature.
"""


async def generate_message(
    lead_data: Dict[str, Any],
    tone: str = "professional and friendly",
    sample_message: str = "",
    provider: str = "groq",
) -> str:
    """
    Generate a personalised outreach message for a lead.
    Falls back to a template if no API key configured.
    """
    prompt = OUTREACH_PROMPT.format(
        name=lead_data.get("name", "there"),
        company=lead_data.get("company", "your company"),
        industry=lead_data.get("industry", "your industry"),
        title=lead_data.get("title", ""),
        tone=tone,
        sample_message=sample_message or "N/A",
    )

    try:
        if provider == "groq" and settings.GROQ_API_KEY:
            return await _call_groq(prompt)
        elif provider == "gemini" and settings.GEMINI_API_KEY:
            return await _call_gemini(prompt)
        else:
            log.warning("No AI API key configured – using template fallback")
            return _template_fallback(lead_data, tone)
    except Exception as e:
        log.error(f"AI generation failed: {e}")
        return _template_fallback(lead_data, tone)


async def _call_groq(prompt: str) -> str:
    from groq import Groq

    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()


async def _call_gemini(prompt: str) -> str:
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text.strip()


def _template_fallback(lead_data: Dict[str, Any], tone: str) -> str:
    name = lead_data.get("name", "there")
    company = lead_data.get("company", "your company")
    return (
        f"Hi {name},\n\n"
        f"I came across {company} and was impressed by what you're building. "
        f"I'd love to explore how we might collaborate.\n\n"
        f"Would you be open to a quick chat this week?\n\n"
        f"Best regards"
    )
