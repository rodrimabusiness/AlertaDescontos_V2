import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
});

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String, required: true },
  subscriptions: [userSubscriptionSchema],
});

const productSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    currency: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    recommendedPrice: { type: Number, required: true },
    priceHistory: [priceHistorySchema],
    highestPrice: { type: Number },
    lowestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    stars: { type: Number },
    isOutOfStock: { type: Boolean, default: false },
    users: [userSchema],
  },
  { timestamps: true }
);

const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

export { SubscriptionPlan, User, Product };
