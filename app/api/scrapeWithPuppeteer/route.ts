import { NextRequest, NextResponse } from "next/server";
import { scrapeWithPuppeteer } from "../../../lib/scraper/puppeteerScraper";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const result = await scrapeWithPuppeteer(url);
    if (result) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to scrape the product" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API route /api/scrapeWithPuppeteer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
