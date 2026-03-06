const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { handleMessage } = require("./messageHandler");

let client;
let status = {
  isReady: false,
  qrCode: null,
};

function initializeClient() {
  process.stdout.write("Initializing WhatsApp Client... Please Wait.\n");

  client = new Client({
    authStrategy: new LocalAuth(), // Saves session locally
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    status.qrCode = qr;
    status.isReady = false;
    console.log("QR RECEIVED - Scan this with WhatsApp:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    status.isReady = true;
    status.qrCode = null;
    console.log("WhatsApp Client is ready!");
  });

  client.on("authenticated", () => {
    console.log("WhatsApp Client Authenticated");
  });

  client.on("auth_failure", (msg) => {
    console.error("WhatsApp Authentication failure", msg);
    status.isReady = false;
  });

  // Inbound message handling
  client.on("message", async (msg) => {
    await handleMessage(msg);
  });

  client.initialize();
}

/**
 * Send a message using the active WhatsApp client.
 * @param {string} to - The phone number (with country code, no +) e.g., '1234567890'
 * @param {string} text - Message text
 */
async function sendMessage(to, text) {
  if (!status.isReady || !client) {
    throw new Error("WhatsApp Client is not ready or authenticated yet.");
  }

  // Format number to WhatsApp JID format
  // Strip everything except digits
  const cleanTo = to.replace(/\D/g, "");
  const chatId = `${cleanTo}@c.us`;

  const isRegistered = await client.isRegisteredUser(chatId);
  if (!isRegistered) {
    throw new Error(
      `The phone number ${cleanTo} is not registered on WhatsApp.`,
    );
  }

  console.log(`Sending to JID: ${chatId}`);
  const response = await client.sendMessage(chatId, text);
  return response.id.id;
}

function getClientStatus() {
  return status;
}

module.exports = {
  initializeClient,
  sendMessage,
  getClientStatus,
  client,
};
