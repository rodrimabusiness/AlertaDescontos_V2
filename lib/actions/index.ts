"use server";

import { revalidatePath } from "next/cache";
import { Product } from "../models/product.model";
import { connectToDB, disconnectFromDB } from "../mongoose";
import { scrapeAnyProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToDB();

    const scrapedProduct = await scrapeAnyProduct(productUrl);
    if (!scrapedProduct) return;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    let productData = {
      ...scrapedProduct,
      image: scrapedProduct.image,
      recommendedPrice: scrapedProduct.recommendedPrice,
    };

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      productData = {
        ...productData,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      { $set: productData },
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  } finally {
    await disconnectFromDB();
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  } finally {
    await disconnectFromDB();
  }
}

export async function getAllProducts() {
  try {
    await connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  } finally {
    await disconnectFromDB();
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  } finally {
    await disconnectFromDB();
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    await connectToDB();

    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await disconnectFromDB();
  }
}
