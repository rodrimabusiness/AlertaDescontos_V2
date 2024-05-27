import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { Product } from "@/types";
import { extractCurrency, extractPrice, getSelectors } from "../utils";

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable",
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraindo HTML da página carregada
    const html = await page.content();
    await browser.close();

    // Analisando o HTML com Cheerio
    const $ = cheerio.load(html);
    const selectors = getSelectors(url);

    // Extração do título
    const title =
      $(selectors.titleSelector).text().trim() || "Título não disponível";

    // Extração dos preços
    const { currentPrice, recommendedPrice } = extractPrice(
      $,
      selectors.fullPriceSelector_2,
      selectors.fullPriceSelector
    );

    // Extração das imagens
    const images = $(selectors.imageSelector)
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src) => src && src.trim().length > 0);
    const image = images.length > 0 ? images[0] : "";

    // Verificação de disponibilidade
    const outOfStock =
      $(selectors.outOfStockSelector).text().trim().toLowerCase() ===
      "currently unavailable";

    // Extração da moeda
    const currency = extractCurrency($(selectors.currencySelector));

    // Montagem do objeto de dados do produto
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
    await browser.close();
    return null;
  }
}
