"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  // Configuração do proxy BrightData
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = Math.floor(Math.random() * 1000000);

  const options = {
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
    },
    timeout: 10000, // Adicionando timeout de 10 segundos
  };

  try {
    console.log(`Fetching data from URL: ${url}`);
    console.log(`Using session ID: ${session_id}`);

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

    // Extração de dados utilizando os seletores definidos
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
