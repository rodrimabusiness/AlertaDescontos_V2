import { scrapeWithPuppeteer } from "./puppeteerScraper";
import { scrapeWithAxios } from "./axiosScraper";

export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  const isWorten = url.includes("worten.pt");

  if (isWorten) {
    return await scrapeWithPuppeteer(url);
  } else {
    return await scrapeWithAxios(url);
  }
}
