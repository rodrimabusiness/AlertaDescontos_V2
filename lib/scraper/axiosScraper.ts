import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";
import { Product } from "@/types";

export async function scrapeWithAxios(url: string): Promise<Product | null> {
  const user_agent =
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

  const options = {
    headers: {
      "User-Agent": user_agent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,**;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
    timeout: 60000, // 30 segundos de timeout
  };

  try {
    console.log(`Fetching data from URL: ${url}`);
    const response = await axios.get(url, options);

    if (!response || !response.data) {
      console.error("Failed to fetch data or no data in the response.");
      return null;
    }

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
      .filter((src) => src && src.trim().length > 0 && src.startsWith("http"));
    console.log(`Images extracted: ${images}`);

    const outOfStock =
      $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
      "currently unavailable";

    const currency = extractCurrency($(selectors.currencySelector));

    const data: Product = {
      url,
      title,
      currentPrice: currentPrice ?? 0, // Default value if currentPrice is null
      recommendedPrice: recommendedPrice ?? 0, // Default value if recommendedPrice is null
      image: images[0] || "", // Assuming the first image is the main image
      currency,
      priceHistory: [],
      lowestPrice: currentPrice ?? 0, // Default value if currentPrice is null
      highestPrice: currentPrice ?? 0, // Default value if currentPrice is null
      averagePrice: currentPrice ?? 0, // Default value if currentPrice is null
      discountRate: 0, // Default value, can be calculated later
      description: "", // Assuming description can be empty or fetched separately
      category: "", // Assuming category can be empty or fetched separately
      reviewsCount: 0, // Default value, can be fetched separately
      stars: 0, // Default value, can be fetched separately
      users: [], // Default value, can be populated later
      isOutOfStock: outOfStock,
    };

    return data;
  } catch (error: any) {
    console.error("Error during product scraping with Axios:", error.message);
    return null;
  }
}
