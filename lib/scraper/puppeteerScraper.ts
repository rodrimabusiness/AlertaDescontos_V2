import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { Product } from "@/types";

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "/var/task/node_modules/@sparticuz/chromium/bin"
        )),
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3"
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      const titleElement = document.querySelector(".product-name");
      const title = titleElement
        ? titleElement.textContent?.trim() || "Título não disponível"
        : "Título não disponível";

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

      const imageElements = document.querySelectorAll(".product-image img");
      const images = Array.from(imageElements).map(
        (img) => (img as HTMLImageElement).src
      );
      const image = images.length > 0 ? images[0] : "";

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

    await browser.close();
    return data;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    return null;
  }
}
