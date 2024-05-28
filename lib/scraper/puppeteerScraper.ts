import puppeteer from "puppeteer";
import { Product } from "@/types";

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROME_PATH || puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extração de dados usando Puppeteer
    console.log("Scraping with Puppeteer...");
    const data = await page.evaluate(() => {
      // Título do produto
      const titleElement = document.querySelector(".product-name");
      const title = titleElement
        ? titleElement.textContent?.trim() || "Título não disponível"
        : "Título não disponível";

      // Preços
      const priceIntegerElements = document.querySelectorAll(".integer");
      const priceDecimalElements = document.querySelectorAll(".decimal");

      const currentPrice =
        priceIntegerElements.length > 0 && priceDecimalElements.length > 0
          ? parseFloat(
              `${priceIntegerElements[0].textContent}.${priceDecimalElements[0].textContent}`
            )
          : 0;
      const recommendedPrice =
        priceIntegerElements.length > 1 && priceDecimalElements.length > 1
          ? parseFloat(
              `${priceIntegerElements[1].textContent}.${priceDecimalElements[1].textContent}`
            )
          : 0;

      // Imagens
      const imageElements = document.querySelectorAll(".product-image img");
      const images = Array.from(imageElements).map(
        (img) => (img as HTMLImageElement).src
      );
      const image = images.length > 0 ? images[0] : "";

      // Disponibilidade
      const outOfStockElement = document.querySelector(".out-of-stock");
      const outOfStock = outOfStockElement
        ? outOfStockElement.textContent
            ?.toLowerCase()
            .includes("indisponível") || false
        : false;

      return {
        url: window.location.href,
        title,
        currentPrice,
        recommendedPrice,
        image,
        currency: "€",
        outOfStock,
        priceHistory: [],
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice,
        discountRate: 0,
        description: "Descrição não disponível",
        category: "Categoria não disponível",
        reviewsCount: 0,
        stars: 0,
        users: [],
        isOutOfStock: outOfStock,
      };
    });

    console.log("Product Data:", data);

    await browser.close();
    return data;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    await browser.close();
    return null;
  }
}
