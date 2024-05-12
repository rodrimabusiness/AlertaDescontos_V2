import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PriceHistoryItem, Product } from "@/types";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(
  $: CheerioAPI,
  selector1: string | undefined,
  selector2: string | undefined
): { currentPrice: number | null; recommendedPrice: number | null } {
  const selectors = [selector1, selector2].filter((s): s is string => !!s);
  let prices: number[] = [];

  console.log("Selectors:", selectors); // Log dos seletores ativos

  if (selectors.some((s) => s.includes(".integer") || s.includes(".decimal"))) {
    // Lógica específica para a Worten onde os preços estão separados em inteiro e decimal
    let integerPrices = $(selectors[0])
      .map((_, el) => $(el).text().trim())
      .get();
    console.log("Integer Prices:", integerPrices); // Log dos preços inteiros

    let decimalPrices = $(selectors[1])
      .map((_, el) => $(el).text().trim())
      .get();
    console.log("Decimal Prices:", decimalPrices); // Log dos preços decimais

    for (let i = 0; i < integerPrices.length; i++) {
      const fullPrice = parseFloat(integerPrices[i] + "." + decimalPrices[i]);
      if (!isNaN(fullPrice)) prices.push(fullPrice);
    }
    console.log("Combined Full Prices:", prices); // Log dos preços combinados
  } else {
    // Lógica geral para outros seletores (Amazon)
    selectors.forEach((selector) => {
      const extractedTexts = $(selector)
        .map((_, el) => {
          // Look upwards in the DOM to see if within an excluded section
          const isWithinUsed =
            $(el).closest("#apex_desktop_usedAccordionRow").length > 0;
          return { text: $(el).text().trim(), isWithinUsed };
        })
        .get();

      console.log(`Extracted Texts for ${selector}:`, extractedTexts); // Log the texts extracted for debugging

      extractedTexts.forEach(({ text, isWithinUsed }) => {
        const priceRegex = /(\d+,\d+)\s*€/;
        const match = text.match(priceRegex);
        if (match && !isWithinUsed) {
          // Ensure it's not within the "used" section
          const price = parseFloat(match[1].replace(",", "."));
          if (!isNaN(price)) {
            prices.push(price);
          }
        }
      });
    });
    console.log("Prices from all selectors:", prices); // Log all prices found
  }

  if (prices.length > 0) {
    return {
      currentPrice: Math.min(...prices),
      recommendedPrice: Math.max(...prices),
    };
  }

  console.error("Price not found or invalid across all selectors.");
  return { currentPrice: null, recommendedPrice: null };
}

export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

/*
export function extractDescription(
  $: CherrioStatic,
  descriptionSelector: string
) {
  // Utilize o seletor fornecido para encontrar a descrição
  const elements = $(descriptionSelector);
  if (elements.length > 0) {
    const textContent = elements
      .map((_: any, element: any) => $(element).text().trim())
      .get()
      .join("\n");
    return textContent;
  }
  return ""; // Retorna string vazia se nenhum elemento for encontrado
}
*/

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number | null | undefined): string => {
  return num
    ? num.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "€0,00";
};

export function getSelectors(url: string) {
  const hostname = new URL(url).hostname;
  if (hostname.includes("worten.pt")) {
    return {
      titleSelector: "div.product-header__title h1.title span",
      fullPriceSelector_2:
        "#__nuxt > div > div > div:nth-child(2) > div:nth-child(11) > div > section > div > div > div.product-heading__buy-boxes > div.buy-box > div:nth-child(2) > div > div.product-price-info > span > span .integer",
      fullPriceSelector:
        "#__nuxt > div > div > div:nth-child(2) > div:nth-child(11) > div > section > div > div > div.product-heading__buy-boxes > div.buy-box > div:nth-child(2) > div > div.product-price-info > span > span .decimal",
      imageSelector: "img.product-gallery__slider-image[src]",
      outOfStockSelector:
        ".availability .out-of-stock, .availability .outOfStock",
      descriptionSelector: ".product-description p",
      currencySelector: ".symbol",
    };
  } else if (hostname.includes("amazon.")) {
    return {
      titleSelector: "#productTitle",
      fullPriceSelector_2: ".aok-offscreen",
      fullPriceSelector: "#sns-base-price .a-offscreen", // seletor para o preço completo oculto para acessibilidade
      imageSelector: "#landingImage, #imgBlkFront",
      outOfStockSelector: "#availability .a-color-state",
      descriptionSelector: "#productDescription",
      currencySelector: ".a-price-symbol",
    };
  }
  throw new Error("Unsupported site");
}
