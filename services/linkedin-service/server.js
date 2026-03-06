const express = require("express");
const bodyParser = require("body-parser");
const linkedinClient = require("./linkedin");
const config = require("./config");
const { pollReplies } = require("./replyListener");

const app = express();
app.use(bodyParser.json());

// Root endpoint for status
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "linkedin-service-nodejs" });
});

// Endpoint to trigger manual login and session save
app.post("/login", async (req, res) => {
  try {
    console.info("Manual login requested...");
    const success = await linkedinClient.login();
    if (success) {
      res.json({ success: true, message: "Login complete. Session stored." });
    } else {
      res.status(500).json({ success: false, error: "LinkedIn Login Failed." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to send a direct message
app.post("/send", async (req, res) => {
  const { to, message } = req.body;
  console.info(`Received send message request for: ${to}`);

  try {
    const success = await linkedinClient.sendMessage(to, message);
    if (success) {
      res.json({ success: true });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to send message." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to send a connection request
app.post("/connect", async (req, res) => {
  const { to, message } = req.body;
  console.info(`Received connection request for: ${to}`);

  try {
    const success = await linkedinClient.sendConnect(to, message);
    if (success) {
      res.json({ success: true });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to send connection request." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(config.port, () => {
  console.log(`LinkedIn Node.js service listening on port ${config.port}`);
  pollReplies();
});

// Shutdown hook
process.on("SIGTERM", async () => {
  console.info("SIGTERM received. Closing browser...");
  await linkedinClient.shutdown();
  server.close();
});
