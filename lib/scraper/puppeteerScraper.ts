import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { Product } from "@/types";
import { extractCurrency, extractPrice, getSelectors } from "../utils";
import * as cheerio from "cheerio";

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  try {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
    });
    console.log("Puppeteer launched successfully.");

    const page = await browser.newPage();
    console.log("New page created.");

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3"
    );
    console.log("User-Agent set.");

    await page.goto(url, { waitUntil: "networkidle2" });
    console.log("Navigated to URL:", url);

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const selectors = getSelectors(url);

    const title =
      $(selectors.titleSelector).text().trim() || "Título não disponível";
    console.log("Title Selector:", selectors.titleSelector);
    console.log("Extracted Title:", title);

    const { currentPrice, recommendedPrice } = extractPrice(
      $,
      selectors.fullPriceSelector_2,
      selectors.fullPriceSelector
    );

    const images = $(selectors.imageSelector)
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src) => src && src.trim().length > 0);
    const image = images.length > 0 ? images[0] : "";
    console.log("Image Selector:", selectors.imageSelector);
    console.log("Extracted Images:", images);

    const outOfStock =
      $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
      "currently unavailable";
    console.log("Out of Stock Selector:", selectors.outOfStockSelector);
    console.log("Out of Stock Status:", outOfStock);

    const currency = extractCurrency($(selectors.currencySelector));
    console.log("Currency Selector:", selectors.currencySelector);
    console.log("Extracted Currency:", currency);

    const data: Product = {
      url,
      title,
      currentPrice: currentPrice ?? 0,
      recommendedPrice: recommendedPrice ?? 0,
      image,
      currency,
      outOfStock,
      priceHistory: [],
      lowestPrice: currentPrice ?? 0,
      highestPrice: currentPrice ?? 0,
      averagePrice: currentPrice ?? 0,
      discountRate: 0,
      description: "Descrição não disponível",
      category: "Categoria não disponível",
      reviewsCount: 0,
      stars: 0,
      users: [],
      isOutOfStock: outOfStock,
    };

    console.log("Product Data:", data);
    return data;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    return null;
  }
}
