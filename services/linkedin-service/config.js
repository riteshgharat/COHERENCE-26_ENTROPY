require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  linkedin: {
    username: process.env.LINKEDIN_USERNAME,
    password: process.env.LINKEDIN_PASSWORD,
  },
  webhookUrl:
    process.env.FASTAPI_WEBHOOK_URL ||
    "http://localhost:8000/api/v1/webhooks/linkedin",
  pollingInterval: parseInt(process.env.POLLING_INTERVAL || "30000", 10),
  stateFile: "linkedin_state.json",
};
