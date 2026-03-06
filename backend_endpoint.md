# Backend Documentation: API Endpoints

This document lists all the available API endpoints in the AI Outreach Platform backend. All endpoints are prefixed with `/api/v1` unless stated otherwise.

---

## 🚀 App Context

- **Base URL**: `http://localhost:8000`
- **Prefix**: `/api/v1`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🔍 Core / Health

| Method | Endpoint  | Description                     | Frontend Status |
| :----- | :-------- | :------------------------------ | :-------------- |
| `GET`  | `/`       | Returns app info and version.   | Info            |
| `GET`  | `/health` | Health check for observability. | Health Check    |

---

## 👥 Leads Management

| Method   | Endpoint               | Description                               | Frontend Status |
| :------- | :--------------------- | :---------------------------------------- | :-------------- |
| `POST`   | `/leads/`              | Create a new lead manually.               | **Primary**     |
| `GET`    | `/leads/`              | List all leads with pagination/filtering. | **Primary**     |
| `GET`    | `/leads/{id}`          | Get details of a specific lead.           | **Primary**     |
| `PATCH`  | `/leads/{id}`          | Update lead details or status.            | **Primary**     |
| `DELETE` | `/leads/{id}`          | Remove a lead from the system.            | **Primary**     |
| `POST`   | `/leads/import`        | Upload CSV/JSON/XLSX to import leads.     | **Primary**     |
| `POST`   | `/leads/import-sheets` | Import leads from a Google Sheet.         | **Primary**     |

---

## 🔄 Workflows (React Flow Integrated)

| Method   | Endpoint                     | Description                           | Frontend Status |
| :------- | :--------------------------- | :------------------------------------ | :-------------- |
| `POST`   | `/workflows/`                | Create a new workflow (stores JSON).  | **Primary**     |
| `GET`    | `/workflows/`                | List all created workflows.           | **Primary**     |
| `GET`    | `/workflows/{id}`            | Fetch a workflow's node/edge JSON.    | **Primary**     |
| `PATCH`  | `/workflows/{id}`            | Update a workflow definition.         | **Primary**     |
| `DELETE` | `/workflows/{id}`            | Delete a workflow.                    | **Primary**     |
| `POST`   | `/workflows/{id}/execute`    | Start a workflow execution for leads. | **Primary**     |
| `GET`    | `/workflows/{id}/executions` | List historical runs of a workflow.   | **Primary**     |

---

## 🤖 AI Services

| Method | Endpoint                | Description                           | Frontend Status |
| :----- | :---------------------- | :------------------------------------ | :-------------- |
| `POST` | `/ai/preview-message`   | Preview a generated outreach message. | **Primary**     |
| `POST` | `/ai/generate-workflow` | AI generates a full workflow JSON.    | **Optional**    |

---

## 📊 Analytics

| Method | Endpoint               | Description                             | Frontend Status |
| :----- | :--------------------- | :-------------------------------------- | :-------------- |
| `GET`  | `/analytics/dashboard` | High-level campaign & conversion stats. | **Primary**     |

---

## 📡 Channels

| Method | Endpoint           | Description                              | Frontend Status |
| :----- | :----------------- | :--------------------------------------- | :-------------- |
| `GET`  | `/channels/status` | Connection status for Email/WA/LinkedIn. | **Primary**     |

---

## ⚓ Webhooks (Service Integration)

| Method | Endpoint          | Description                          | Frontend Status |
| :----- | :---------------- | :----------------------------------- | :-------------- |
| `POST` | `/webhooks/reply` | Receive inbound message from a lead. | Backend-only    |

---

## 🛠️ Microservices (External)

These are called by the Backend but can also be tested independently.

### LinkedIn Service (`:3001`)

- `POST /login`: Manual session trigger.
- `POST /send`: Send direct message.
- `POST /connect`: Send connection request.

### WhatsApp Service (`:3002`)

- `GET /status`: Connection/QR status.
- `POST /send`: Send direct message.
