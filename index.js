const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const BROWSERLESS_URL = process.env.BROWSERLESS_URL || "wss://chrome.browserless.io?token=YOUR_API_KEY";

// Enable CORS for cross-origin requests
app.use(cors());

app.get("/", (req, res) => {
    res.send("Browserless Proxy is running! Use /browse?url=YOUR_URL");
});

// Proxy endpoint
app.get("/browse", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    try {
        // Connect to Browserless
        const browser = await chromium.connectOverCDP(BROWSERLESS_URL);
        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: "load" });

        // Get page content
        const content = await page.content();

        await browser.close();
        res.send(content);
    } catch (error) {
        console.error("Error fetching page:", error);
        res.status(500).json({ error: "Failed to load page" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
