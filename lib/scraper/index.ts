export async function scrapeAnyProduct(url: string): Promise<any> {
  if (!url) {
    console.error("URL is not provided");
    return null;
  }

  console.log("Scraping URL:", url);
  const isWorten = url.includes("worten.pt");

  try {
    let apiUrl;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    if (isWorten) {
      apiUrl = `${baseUrl}/api/scrapeWithPuppeteer?url=${encodeURIComponent(
        url
      )}`;
    } else {
      apiUrl = `${baseUrl}/api/scrapeWithAxios?url=${encodeURIComponent(url)}`;
    }

    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      console.error("Failed to scrape the product");
      return null;
    }
  } catch (error) {
    console.error("Error in scrapeAnyProduct:", error);
    return null;
  }
}
