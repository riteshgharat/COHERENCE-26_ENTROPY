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

WORKFLOW_SYSTEM_PROMPT = """You are an expert sales automation architect. Generate a complete workflow pipeline as JSON.

=== CRITICAL RULE ===
You MUST generate real, specific, contextually relevant content for every field — NOT placeholder text like "...", "your message here", or generic filler. Read the user's prompt carefully and derive the tone, subject, sample_message, and instructions from the context they describe.

=== NODE TYPES (use EXACTLY these type strings) ===
- start           → First node always. data: {}
- end             → Last node always. data: {}
- lead_upload     → Import leads. data: {"label":"Import [Industry] Leads","industry":"<infer from prompt>","status":"new"}
- ai_message      → AI-writes message. data: {"label":"<action label>","tone":"<e.g. warm and direct, professional, casual>","sample_message":"<write a real 2-3 sentence sample outreach message matching the campaign context>","subject":"<write a real compelling email subject line matching the campaign>","provider":"groq"}
- send_message    → Send via channel. data: {"label":"<action label>","channel":"email|linkedin|whatsapp","subject":"<real subject or opening line matching the channel and campaign>"}
- delay           → Wait. data: {"label":"Wait <N> <unit>","delay_seconds":<number: 3600=1h, 86400=1d, 172800=2d, 604800=1w>}
- reply_check     → Branch on reply — MUST have exactly 2 outgoing edges with sourceHandle "yes"/"no". data: {"label":"Got Reply?","timeout_hours":<24-72>}
- follow_up       → AI follow-up. data: {"label":"Follow Up","tone":"<polite, persistent, brief>","max_attempts":<1-3>,"provider":"groq"}
- update_crm      → Log to Sheets. data: {"label":"Log to CRM","spreadsheet_id":"","worksheet_name":"Sheet1"}
- analytics       → Track metric. data: {"label":"Track Metrics","metric_name":"<specific metric name like 'whatsapp_reply_rate' or 'email_open_rate'>"}
- ai_conversation → AI auto-reply agent. data: {"label":"AI Reply Agent","instructions":"<write specific 2-3 sentence instructions: what the AI should do, what tone to use, what CTA to push, e.g. qualify interest, propose a demo call>","provider":"groq"}

=== CONTENT GENERATION RULES ===
For ai_message nodes:
  - tone: reflect the campaign's vibe (e.g. "warm and conversational" for WhatsApp, "professional and direct" for LinkedIn, "friendly and curious" for email)
  - sample_message: write a real 2-3 sentence outreach message template using {name} and {company} as variables, matching what the user's campaign is about
  - subject: write a real subject line relevant to the campaign (email only; for other channels write the opening line)

For send_message nodes:
  - subject: for email = compelling subject line; for linkedin/whatsapp = first line of message

For follow_up nodes:
  - tone: choose words that match the campaign context, e.g. "politely persistent", "brief and direct", "warm and curious"

For ai_conversation nodes:
  - instructions: write specific agent directives like "Act as a friendly sales rep for [product context]. Qualify the lead's interest in [topic]. If they're interested, suggest a 15-minute discovery call. Keep replies under 3 sentences."

For delay nodes:
  - choose delay_seconds based on channel: WhatsApp = shorter (3600-86400), email = longer (86400-259200)

=== JSON OUTPUT FORMAT ===
Return ONLY this JSON structure, no markdown, no extra text:
{"nodes":[{"id":"1","type":"start","data":{}}, ...],"edges":[{"source":"1","target":"2"}, ...]}

=== EXAMPLE (for a "WhatsApp sales outreach for SaaS leads" prompt) ===
{"nodes":[
  {"id":"1","type":"start","data":{}},
  {"id":"2","type":"lead_upload","data":{"label":"Import SaaS Leads","industry":"SaaS","status":"new"}},
  {"id":"3","type":"ai_message","data":{"label":"Generate WhatsApp Intro","tone":"warm, casual and direct","sample_message":"Hey {name}! I saw {company} is scaling fast — we help SaaS teams like yours automate outreach and book 3x more demos. Mind if I share how? 🚀","subject":"Quick intro about automating your outreach","provider":"groq"}},
  {"id":"4","type":"send_message","data":{"label":"Send WhatsApp Message","channel":"whatsapp","subject":"Hey {name}, quick question about {company}'s growth plans 👋"}},
  {"id":"5","type":"delay","data":{"label":"Wait 1 Day","delay_seconds":86400}},
  {"id":"6","type":"reply_check","data":{"label":"Got Reply?","timeout_hours":24}},
  {"id":"7","type":"ai_conversation","data":{"label":"AI Reply Agent","instructions":"Act as a friendly SaaS sales rep. Qualify the lead's interest in outreach automation. If they seem interested, suggest a 15-minute demo call. Keep replies conversational and under 3 sentences. Avoid being pushy.","provider":"groq"}},
  {"id":"8","type":"follow_up","data":{"label":"Send Follow Up","tone":"brief and curious","max_attempts":2,"provider":"groq"}},
  {"id":"9","type":"update_crm","data":{"label":"Log Engaged Leads","spreadsheet_id":"","worksheet_name":"SaaS Outreach"}},
  {"id":"10","type":"end","data":{}}
],"edges":[
  {"source":"1","target":"2"},{"source":"2","target":"3"},{"source":"3","target":"4"},
  {"source":"4","target":"5"},{"source":"5","target":"6"},
  {"source":"6","target":"7","sourceHandle":"yes"},
  {"source":"6","target":"8","sourceHandle":"no"},
  {"source":"7","target":"9"},{"source":"8","target":"9"},{"source":"9","target":"10"}
]}

Now generate a workflow that closely follows the example quality for the user's request.
"""


