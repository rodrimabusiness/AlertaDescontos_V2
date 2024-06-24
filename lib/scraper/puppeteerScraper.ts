import puppeteer, { Browser, Page } from "puppeteer-core";
import { getSelectors, extractCurrency, extractPrice } from "../utils";
import { Product } from "@/types";
import fs from "fs";
import * as cheerio from "cheerio";

const SBR_WS_ENDPOINT = process.env.SBR_WS_ENDPOINT;

const navigateWithRetry = async (
  page: Page,
  url: string,
  retries = 3,
  delay = 500
): Promise<void> => {
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // CAPTCHA handling: To check the status of Scraping Browser's automatic CAPTCHA solver on the target page
    const client = await page.createCDPSession();
    console.log("Waiting for CAPTCHA to solve...");
    const response = (await client.send("Captcha.waitForSolve", {
      detectTimeout: 10000,
    })) as { status?: string };

    const status = response.status;
    if (status) {
      console.log("CAPTCHA solve status:", status);
    } else {
      console.log("CAPTCHA solve status not found in the response");
    }
  } catch (error) {
    if (retries === 0)
      throw new Error(`Navigate to ${url} failed after several retries`);
    console.log(`Retrying navigation to ${url}. Retries left: ${retries}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    await navigateWithRetry(page, url, retries - 1, delay * 2);
  }
};

const normalizeCurrency = (currency: string): string => {
  const euroVariations = ["eur", "euro", "EUR", "Eur", "Euro"];
  return euroVariations.includes(currency.toLowerCase()) ? "€" : currency;
};

const extractFromJSONLD = async (page: Page) => {
  const jsonLDHandle = await page.$('script[type="application/ld+json"]');
  const jsonLDText = jsonLDHandle
    ? await page.evaluate((el) => el.textContent, jsonLDHandle)
    : null;

  if (jsonLDText) {
    const jsonData = JSON.parse(jsonLDText);
    const productData = jsonData["@type"] === "PRODUCT" ? jsonData : null;
    if (productData) {
      const title = productData.name || "Título não disponível";
      const currentPrice = productData.offers
        ? parseFloat(productData.offers.price)
        : 0;
      const image = productData.image || "";
      const outOfStock =
        productData.offers &&
        productData.offers.availability.includes("OutOfStock");
      const currency = normalizeCurrency(
        productData.offers ? productData.offers.priceCurrency : ""
      );
      const description = productData.description || "Descrição não disponível";
      const category = productData.category || "Categoria não disponível";
      const reviewsCount = productData.aggregateRating
        ? productData.aggregateRating.reviewCount
        : 0;
      const stars = productData.aggregateRating
        ? productData.aggregateRating.ratingValue
        : 0;

      return {
        title,
        currentPrice,
        image,
        outOfStock,
        currency,
        description,
        category,
        reviewsCount,
        stars,
      };
    }
  }
  return null;
};

const scrapeWithSelectors = async (page: Page, url: string) => {
  const html = await page.content();
  console.log("Page content retrieved");
  //screenshot the page and have the name with the timestamp of the scraping process
  await page.screenshot({ path: `screenshot-${Date.now()}.png` });

  const $ = cheerio.load(html);
  const selectors = getSelectors(url);

  const title =
    $(selectors.titleSelector).text().trim() || "Título não disponível";
  console.log("Extracted Title:", title);

  const { currentPrice, recommendedPrice } = extractPrice(
    $,
    selectors.fullPriceSelector_2,
    selectors.fullPriceSelector
  );
  console.log("Extracted Prices:", { currentPrice, recommendedPrice });

  const images = $(selectors.imageSelector)
    .map((_, el) => $(el).attr("src"))
    .get()
    .filter((src) => src && src.trim().length > 0);
  const image = images.length > 0 ? images[0] : "";
  console.log("Extracted Image:", image);

  const outOfStock =
    $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
    "currently unavailable";
  console.log("Out of Stock Status:", outOfStock);

  let currency = extractCurrency($(selectors.currencySelector));
  currency = normalizeCurrency(currency);
  console.log("Extracted Currency:", currency);

  return {
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
};

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  console.log(`Scraping URL: ${url}`);
  console.log("Connecting to Scraping Browser...");
  console.log("WebSocket Endpoint:", SBR_WS_ENDPOINT);

  let browser: Browser | null = null;
  try {
    if (!SBR_WS_ENDPOINT) {
      throw new Error(
        "SBR_WS_ENDPOINT is not defined in environment variables"
      );
    }

    browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    console.log("Connected to Scraping Browser");

    const page = await browser.newPage();
    console.log("New page created.");

    await navigateWithRetry(page, url);

    // Attempt to extract from JSON-LD first
    const jsonLdData = await extractFromJSONLD(page);
    if (jsonLdData) {
      console.log("Extracted data from JSON-LD:", jsonLdData);
      return {
        ...jsonLdData,
        url,
        recommendedPrice: 0, // Assuming recommendedPrice isn't provided in JSON-LD
        priceHistory: [],
        lowestPrice: jsonLdData.currentPrice,
        highestPrice: jsonLdData.currentPrice,
        averagePrice: jsonLdData.currentPrice,
        discountRate: 0,
        users: [],
        isOutOfStock: jsonLdData.outOfStock,
      };
    }

    // If JSON-LD extraction failed, fallback to selector-based scraping
    const data = await scrapeWithSelectors(page, url);
    console.log("Extracted data using selectors:", data);

    console.log("Product Data:", data);
    return data;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
}
