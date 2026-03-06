const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const config = require("./config");

class LinkedInClient {
  constructor() {
    this.browser = null;
    this.context = null;
  }

  async init(headless = true) {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless,
        args: ["--disable-blink-features=AutomationControlled"],
      });

      if (fs.existsSync(config.stateFile)) {
        console.log("Loading LinkedIn session state...");
        this.context = await this.browser.newContext({
          storageState: config.stateFile,
        });
      } else {
        console.log("Starting fresh LinkedIn session...");
        this.context = await this.browser.newContext({
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });
      }
    }
  }

  async login(showBrowser = true) {
    await this.init(false); // Force headful for login
    const page = await this.context.newPage();
    try {
      console.log("Attempting LinkedIn login...");
      await page.goto("https://www.linkedin.com/login");

      // Wait for user to be redirected to feed or for login screen
      if (page.url().includes("/feed")) {
        console.log("Already logged in.");
      } else {
        if (!config.linkedin.username || !config.linkedin.password) {
          throw new Error("LinkedIn credentials missing in .env");
        }

        await page.fill("#username", config.linkedin.username);
        await page.fill("#password", config.linkedin.password);
        await page.click('button[type="submit"]');

        await page.waitForURL("**/feed/**", { timeout: 60000 });
      }

      // Save session
      await this.context.storageState({ path: config.stateFile });
      console.log("Login successful. Session stored.");
      return true;
    } catch (error) {
      console.error("LinkedIn login failed:", error.message);
      return false;
    } finally {
      await page.close();
    }
  }

  async sendMessage(profileUrl, messageText) {
    await this.init(true);
    const page = await this.context.newPage();
    try {
      console.log(`Navigating to ${profileUrl} to send message...`);
      await page.goto(profileUrl, { waitUntil: "load" });

      // Wait for profile to load
      await page.waitForSelector("main", { timeout: 15000 });

      // Flexible selector for Message button
      const messageSelector =
        'button:has-text("Message"), a:has-text("Message"), [aria-label^="Message"]';
      let messageButton = page.locator(messageSelector).first();

      if ((await messageButton.count()) === 0) {
        console.warn(
          "Direct Message button not found. Checking 'More' menu...",
        );
        const moreButton = page
          .locator('button:has-text("More"), [aria-label="More"]')
          .first();
        if ((await moreButton.count()) > 0) {
          await moreButton.click({ force: true });
          messageButton = page
            .locator(
              'div[role="button"]:has-text("Message"), span:has-text("Message")',
            )
            .first();
        }
      }

      if ((await messageButton.count()) === 0) {
        console.error("Message action not found on profile.");
        return false;
      }

      // Use JS click to bypass pointer interception reported in logs
      console.log("Triggering message action via JS click...");
      await messageButton.evaluate((el) => el.click());

      // Wait for message box
      const textInput = page
        .locator(
          'div[aria-label="Write a message..."], textarea[name="message"]',
        )
        .first();
      await textInput.waitFor({ state: "visible", timeout: 15000 });
      await textInput.fill(messageText);

      // Send button - use JS click to avoid intercepts
      const sendButton = page
        .locator('button:has-text("Send"), [type="submit"]')
        .first();
      await sendButton.evaluate((el) => el.click());

      console.log(`Message successfully sent to ${profileUrl}`);
      return true;
    } catch (error) {
      console.error("Failed to send message:", error.message);
      return false;
    } finally {
      await page.close();
    }
  }

  async sendConnect(profileUrl, note = null) {
    await this.init(true);
    const page = await this.context.newPage();
    try {
      console.log(`Navigating to ${profileUrl} to send connection request...`);
      await page.goto(profileUrl, { waitUntil: "load" });
      await page.waitForSelector("main", { timeout: 15000 });

      // Check for 'Connect' button
      let connectBtn = page
        .locator('button:has-text("Connect"), [aria-label^="Connect"]')
        .first();

      if ((await connectBtn.count()) === 0) {
        console.log(
          "Connect button not found on top level. Checking 'More' menu...",
        );
        const moreBtn = page
          .locator('button:has-text("More"), [aria-label="More"]')
          .first();
        if ((await moreBtn.count()) > 0) {
          await moreBtn.click({ force: true });
          connectBtn = page
            .locator(
              'div[role="button"]:has-text("Connect"), span:has-text("Connect")',
            )
            .first();
        }
      }

      // If still not found, check if 'Follow' is the main action
      if ((await connectBtn.count()) === 0) {
        console.log("Connect button not found. Looking for 'Follow'...");
        connectBtn = page
          .locator('button:has-text("Follow"), [aria-label^="Follow"]')
          .first();
      }

      if ((await connectBtn.count()) === 0) {
        console.error("No connect/follow action found.");
        return false;
      }

      // Use JS click to bypass overlays
      console.log("Triggering connect action via JS click...");
      await connectBtn.evaluate((el) => el.click());

      // Handle the 'Add a note' modal if it appears
      try {
        console.log("Waiting for connection modal...");
        await page.waitForTimeout(3000); // Wait for modal to render

        const addNoteBtn = page
          .locator('button:has-text("Add a note")')
          .first();
        const sendWithoutNoteBtn = page
          .locator('button:has-text("Send without a note")')
          .first();
        const genericSendBtn = page
          .locator('button:has-text("Send"), .artdeco-button--primary')
          .first();

        if ((await addNoteBtn.count()) > 0) {
          console.log("Adding a note to the invitation...");
          await addNoteBtn.click({ force: true });
          await page.fill(
            "#custom-message",
            note || "Hi, I'd like to connect.",
          );
          const finalSend = page.locator('button:has-text("Send")').first();
          await finalSend.evaluate((el) => el.click());
        } else if ((await sendWithoutNoteBtn.count()) > 0) {
          console.log("Sending invitation without a note...");
          await sendWithoutNoteBtn.evaluate((el) => el.click());
        } else if ((await genericSendBtn.count()) > 0) {
          console.log("Clicking generic Send button in modal...");
          await genericSendBtn.evaluate((el) => el.click());
        } else {
          console.log(
            "No specific modal buttons found, action may be pending or sent.",
          );
        }
      } catch (e) {
        console.log("No note modal or different flow prompted:", e.message);
      }

      // Final Verification: Look for "Pending" or "Withdraw"
      console.log("Verifying connection status...");
      await page.waitForTimeout(4000); // Wait for processing

      const statusBtn = page
        .locator(
          ':is(button, a):has-text("Pending"), :is(button, a):has-text("Withdraw"), :is(button, a):has-text("Message")',
        )
        .first();
      const statusText = await statusBtn.innerText().catch(() => "");

      if (
        statusText.includes("Pending") ||
        statusText.includes("Withdraw") ||
        statusText.includes("Message")
      ) {
        console.log(
          `Connection verified for ${profileUrl} (Current Status: ${statusText})`,
        );
        return true;
      } else {
        console.warn(
          `Could not verify connection sent for ${profileUrl}. Manual check may be needed.`,
        );
        // If Connect button is still there, it definitely failed
        const connectStillVisible = await page
          .locator('button:has-text("Connect")')
          .count();
        if (connectStillVisible > 0) {
          console.error(
            "Connect button is still visible. Connection request failed.",
          );
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error("Failed to send connection request:", error.message);
      return false;
    } finally {
      await page.close();
    }
  }

  async shutdown() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = new LinkedInClient();
