const express = require("express");
const cors = require("cors");
const {
  initializeClient,
  sendMessage,
  getClientStatus,
} = require("./whatsapp");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Start WhatsApp Client
initializeClient();

// API Routes
app.get("/status", (req, res) => {
  const status = getClientStatus();
  res.json(status);
});

app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res
      .status(400)
      .json({ error: 'Missing "to" (phone number) or "message" text.' });
  }

  try {
    const result = await sendMessage(to, message);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp Microservice running on port ${PORT}`);
});
