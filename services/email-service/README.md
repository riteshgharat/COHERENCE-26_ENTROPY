# Email Microservice

A microservice for reading and responding to emails using IMAP and SMTP.

## Features
- Fetch unread emails via IMAP.
- Send responses via SMTP.
- REST API (FastAPI) for external interaction.

## Environment Variables
Create a `.env` file in this directory:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_USE_TLS=True

IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@gmail.com
IMAP_PASS=your_app_password
IMAP_USE_SSL=True

PORT=3002
CHECK_INTERVAL=60
```

## Setup & Run
1. Install dependencies: `pip install -e .`
2. Run server: `python server.py`

## API Endpoints
- `GET /health` : Test if the service is running.
- `GET /fetch-unread` : Retrieve unread emails.
- `POST /send` : Send an email response.
    - JSON Body:
    ```json
    {
      "to_email": "example@email.com",
      "subject": "Hello",
      "content": "Your response here",
      "thread_id": "<optional_msg_id>"
    }
    ```
