// pages/api/scrape.js

import { scrapeWithPuppeteer } from "../../lib/scraper/puppeteerScraper";

export default async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const data = await scrapeWithPuppeteer(url);
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(500).json({ error: "Failed to scrape the product" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
