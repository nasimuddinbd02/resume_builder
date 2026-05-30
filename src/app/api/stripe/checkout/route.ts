import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/services/stripe-service";

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

    const url = await createCheckoutSession(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    // Provide a more descriptive error response for debugging
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(`Checkout failed: ${message}`, { status: 500 });
  }
}
