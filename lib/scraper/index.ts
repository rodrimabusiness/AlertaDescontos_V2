import { scrapeWithAxios } from "./axiosScraper";
import { scrapeWithPuppeteer } from "./puppeteerScraper";

export async function scrapeAnyProduct(url: string) {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  // Verifica se o URL é da Worten
  const isWorten = url.includes("worten.pt");

  if (isWorten) {
    return await scrapeWithPuppeteer(url);
  } else {
    return await scrapeWithAxios(url);
  }
}
