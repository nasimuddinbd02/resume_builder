import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_placeholder";

export async function POST(req: Request) {
  // Ensure required Stripe environment variables are present
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[STRIPE_CHECKOUT_ERROR] Missing STRIPE_SECRET_KEY env variable");
    return new NextResponse("Stripe configuration missing", { status: 500 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if it doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings?success=true`,
      cancel_url: `${appUrl}/settings?canceled=true`,
      metadata: { userId },
    });

    if (!stripeSession?.url) {
      console.error("[STRIPE_CHECKOUT_ERROR] Stripe session URL missing", stripeSession);
      return new NextResponse("Failed to generate checkout URL", { status: 500 });
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    // Provide a more descriptive error response for debugging
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(`Checkout failed: ${message}`, { status: 500 });
  }
}
