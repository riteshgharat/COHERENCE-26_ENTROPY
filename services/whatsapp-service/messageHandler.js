const axios = require("axios");

/**
 * Handles incoming WhatsApp messages and forwards them to the Python FastAPI backend.
 * @param {object} msg - The whatsapp-web.js message object
 */
async function handleMessage(msg) {
  console.log(`Received message from ${msg.from}: ${msg.body}`);

  // Filter out status broadcasts or internal messages if needed
  if (msg.from === "status@broadcast") return;

  // We only care about text messages for now
  if (msg.type !== "chat") return;

  // We assume the FastAPI backend webhook is running on localhost:8000
  const FASTAPI_WEBHOOK_URL =
    process.env.FASTAPI_WEBHOOK_URL ||
    "http://localhost:8000/api/v1/webhooks/reply";

  // Build the payload
  const payload = {
    channel: "whatsapp",
    sender: msg.from.replace("@c.us", ""), // Strip the WhatsApp ID suffix to get phone number
    message_body: msg.body,
  };

  try {
    await axios.post(FASTAPI_WEBHOOK_URL, payload);
    console.log(
      `Forwarded WhatsApp reply from ${payload.sender} to FastAPI webhook.`,
    );
  } catch (error) {
    console.error(
      `Failed to forward message to FastAPI webhook: ${error.message}`,
    );
  }
}

module.exports = {
  handleMessage,
};
