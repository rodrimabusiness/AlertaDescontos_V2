import puppeteer from "puppeteer";

export async function scrapeWithPuppeteer(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate((url) => {
      const title = document
        .querySelector(".product-name")
        ?.textContent?.trim();
      const priceInteger = document.querySelectorAll(".integer");
      const priceDecimal = document.querySelectorAll(".decimal");

      const currentPrice = parseFloat(
        `${priceInteger[0].textContent}.${priceDecimal[0].textContent}`
      );
      const recommendedPrice = parseFloat(
        `${priceInteger[1].textContent}.${priceDecimal[1].textContent}`
      );

      const images = Array.from(
        document.querySelectorAll(".product-image img")
      ).map((img) => (img as HTMLImageElement).src);

      const outOfStock = document
        .querySelector(".out-of-stock")
        ?.textContent?.toLowerCase()
        .includes("indisponível");

      return {
        url,
        title,
        currentPrice,
        recommendedPrice,
        images: images.filter((src) => src && src.trim().length > 0), // Filtra URLs inválidas
        currency: "€",
        outOfStock,
        priceHistory: [],
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice,
      };
    }, url);

    console.log("Product Data:", data);

    await browser.close();
    return data;
  } catch (error) {
    console.error("Error during product scraping with Puppeteer:", error);
    await browser.close();
    return null;
  }
}
