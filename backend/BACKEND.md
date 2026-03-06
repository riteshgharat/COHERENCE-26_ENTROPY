# AI Outreach Workflow Automation Platform

## Final Backend Architecture

---

# 1. Overview

This system is an **AI-powered outreach workflow automation platform** that allows users to build **drag-and-drop automation flows** to contact leads across multiple communication channels.

The system executes **workflow pipelines** created in the frontend workflow builder (React Flow inspired by n8n).

Each workflow is composed of **automation components (nodes)** such as:

• Lead Import
• AI Message Generator
• Channel Selection
• Send Message
• Wait Delay
• Reply Detection
• Follow-Up Generator
• AI Conversation Agent (“On Behalf of Me”)
• Google Sheets Update
• Analytics Tracking

The backend executes these workflows using a **distributed task execution engine**.

---

# 2. Supported Communication Channels

Messages are sent **on behalf of the user** after the user connects their accounts.

Supported channels:

• Email (Gmail / SMTP)
• WhatsApp
• LinkedIn

Future channels:

• X (Twitter)
• Telegram
• SMS

---

# 3. Core Capabilities

The backend provides the following features:

Lead ingestion from:

CSV
XLSX
JSON
Google Sheets

Automation capabilities:

• Visual workflow execution
• AI personalized message generation
• Multi-channel outreach
• Automated follow-ups
• AI conversation agent replies
• Agentic workflow generation
• Reply detection and classification
• Campaign analytics dashboard
• Safety throttling to prevent spam

---

# 4. High Level System Architecture

```
                        Frontend (React + React Flow)
                                │
                         REST / WebSocket API
                                │
                                ▼
                         FastAPI API Gateway
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
   Lead Service          Workflow Engine          Channel Manager
 (Data ingestion)      (Node execution engine)     (Account links)
        │                       │                        │
        ▼                       ▼                        ▼
    PostgreSQL              Redis Queue           Messaging Gateway
     Database              (Task Broker)         (Channel routing)
        │                       │                        │
        └──────────────► Celery Workers ◄───────────────┘
                               │
                               ▼
                         AI Messaging Service
                        (Groq / Gemini Models)
                               │
                               ▼
                         AI Agent Services
                (Message generation + conversations)

Messaging Microservices
-----------------------

WhatsApp Service (NodeJS)

LinkedIn Automation Service

Email Service

Reply Processing Service

Analytics Service
```

---

# 5. Core Technology Stack

## Backend API

```
FastAPI
Python 3.11+
Uvicorn
Pydantic
SQLAlchemy
```

---

## Database

```
PostgreSQL → primary relational database
Redis → task queue, caching, throttling
```

---

## Task Processing

```
Celery Workers
Redis Queue
Celery Beat Scheduler
```

Workers execute:

• workflow nodes
• AI message generation
• message dispatch
• delay scheduling
• reply monitoring

---

# 6. Repository Structure

```
project-root/

backend/

├── app/
│
│   ├── api/
│   │    ├── leads.py
│   │    ├── workflows.py
│   │    ├── channels.py
│   │    ├── analytics.py
│   │    └── ai.py
│   │
│   ├── models/
│   ├── schemas/
│   │
│   ├── services/
│   │    ├── workflow_engine.py
│   │    ├── message_service.py
│   │    ├── ai_service.py
│   │    ├── reply_service.py
│   │    └── analytics_service.py
│   │
│   ├── nodes/
│   │    ├── start_node.py
│   │    ├── lead_import_node.py
│   │    ├── ai_message_node.py
│   │    ├── channel_select_node.py
│   │    ├── send_message_node.py
│   │    ├── wait_node.py
│   │    ├── check_reply_node.py
│   │    ├── followup_node.py
│   │    ├── ai_conversation_node.py
│   │    └── sheets_update_node.py
│   │
│   ├── utils/
│   │
│   └── main.py
│
├── workers/
│   ├── celery_app.py
│   ├── workflow_worker.py
│   ├── messaging_worker.py
│   └── reply_worker.py
│
└── integrations/
    ├── email_client.py
    ├── linkedin_client.py
    ├── whatsapp_client.py
    └── google_sheets_client.py


services/

├── whatsapp-service/
│
└── linkedin-service/
```

---

# 7. Workflow Component Architecture

The system executes workflows composed of **automation nodes**.

Each node represents one component from the frontend workflow builder.

Supported nodes:

Start Node
Lead Import Node
AI Message Generator Node
Channel Select Node
Send Message Node
Wait Delay Node
Reply Detection Node
Follow-Up Node
AI Conversation Node
Google Sheets Update Node
Analytics Node

Each node implements:

```
execute(context)
```

The **workflow engine traverses nodes sequentially**.

---

# 8. Example Workflow