async def _call_llm_workflow(system: str, user: str, provider: str) -> str:
    """Call LLM with a system + user message pair for structured output."""
    # Always read settings fresh — lru_cache can hold a stale None if .env was
    # added after first import.  Re-instantiating is cheap enough here.
    from app.config import Settings
    live = Settings()

    if provider == "groq":
        if not live.GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is not set. "
                "Add it to backend/.env: GROQ_API_KEY=gsk_..."
            )
        from groq import Groq
        client = Groq(api_key=live.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=live.AI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.4,
            max_tokens=3000,
        )
        return response.choices[0].message.content.strip()
    elif provider == "gemini":
        if not live.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Add it to backend/.env: GEMINI_API_KEY=AIza..."
            )
        import google.generativeai as genai
        genai.configure(api_key=live.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")
        combined = f"{system}\n\nUser request: {user}"
        return model.generate_content(combined).text.strip()
    else:
        raise ValueError(f"Unknown provider '{provider}'. Use 'groq' or 'gemini'.")


def _extract_json(text: str) -> str:
    """Strip markdown fences and find the JSON object in text."""
    text = text.strip()
    for fence in ("```json", "```JSON", "```"):
        if text.startswith(fence):
            text = text[len(fence):]
            break
    if text.endswith("```"):
        text = text[:-3]
    # find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start:end + 1]
    return text.strip()


async def generate_agentic_workflow(
    prompt: str, provider: str = "groq"
) -> Dict[str, Any]:
    """
    Generate a JSON React Flow workflow from a natural language prompt.
    Returns {nodes: [...], edges: [...], name: str}
    Raises ValueError / RuntimeError with a human-readable message on failure
    (caller should convert to HTTP error — do NOT silently fall back).
    """
    user_msg = (
        f"User request: {prompt}\n\n"
        "Generate the workflow JSON now. "
        "IMPORTANT: For ai_message nodes write a real sample_message and subject based on this campaign context. "
        "For ai_conversation nodes write specific actionable instructions. "
        "For follow_up nodes choose a descriptive tone. "
        "Do NOT use '...' or generic placeholders anywhere — every field must have real content derived from the request above. "
        "Return ONLY the JSON object."
    )

    raw = await _call_llm_workflow(WORKFLOW_SYSTEM_PROMPT, user_msg, provider)
    log.debug(f"Raw LLM workflow response (first 400 chars): {raw[:400]}")

    if not raw.strip():
        raise RuntimeError("LLM returned an empty response. Check your API key and model quota.")

    clean = _extract_json(raw)
    try:
        result = json.loads(clean)
    except json.JSONDecodeError as exc:
        log.error(f"JSON parse failed. Raw response was: {raw[:600]}")
        raise RuntimeError(
            f"LLM returned invalid JSON: {exc}. "
            "Try a more specific prompt or switch providers."
        ) from exc

    if "nodes" not in result or "edges" not in result:
        raise RuntimeError(
            f"LLM response is missing 'nodes' or 'edges' keys. Got keys: {list(result.keys())}"
        )

    # Derive a workflow name from the prompt
    name_words = prompt.split()[:6]
    result["name"] = " ".join(name_words).capitalize()

    log.info(f"Generated workflow: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
    return result


def _template_workflow_fallback() -> Dict[str, Any]:
    return {
        "name": "Default outreach workflow",
        "nodes": [
            {"id": "1", "type": "start", "data": {}},
            {"id": "2", "type": "lead_upload", "data": {"label": "Import Leads"}},
            {"id": "3", "type": "ai_message", "data": {"label": "Generate Message", "tone": "professional", "provider": "groq"}},
            {"id": "4", "type": "send_message", "data": {"label": "Send Email", "channel": "email"}},
            {"id": "5", "type": "delay", "data": {"label": "Wait 2 Days", "delay_seconds": 172800}},
            {"id": "6", "type": "reply_check", "data": {"label": "Got Reply?", "timeout_hours": 48}},
            {"id": "7", "type": "follow_up", "data": {"label": "Follow Up", "tone": "polite", "max_attempts": 2}},
            {"id": "8", "type": "update_crm", "data": {"label": "Mark Engaged", "worksheet_name": "Sheet1"}},
            {"id": "9", "type": "end", "data": {}},
        ],
        "edges": [
            {"source": "1", "target": "2"},
            {"source": "2", "target": "3"},
            {"source": "3", "target": "4"},
            {"source": "4", "target": "5"},
            {"source": "5", "target": "6"},
            {"source": "6", "target": "7", "sourceHandle": "no"},
            {"source": "6", "target": "8", "sourceHandle": "yes"},
            {"source": "7", "target": "9"},
            {"source": "8", "target": "9"},
        ],
    }
