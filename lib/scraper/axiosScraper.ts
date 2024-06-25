import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, getSelectors } from "../utils";
import { Product } from "@/types";
import puppeteer, { Browser, Page } from "puppeteer-core";
export async function scrapeWithAxios(url: string): Promise<Product | null> {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.SBR_WS_ENDPOINT,
    });
    const page = await browser.newPage();
    const client = await page.createCDPSession();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    // Go to Amazon.com
    await page.goto(url, { waitUntil: "domcontentloaded" });
    console.log("Navigated to home page");
    console.log("Waiting captcha to solve...");
    const { status } = (await client.send("Captcha.waitForSolve" as any, {
      detectTimeout: 10000,
    })) as { status?: string };
    console.log("Captcha solve status:", status);
    //take screenshot
    //await page.screenshot({ path: "screenshot.png" });
    const html = await page.content();
    console.log("html:", html);
    const $ = cheerio.load(html);
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