```
Start
 ↓
Import Leads
 ↓
AI Message Generator
 ↓
Select Channel
 ↓
Send Message
 ↓
Wait Delay
 ↓
Check Reply
 ↓
Follow Up
 ↓
AI Conversation Agent
 ↓
Update Google Sheet
 ↓
Analytics
```

---

# 9. Workflow JSON Format

Workflows are stored as JSON compatible with the **React Flow editor**.

Example:

```
{
 "nodes":[
   {"id":"1","type":"start"},
   {"id":"2","type":"lead_import"},
   {"id":"3","type":"ai_message"},
   {"id":"4","type":"channel_select"},
   {"id":"5","type":"send_message"},
   {"id":"6","type":"wait"},
   {"id":"7","type":"check_reply"},
   {"id":"8","type":"followup"},
   {"id":"9","type":"ai_conversation"},
   {"id":"10","type":"update_sheets"}
 ]
}
```

---

# 10. Lead Ingestion System

Supported sources:

```
CSV
XLSX
JSON
Google Sheets
```

Processing flow:

```
User uploads dataset
        │
        ▼
File parsed using Pandas
        │
        ▼
Schema validation
        │
        ▼
Insert leads into PostgreSQL
```

API endpoint:

```
POST /leads/import
```

---

# 11. AI Message Generation

Messages are generated using **Groq or Gemini models**.

Inputs used:

• Lead information
• User tone settings
• Sample message provided by user
• Industry context

Example prompt:

```
Write a friendly outreach message.

Name: John
Company: ABC Logistics
Industry: Logistics

Tone: casual founder
```

Output:

```
Hi John,

I noticed ABC Logistics expanding quickly...
```

---

# 12. AI Conversation Agent ("On Behalf of Me")

When a lead replies, the system can respond automatically.

Process:

```
Lead reply received
        │
        ▼
Conversation history retrieved
        │
        ▼
AI generates contextual response
        │
        ▼
Message sent automatically
```

This simulates **human conversation handling**.

---

# 13. Agentic Workflow Generator

The system can **generate workflows automatically using AI**.

Example input:

```
Generate outreach workflow for SaaS founders
```

AI generates:

```
Start
Send LinkedIn message
Wait 1 day
Send email
Wait 2 days
Follow-up
```

The workflow is converted to **React Flow JSON format**.

---

# 14. Messaging Gateway

Messaging is abstracted behind a unified interface.

```
send_message(channel, lead, message)
```

Channel adapters:

```
email_sender
linkedin_sender
whatsapp_sender
```

This ensures workflows remain **channel independent**.

---

# 15. Intelligent Delay System

Human-like sending behavior prevents spam detection.

Features:

```
Random delays
Working hour restrictions
Daily sending limits
```

Example:

```
delay = random(600, 7200)
```

---

# 16. Reply Processing

Replies are captured from:

```
Email inbox
LinkedIn messages
WhatsApp messages
```

AI classifies replies:

```
Interested
Not interested
Referral
Meeting request
Ignore
```

---

# 17. Google Sheets Update

Workflow nodes can update external sheets.

Use cases:

• Export campaign results
• Share analytics
• Maintain CRM lists

Integration uses Google Sheets API.

---

# 18. Safety & Throttling Controls

Prevents platform bans.

Limits enforced per channel:

```
Email → 100/day
LinkedIn → 40/day
WhatsApp → 50/day
```

Rules include:

• stop workflow if reply received
• delay randomization
• per-domain rate limits

Redis counters enforce limits.

---

# 19. Analytics Engine

Tracked metrics:

```
Leads imported
Messages sent
Replies received
Conversion rate
Channel performance
```

API endpoint:

```
GET /analytics/dashboard
```

Example response:

```
{
 "leads":1200,
 "messages_sent":450,
 "replies":38,
 "conversion_rate":8.4
}
```

---

# 20. Deployment Architecture

Services run independently.

```
fastapi-api
redis
postgres
celery-worker
whatsapp-service
linkedin-service
email-service
```

Development:

```
Docker Compose
```

Production:

```
Kubernetes
Horizontal worker scaling
```

---

# 21. End to End Workflow Execution

```
User uploads leads
        │
        ▼
Workflow created in UI
        │
        ▼
Campaign started
        │
        ▼
Tasks pushed to Redis queue
        │
        ▼
Celery workers execute nodes
        │
        ▼
AI generates message
        │
        ▼
Messaging gateway routes message
        │
        ▼
WhatsApp / Email / LinkedIn
        │
        ▼
Reply captured
        │
        ▼
AI conversation agent responds
        │
        ▼
Analytics updated
```

---

# 22. Hackathon MVP Scope

Minimum features:

```
Lead import
Workflow builder execution
AI message generation
Email messaging
WhatsApp integration
Analytics dashboard
Agentic workflow generator
```

Future features:

```
AI lead discovery
Intent scoring
Auto-enrichment
A/B testing campaigns
Multi-account scaling
```