import { NextRequest, NextResponse } from "next/server";
import { scrapeWithPuppeteer } from "@/lib/scraper/puppeteerScraper";

export const config = {
  runtime: "edge",
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new NextResponse(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Starting scrape for URL: ${url}`);
    const scrapedData = await scrapeWithPuppeteer(url);

    if (scrapedData) {
      console.log("Scraping successful");
      return new NextResponse(JSON.stringify(scrapedData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.log("Scraping failed, no data returned");
      return new NextResponse(
        JSON.stringify({ error: "Failed to scrape data" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error during scraping:", error);
    return new NextResponse(
      JSON.stringify({ error: "An error occurred during scraping" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
