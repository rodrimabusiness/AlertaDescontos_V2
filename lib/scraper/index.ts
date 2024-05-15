"use server";

import axios from "axios-https-proxy-fix";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";
import https from "https";
import promise from "bluebird";
import { lookup } from "dns";
const lookupAsync = promise.promisify(lookup);

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  const username = "brd-customer-hl_cd9904f9-zone-alertadescontos";
  const password = "zhz6xcgyk15n";
  const port = 22225;
  const user_agent =
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";
  const session_id = (1000000 * Math.random()) | 0;

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const superProxyHost = await lookupAsync("brd.superproxy.io");

  const options = {
    httpsAgent: agent,
    proxy: {
      host: superProxyHost,
      port: port,
      auth: {
        username: `${username}-session-${session_id}`,
        password: password,
      },
    },
    headers: {
      "User-Agent": user_agent,
    },
    timeout: 30000, // 30 segundos de timeout
  };

  try {
    console.log(`Fetching data from URL: ${url}`);
    console.log(`Using session ID: ${session_id}`);

    const startTime = Date.now();

    // Fazendo a requisição diretamente sem retries
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
    console.log(`Title extracted: ${title}`);

    const { currentPrice, recommendedPrice } = extractPrice(
      $,
      selectors.fullPriceSelector_2,
      selectors.fullPriceSelector
    );
    console.log(
      `Prices extracted: Current Price - ${currentPrice}, Recommended Price - ${recommendedPrice}`
    );

    const images = $(selectors.imageSelector)
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src) => src && src.trim().length > 0);
    console.log(`Images extracted: ${images}`);

    const outOfStock =
      $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
      "currently unavailable";
    console.log(`Out of stock status: ${outOfStock}`);

    const currency = extractCurrency($(selectors.currencySelector));
    console.log(`Currency extracted: ${currency}`);

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
    if (error.response) {
      console.error("Error during product scraping:", error.message);
      console.error("Response status:", error.response.status);
      console.error(
        "Response headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
      console.error("Response data:", error.response.data);
    } else {
      console.error(
        "Error during product scraping: An unknown error occurred.",
        error
      );
    }
    return null;
  }
}
