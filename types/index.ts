export type PriceHistoryItem = {
  price: number;
  date: Date;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export type UserSubscription = {
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "INACTIVE"; // Status of the subscription
};

export type User = {
  id: string;
  name: string;
  email?: string;
  role: string;
  subscriptions: UserSubscription[];
};

export type Product = {
  [x: string]: any;
  _id?: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  recommendedPrice: number;
  priceHistory: PriceHistoryItem[];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  users: User[];
};

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};
