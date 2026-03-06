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


CONVERSATION_PROMPT = """You are an AI sales assistant responding on behalf of the user.
Write a human-like, helpful reply to a prospect's most recent message.

Lead Info:
- Name: {name}
- Company: {company}

Previous message sent to lead:
{previous_outbound}

Lead's reply:
{lead_reply}

Instructions from user: {instructions}

Requirements:
- Keep the response short, conversational, and direct.
- Address any questions asked in the lead's reply.
- Provide a clear next step or call to action.
- Output ONLY the message body.
"""


async def generate_conversation_reply(
    lead_data: Dict[str, Any],
    previous_outbound: str,
    lead_reply: str,
    instructions: str = "Be polite, helpful, and suggest a 10-minute discovery call.",
    provider: str = "groq",
) -> str:
    """
    Generate an intelligent reply based on the conversation history.
    """
    prompt = CONVERSATION_PROMPT.format(
        name=lead_data.get("name", "there"),
        company=lead_data.get("company", "their company"),
        previous_outbound=previous_outbound,
        lead_reply=lead_reply,
        instructions=instructions,
    )

    try:
        if provider == "groq" and settings.GROQ_API_KEY:
            return await _call_groq(prompt)
        elif provider == "gemini" and settings.GEMINI_API_KEY:
            return await _call_gemini(prompt)
        else:
            log.warning("No AI API key configured for conversation reply")
            return f"Hi {lead_data.get('name', 'there')}, thanks for getting back to me! Let's schedule a call to discuss further."
    except Exception as e:
        log.error(f"AI conversation generation failed: {e}")
        return f"Thanks for your reply! Let's connect soon."


import json

WORKFLOW_GENERATOR_PROMPT = """You are an AI architect designing a workflow automation pipeline.
The user wants to create an outreach campaign. Convert their request into a valid JSON React Flow structure.

User Request: {prompt}

Available Node Types:
- start (Takes no inputs, always required as first node)
- lead_import (Usually second node)
- ai_message (Configure "tone" in data, e.g. {{"tone": "professional"}})
- channel_select (Configure "channel" in data: email, linkedin, whatsapp)
- send_message (No config needed)
- wait (Configure "delay_seconds" in data, e.g., 86400 for 1 day)
- check_reply (Checks if a reply was received)
- followup (Configure "tone" in data)
- ai_conversation (Configure "instructions" in data)
- update_sheets (Pushes data to sheets)
- analytics (Record a metric, configure "metric_name" in data)

Rules:
1. Return ONLY valid JSON block matching this exact schema. No markdown, no conversational text.
2. The JSON must contain "nodes" (list) and "edges" (list).
3. Every node needs an "id" (string integer, e.g., "1"), a "type" (from the list above), and a "data" (object) field.
4. Every edge needs a "source" (node id) and "target" (node id).
5. Ensure a logical linear sequence starting from "start".
"""


async def generate_agentic_workflow(
    prompt: str, provider: str = "groq"
) -> Dict[str, Any]:
    """
    Generate a JSON React Flow workflow from a natural language prompt.
    """
    system_prompt = WORKFLOW_GENERATOR_PROMPT.format(prompt=prompt)

    try:
        raw_response = ""
        if provider == "groq" and settings.GROQ_API_KEY:
            raw_response = await _call_groq(system_prompt)
        elif provider == "gemini" and settings.GEMINI_API_KEY:
            raw_response = await _call_gemini(system_prompt)
        else:
            log.warning("No AI API key configured for workflow generation")
            return _template_workflow_fallback()

        # Clean up in case the LLM returned markdown code blocks
        clean_json = raw_response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]

        return json.loads(clean_json.strip())

    except Exception as e:
        log.error(f"AI workflow generation failed: {e}. Falling back to template.")
        return _template_workflow_fallback()


def _template_workflow_fallback() -> Dict[str, Any]:
    return {
        "nodes": [
            {"id": "1", "type": "start", "data": {}},
            {"id": "2", "type": "lead_import", "data": {}},
            {"id": "3", "type": "ai_message", "data": {"tone": "professional"}},
            {"id": "4", "type": "channel_select", "data": {"channel": "email"}},
            {"id": "5", "type": "send_message", "data": {}},
        ],
        "edges": [
            {"source": "1", "target": "2"},
            {"source": "2", "target": "3"},
            {"source": "3", "target": "4"},
            {"source": "4", "target": "5"},
        ],
    }
