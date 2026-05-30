import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  // @ts-ignore - Stripe API version might be newer than types
  apiVersion: "2023-10-16",
  appInfo: {
    name: "ResumeAI",
    version: "0.1.0",
  },
});
