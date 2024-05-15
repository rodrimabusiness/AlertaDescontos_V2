"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";
import https from "https";

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) return null;

  // Configuração do proxy BrightData
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = Math.floor(Math.random() * 1000000);

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const options = {
    httpsAgent: agent,
    proxy: {
      host: "brd.superproxy.io",
      port: port,
      auth: {
        username: `${username}-session-${session_id}`,
        password: password,
      },
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      Connection: "keep-alive",
    },
  };

  try {
    console.log("Fetching data from URL:", url);
    console.log("Using session ID:", session_id);

    const startTime = Date.now();

    // Tentativa de obtenção da página
    const response = await axios.get(url, options);
    const fetchDuration = Date.now() - startTime;
    console.log(`Data fetched successfully in ${fetchDuration}ms`);

    if (!response || !response.data) {
      console.error("Failed to fetch data or no data in the response.");
      return null;
    }

    const parseStartTime = Date.now();
    const $ = cheerio.load(response.data);
    const selectors = getSelectors(url);

    const title = $(selectors.titleSelector).text().trim();

    const { currentPrice, recommendedPrice } = extractPrice(
      $,
      selectors.fullPriceSelector_2,
      selectors.fullPriceSelector
    );

    const images = $(selectors.imageSelector)
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src) => src && src.trim().length > 0);

    const outOfStock =
      $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
      "currently unavailable";

    const currency = extractCurrency($(selectors.currencySelector));

    const data = {
      url,
      title,
      currentPrice,
      recommendedPrice,
      images,
      currency,
      outOfStock,
      priceHistory: [],
      lowestPrice: currentPrice,
      highestPrice: currentPrice,
      averagePrice: currentPrice,
    };

    const parseDuration = Date.now() - parseStartTime;
    console.log(`Data parsed successfully in ${parseDuration}ms`);

    console.log("Product Data:", data);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Error during product scraping:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error(
          "Response headers:",
          JSON.stringify(error.response.headers, null, 2)
        );
        console.error("Response data:", error.response.data);
      }
    } else {
      console.error(
        "Error during product scraping: An unknown error occurred."
      );
    }
    return null;
  }
}
