const express = require("express");
const next = require("next");
const mongoose = require("mongoose");
const Product = require("./lib/models/product.model");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  server.post("/api/submit", async (req, res) => {
    const product = req.body;
    try {
      const newProduct = new Product(product);
      await newProduct.save();
      res.status(200).json({ success: true, product: newProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit product" });
    }
  });

  server.get("/api/products", async (req, res) => {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      server.listen(3000, (err) => {
        if (err) throw err;
        console.log("> Ready on http://localhost:3000");
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
});
