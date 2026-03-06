# AI Outreach Workflow Automation Platform

## Final Backend Architecture

---

# 1. Overview

This system is an **AI-powered outreach automation platform** designed to automate personalized communication with leads across multiple channels.

Supported communication channels:

* Email (Gmail / SMTP)
* WhatsApp
* LinkedIn

Core capabilities:

* Import leads from **CSV / XLSX / JSON / Google Sheets**
* Create **workflow-based outreach campaigns**
* Generate **AI-personalized messages**
* Send messages across multiple channels
* Track replies and extract referrals
* Monitor campaign analytics
* Implement safety throttling to prevent spam detection

The backend uses a **distributed microservice architecture** with:

* **FastAPI core backend**
* **Redis task queue**
* **Celery workers**
* **Node.js WhatsApp microservice**

---

# 2. High-Level System Architecture

```
                        Frontend (React)
                              │
                       REST / WebSocket
                              │
                              ▼
                       FastAPI API Gateway
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Lead Service         Workflow Engine       Campaign Manager
 (Lead ingestion)      (Automation logic)     (Campaign control)
        │                     │                     │
        ▼                     ▼                     ▼
     PostgreSQL            Redis Queue        Messaging Gateway
    (Primary DB)          (Task Broker)       (Channel Router)
        │                     │                     │
        └──────────────► Celery Workers ◄──────────┘
                               │
                               ▼
                        AI Messaging Service
                        (LLM Generation)
                               │
                               ▼
                        LLM Providers
                 (OpenAI / Gemini / Local Models)

Messaging Microservices
-----------------------

WhatsApp Service (NodeJS)

LinkedIn Service (Python)

Email Service (Python)

Reply Processing Service

Monitoring / Analytics Service

Safety & Throttling Engine
```

---

# 3. Core Technology Stack

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
PostgreSQL → main relational database

Redis → queue, caching, and rate limiting
```

---

## Task Processing

```
Celery Workers
Redis Queue
Celery Beat Scheduler
```

Workers handle:

* workflow execution
* AI message generation
* sending messages
* reply processing
* delay scheduling

---

# 4. Messaging Microservice Architecture

Messaging is handled by **independent services** so each channel can scale independently.

```
Messaging Gateway
        │
        ├── Gmail Service
        ├── LinkedIn Service
        └── WhatsApp Service
```

Each service consumes tasks from Redis and processes them concurrently.

This enables **thousands of messages to run in parallel**.

---

# 5. Repository Structure

```
project-root/

services/                   # external messaging microservices
│
├── whatsapp-service/       # NodeJS service
│   ├── server.js
│   ├── whatsapp.js
│   ├── messageHandler.js
│   ├── sessionManager.js
│   └── package.json
│
└── linkedin-service/       # optional future service
```

---

# 6. WhatsApp Service Architecture

WhatsApp messaging runs as a **Node.js microservice**.

Libraries used:

```
Baileys
WhatsApp-web.js
```

### Service Structure

```
services/whatsapp-service/

server.js
whatsapp.js
sessionManager.js
messageHandler.js
```

### WhatsApp Login Flow

```
User clicks connect WhatsApp
        │
        ▼
FastAPI requests QR code
        │
        ▼
WhatsApp service generates QR
        │
        ▼
Frontend displays QR
        │
        ▼
User scans QR with phone
        │
        ▼
Session stored in Redis / DB
```

---

# 7. Service Communication

Services communicate through **HTTP APIs or Redis queue tasks**.

Example flow:

```
FastAPI Worker
      │
      ▼
Redis Task Queue
      │
      ▼
Messaging Worker
      │
      ▼
HTTP request → WhatsApp Service
      │
      ▼
Baileys client
      │
      ▼
Send message to WhatsApp
```

---

# 8. Lead Ingestion System

Supported sources:

```
CSV
XLSX
JSON
Google Sheets
```

Import flow:

```
User uploads dataset
        │
        ▼
Pandas parses file
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

# 9. Database Schema

## Leads

```
leads
-----
id
name
email
phone
linkedin_url
company
industry
source
status
created_at
```

---

## Campaigns

```
campaigns
---------
id
name
workflow_id
status
created_at
created_by
```

---

## Workflows

```
workflows
---------
id
name
nodes_json
edges_json
created_at
```

Example workflow JSON:

```
{
 "nodes":[
   {"id":"start"},
   {"id":"ai_message"},
   {"id":"send_email"},
   {"id":"wait"},
   {"id":"followup"}
 ]
}
```

---

## Lead Progress

```
lead_progress
-------------
lead_id
campaign_id
current_node
status
last_action
next_run_time
```

---

## Messages

```
messages
--------
id
lead_id
channel
content
status
sent_at
reply
```

---

# 10. Workflow Execution Engine

Example workflow:

```
Start
 ↓
Generate AI Message
 ↓
Send Message
 ↓
Wait Delay
 ↓
Check Reply
 ↓
Follow-up
 ↓
End
```

Execution flow:

```
Campaign started
      │
      ▼
Tasks pushed to Redis queue
      │
      ▼
Celery workers execute nodes
      │
      ▼
Schedule next node
```

---

# 11. Intelligent Delay System

To simulate human behavior and prevent spam detection.

Features:

```
Random delays
Working hour restrictions
Daily sending limits
```

Example:

```
delay = random(300,1800)
```

---

# 12. Reply Processing System

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

# 13. Referral Extraction

Example reply:

```
Please contact our CTO Raj
raj@company.com
```

Processing flow:

```
Reply received
      │
      ▼
AI extracts contact details
      │
      ▼
Create new lead
      │
      ▼
Add to campaign
```

---

# 14. Safety & Throttling Controls

Prevents spam detection and account bans.

Limits include:

```
Max messages per hour
Max messages per day
Max messages per domain
Stop workflow if reply received
```

Example limits:

```
Email → 100/day
LinkedIn → 40/day
WhatsApp → 50/day
```

Redis counters enforce these rules.

---

# 15. Monitoring & Analytics

Tracked metrics:

```
Leads imported
Messages sent
Replies received
Campaign performance
Conversion rate
```

Example API endpoint:

```
GET /dashboard/stats
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

# 16. Deployment Architecture

Services run independently.

```
fastapi-api
redis
postgres
celery-worker
whatsapp-service
linkedin-service
gmail-service
```

Development environment:

```
Docker Compose
```

Production environment:

```
Kubernetes
Horizontal scaling for workers
```

---

# 17. End-to-End Workflow

```
User uploads leads
        │
        ▼
Leads stored in database
        │
        ▼
User creates workflow
        │
        ▼
Campaign started
        │
        ▼
Tasks pushed to Redis queue
        │
        ▼
Celery workers execute workflow nodes
        │
        ▼
AI generates message
        │
        ▼
Messaging gateway routes message
        │
        ▼
WhatsApp / Email / LinkedIn service
        │
        ▼
Message delivered
        │
        ▼
Reply captured
        │
        ▼
Workflow continues
```

---

# 18. MVP Scope (Hackathon)

Minimum features required:

```
Lead import
Workflow engine
AI message generation
Email messaging
WhatsApp integration
Basic monitoring dashboard
```

Future improvements:

```
AI lead scoring
Automatic lead discovery
Smart follow-up generation
A/B testing campaigns
```

---

END OF DOCUMENT