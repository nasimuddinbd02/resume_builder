import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBillingPortalSession } from "@/services/stripe-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = await createBillingPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[STRIPE_BILLING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
