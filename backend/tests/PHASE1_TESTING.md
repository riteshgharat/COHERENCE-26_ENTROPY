# Phase 1 Testing Guide

> **Scope:** Core Platform Foundation – API, Database, Lead Ingestion, Workflow Engine, Email Channel, Observability.

---

## Prerequisites

1. **Python 3.11+** installed
2. **pip** (or a virtual environment manager like `venv` / `conda`)
3. No external services (PostgreSQL, Redis) needed – tests use **in-memory SQLite**

---

## Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Running All Phase 1 Tests

```bash
cd backend
pytest
```

This will auto-discover and run all tests in the `tests/` directory.

### Expected Output

```
tests/test_health.py        ✓ 3 passed
tests/test_leads.py          ✓ 10 passed
tests/test_workflows.py      ✓ 9 passed
tests/test_channels_analytics.py  ✓ 3 passed
tests/test_ai.py             ✓ 3 passed
tests/test_file_parser.py    ✓ 5 passed
tests/test_nodes.py          ✓ 7 passed
```

---

## Running Individual Test Files

```bash
# Health & root endpoints
pytest tests/test_health.py -v

# Lead CRUD + file import
pytest tests/test_leads.py -v

# Workflow CRUD + execution
pytest tests/test_workflows.py -v

# Channel status + analytics dashboard
pytest tests/test_channels_analytics.py -v

# AI message preview + workflow generation stub
pytest tests/test_ai.py -v

# File parser utility
pytest tests/test_file_parser.py -v

# Workflow node unit tests
pytest tests/test_nodes.py -v
```

---

## Running a Single Test

```bash
pytest tests/test_leads.py::test_import_csv -v
pytest tests/test_workflows.py::test_execute_workflow -v
```

---

## Test Coverage Report

```bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing
```

---

## What Each Test File Covers

| File                         | Area                                                        | Tests |
| ---------------------------- | ----------------------------------------------------------- | ----- |
| `test_health.py`             | Root, health, docs endpoints                                | 3     |
| `test_leads.py`              | Lead CRUD, CSV/JSON import, field mapping, pagination       | 10    |
| `test_workflows.py`          | Workflow CRUD, end-to-end execution, execution history      | 9     |
| `test_channels_analytics.py` | Channel status, analytics dashboard                         | 3     |
| `test_ai.py`                 | AI message preview, fallback, workflow gen stub             | 3     |
| `test_file_parser.py`        | CSV/JSON/XLSX parsing, column normalisation, error handling | 5     |
| `test_nodes.py`              | Start, lead import, channel select nodes                    | 7     |

---

## Phase 1 Test Checklist

### ✅ Infrastructure

- [x] Health endpoint returns `{"status": "healthy"}`
- [x] Root endpoint returns app info
- [x] Swagger docs accessible at `/docs`

### ✅ Lead Ingestion

- [x] Create lead via API
- [x] Name field is required (422 on missing)
- [x] List leads with pagination
- [x] Get lead by ID (200) / not found (404)
- [x] Update lead (PATCH)
- [x] Delete lead (204)
- [x] Import from CSV file
- [x] Import from JSON file
- [x] Handle missing `name` in import (skip + error report)
- [x] Smart field mapping (`full_name` → `name`, `email_address` → `email`, etc.)

### ✅ Workflow Engine

- [x] Create workflow with React Flow JSON
- [x] Workflow name is required (422 on missing)
- [x] List all workflows
- [x] Get workflow by ID
- [x] Update workflow (PATCH)
- [x] Delete workflow
- [x] Execute workflow end-to-end (create leads → create workflow → execute)
- [x] List execution history for a workflow
- [x] Validates empty flow (gracefully handled)

### ✅ Workflow Nodes

- [x] Start node validates leads exist
- [x] Start node raises on empty leads
- [x] Lead import passes through all leads
- [x] Lead import filters by industry
- [x] Channel select defaults to email
- [x] Channel select accepts valid channels
- [x] Channel select falls back to email on invalid input

### ✅ Channel & Analytics

- [x] Channel status returns all 3 channels
- [x] Analytics dashboard returns zeroes when empty
- [x] Analytics dashboard reflects actual lead count

### ✅ AI Service

- [x] Preview message generates content
- [x] Fallback template works without API keys
- [x] Workflow generation stub returns valid JSON

### ✅ File Parser

- [x] Parse CSV to dicts
- [x] Parse JSON array to dicts
- [x] Parse JSON with `leads` key
- [x] Reject unsupported file types
- [x] Normalise column names (lowercase, underscores)

---

## Manual Testing (with Docker)

If you want to test with a real PostgreSQL and Redis:

```bash
# From project root
docker-compose up -d db redis

# Run backend locally
cd backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app python -m uvicorn app.main:app --port 3000 --reload
```

Then visit:

- **Swagger UI:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/health
- **Analytics:** http://localhost:3000/api/v1/analytics/dashboard

---

## Troubleshooting

| Issue                      | Solution                                                                   |
| -------------------------- | -------------------------------------------------------------------------- |
| `ModuleNotFoundError: app` | Make sure you're running from the `backend/` directory                     |
| SQLAlchemy enum errors     | Tests use SQLite which doesn't enforce PostgreSQL enums – this is expected |
| `SMTP_HOST not configured` | Expected in tests – email uses dry-run mode                                |
| Import fails for `.xlsx`   | Install `openpyxl`: `pip install openpyxl`                                 |
