import { scrapeWithPuppeteer } from "./puppeteerScraper";
import { scrapeWithAxios } from "./axiosScraper";

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  console.log("Scraping URL:", url);
  const isWorten = url.includes("worten.pt");

  try {
    if (isWorten) {
      console.log("Using Puppeteer for scraping...");
      return await scrapeWithPuppeteer(url);
    } else {
      console.log("Using Axios for scraping...");
      return await scrapeWithAxios(url);
    }
  } catch (error) {
    console.error("Error in scrapeAnyProduct:", error);
    return null;
  }
}
