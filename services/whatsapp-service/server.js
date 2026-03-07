const express = require("express");
const cors = require("cors");
const axios = require("axios");
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

app.post("/broadcast", async (req, res) => {
  let { leads, message, backendUrl } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ error: 'Missing "message" text.' });
  }

  // Fetch leads dynamically if not passed in request body
  if (!leads || !Array.isArray(leads)) {
    try {
      // Use configured backend base url, or fallback to the standard local dev host
      const url = backendUrl || process.env.BACKEND_URL || "http://127.0.0.1:8000";
      const response = await axios.get(`${url}/api/v1/leads/?page_size=100`);
      
      if (response.data && response.data.leads) {
        leads = response.data.leads;
      } else {
        return res.status(500).json({ error: "Could not parse leads from backend response." });
      }
    } catch (error) {
      return res.status(500).json({ error: `Failed to fetch leads from backend: ${error.message}` });
    }
  }

  const results = {
    total: leads.length,
    successful: 0,
    failed: 0,
    details: [],
  };

  for (const lead of leads) {
    if (!lead.phone) {
      results.failed++;
      results.details.push({
        id: lead.id,
        name: lead.name,
        error: "No phone number provided",
      });
      continue;
    }

    try {
      // Basic template replacement
      let personalizedMessage = message;
      if (lead.name) {
        personalizedMessage = personalizedMessage.replace(
          /{name}/gi,
          lead.name,
        );
      }
      if (lead.company) {
        personalizedMessage = personalizedMessage.replace(
          /{company}/gi,
          lead.company,
        );
      }

      const resultId = await sendMessage(lead.phone, personalizedMessage);
      results.successful++;
      results.details.push({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: "success",
        messageId: resultId,
      });
    } catch (error) {
      results.failed++;
      results.details.push({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: "failed",
        error: error.message,
      });
    }
  }

  res.json({ success: true, results });
});

app.listen(PORT, () => {
  console.log(`WhatsApp Microservice running on port ${PORT}`);
});
