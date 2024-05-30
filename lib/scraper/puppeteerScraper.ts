import puppeteer from "puppeteer";
import { Product } from "@/types";

export async function scrapeWithPuppeteer(
  url: string
): Promise<Product | null> {
  try {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

    // Espera pelos elementos especificamente
    await page.waitForSelector(".product-name", { visible: true });
    await page.waitForSelector(".product-image img", { visible: true });
    console.log("Product name and image elements loaded.");

    const data = await page.evaluate(() => {
      const titleSelector = ".product-name";
      const priceIntegerSelector = ".integer";
      const priceDecimalSelector = ".decimal";
      const imageSelector = ".product-image img";
      const outOfStockSelector = ".out-of-stock";

      const titleElement = document.querySelector(titleSelector);
      const priceIntegerElements =
        document.querySelectorAll(priceIntegerSelector);
      const priceDecimalElements =
        document.querySelectorAll(priceDecimalSelector);
      const imageElements = document.querySelectorAll(imageSelector);
      const outOfStockElement = document.querySelector(outOfStockSelector);

      return {
        title: titleElement?.textContent?.trim() || "Título não disponível",
        currentPrice:
          priceIntegerElements.length > 0 && priceDecimalElements.length > 0
            ? parseFloat(
                `${priceIntegerElements[0].textContent}.${priceDecimalElements[0].textContent}`
              )
            : 0,
        recommendedPrice:
          priceIntegerElements.length > 1 && priceDecimalElements.length > 1
            ? parseFloat(
                `${priceIntegerElements[1].textContent}.${priceDecimalElements[1].textContent}`
              )
            : 0,
        image:
          imageElements.length > 0
            ? (imageElements[0] as HTMLImageElement).src
            : "",
        outOfStock: outOfStockElement
          ? outOfStockElement.textContent
              ?.toLowerCase()
              .includes("indisponível") || false
          : false,
        elementsHtml: {
          title: titleElement?.outerHTML || "",
          priceInteger: priceIntegerElements[0]?.outerHTML || "",
          priceDecimal: priceDecimalElements[0]?.outerHTML || "",
          image: imageElements[0]?.outerHTML || "",
          outOfStock: outOfStockElement?.outerHTML || "",
        },
      };
    });

    // Verificação dos elementos HTML no contexto Node.js
    console.log("Title element HTML:", data.elementsHtml.title);
    console.log("Price integer element HTML:", data.elementsHtml.priceInteger);
    console.log("Price decimal element HTML:", data.elementsHtml.priceDecimal);
    console.log("Image element HTML:", data.elementsHtml.image);
    console.log("Out of stock element HTML:", data.elementsHtml.outOfStock);

    const productData: Product = {
      url,
      title: data.title,
      currentPrice: data.currentPrice,
      recommendedPrice: data.recommendedPrice,
      image: data.image,
      currency: "€",
      outOfStock: data.outOfStock,
      priceHistory: [],
      lowestPrice: data.currentPrice,
      highestPrice: data.currentPrice,
      averagePrice: data.currentPrice,
      discountRate: 0,
      description: "Descrição não disponível",
      category: "Categoria não disponível",
      reviewsCount: 0,
      stars: 0,
      users: [],
      isOutOfStock: data.outOfStock,
    };

    await browser.close();
    console.log("Browser closed.");
    console.log("Data evaluated:", productData);

    return productData;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    return null;
  }
}
