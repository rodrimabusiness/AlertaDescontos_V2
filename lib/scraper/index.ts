"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) return null;

  // Configuração do proxy BrightData
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = Math.floor(Math.random() * 1000000);

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false, // Importante para evitar problemas com certificados
  };

  try {
    // Tentativa de obtenção da página
    const response = await axios.get(url, options);
    if (!response || !response.data) {
      console.error("Failed to fetch data or no data in the response.");
      return null;
    }
    const $ = cheerio.load(response.data);
    const selectors = getSelectors(url);

    // Extração de dados utilizando os seletores definidos
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

    console.log("Product Data:", data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during product scraping:", error.message);
    } else {
      console.error(
        "Error during product scraping: An unknown error occurred."
      );
    }
    return null;
  }
}
