# LinkedIn Messaging Service (Node.js)

This microservice handles LinkedIn messaging and connection requests using **Playwright**.

## Features

- **Browser Automation**: Mimics real user interaction for reliability.
- **Session Persistence**: Saves login state to `linkedin_state.json`.
- **API Endpoints**: `/login`, `/send`, `/connect`, `/status`.

## Setup

1. **Install Dependencies**:

   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Configure Environment**: Create a `.env` file in this directory:

   ```env
   PORT=3001
   LINKEDIN_USERNAME=your_email@example.com
   LINKEDIN_PASSWORD=your_password
   FASTAPI_WEBHOOK_URL=http://localhost:8000/api/v1/webhooks/linkedin
   ```

3. **Run the Service**:

   ```bash
   npm run dev
   ```

4. **Initial Login**:
   Since LinkedIn often requires MFA (email/code), use the `/login` route once start to handle authentication manually:
   - **Endpoint**: `POST http://localhost:3001/login`
   - A headful browser will open for you to verify any codes or CAPTCHAs. Session will be saved automatically.

## API Usage

### Send Message

- **POST** `/send`
- **Body**: `{ "to": "PROFILE_URL", "message": "The message text" }`

### Send Connection Request

- **POST** `/connect`
- **Body**: `{ "to": "PROFILE_URL", "message": "Optional connection note" }`
