import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { processStripeWebhook } from "@/services/stripe-service";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  try {
    await processStripeWebhook(body, signature);
    return new NextResponse(null, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[STRIPE_WEBHOOK_ERROR]", errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
}
