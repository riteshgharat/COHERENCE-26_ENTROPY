# Backend Implementation Phases

This document breaks the backend into 3 execution phases, based on `BACKEND.md`.

## Tech Stack Libraries (Reference From BACKEND.md)

### Backend API
- FastAPI
- Python 3.11+
- Uvicorn
- Pydantic
- SQLAlchemy

### Database And Queue
- PostgreSQL (primary relational database)
- Redis (task queue, caching, throttling)

### Task Processing
- Celery Workers
- Redis Queue
- Celery Beat Scheduler

### AI And Data Processing
- Groq / Gemini models (message generation and agentic flows)
- Pandas (lead file parsing)
- Google Sheets API (sheet update/export)

## Project File Structure (Reference From BACKEND.md)

```text
project-root/

backend/
├── app/
│   ├── api/
│   │   ├── leads.py
│   │   ├── workflows.py
│   │   ├── channels.py
│   │   ├── analytics.py
│   │   └── ai.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── workflow_engine.py
│   │   ├── message_service.py
│   │   ├── ai_service.py
│   │   ├── reply_service.py
│   │   └── analytics_service.py
│   ├── nodes/
│   │   ├── start_node.py
│   │   ├── lead_import_node.py
│   │   ├── ai_message_node.py
│   │   ├── channel_select_node.py
│   │   ├── send_message_node.py
│   │   ├── wait_node.py
│   │   ├── check_reply_node.py
│   │   ├── followup_node.py
│   │   ├── ai_conversation_node.py
│   │   └── sheets_update_node.py
│   ├── utils/
│   └── main.py
├── workers/
│   ├── celery_app.py
│   ├── workflow_worker.py
│   ├── messaging_worker.py
│   └── reply_worker.py
└── integrations/
   ├── email_client.py
   ├── linkedin_client.py
   ├── whatsapp_client.py
   └── google_sheets_client.py

services/
├── whatsapp-service/
└── linkedin-service/
```

## Phase 1 - Core Platform Foundation

### Flow
1. Set up API service, database, and queue infrastructure.
2. Implement lead ingestion pipeline (`CSV`, `XLSX`, `JSON`, Google Sheets).
3. Add workflow storage and JSON schema validation for React Flow compatible payloads.
4. Build base workflow engine and core nodes:
   - `start`
   - `lead_import`
   - `ai_message`
   - `channel_select`
   - `send_message`
5. Integrate first messaging channel (Email) through the messaging gateway abstraction.
6. Add essential observability (basic logs, execution status, health endpoints).

### Achieved At End Of Phase 1
- Backend can import leads, store workflows, and execute a basic outreach flow from start to first message send.
- Team has a stable MVP backbone with one production-ready channel (Email).

---

## Phase 2 - Intelligent Automation And Multi-Channel Execution

### Flow
1. Add asynchronous worker orchestration for node execution and scheduling.
2. Implement delay and reply-aware nodes:
   - `wait`
   - `check_reply`
   - `followup`
3. Add AI message generation service integration (Groq/Gemini).
4. Enable additional channels in gateway adapters:
   - WhatsApp
   - LinkedIn
5. Implement safety and throttling controls:
   - daily send caps
   - working-hour restrictions
   - random delays
   - per-domain/channel limits
6. Add reply ingestion + classification pipeline (`interested`, `not_interested`, etc.).

### Achieved At End Of Phase 2
- Platform runs real multi-step, multi-channel campaigns with AI-generated messages.
- System can auto-delay, detect/classify replies, and trigger follow-up logic safely at scale.

---

## Phase 3 - Agentic Operations, Analytics, And Production Readiness

### Flow
1. Implement AI conversation agent ("on behalf of me") for contextual auto-replies.
2. Add agentic workflow generator (prompt to workflow JSON conversion).
3. Implement analytics engine and dashboard endpoints for campaign metrics.
4. Add Google Sheets update/export node for CRM-style external sync.
5. Harden deployment architecture:
   - containerized services
   - queue/worker horizontal scaling
   - production configuration and failure recovery
6. Add integration and end-to-end tests for full workflow lifecycle.

### Achieved At End Of Phase 3
- Backend becomes a complete outreach automation engine with agentic workflow creation, conversational automation, and measurable campaign performance.
- System is deployment-ready for hackathon demo and scalable for post-hackathon production rollout.
