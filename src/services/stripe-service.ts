import { stripe } from '@/lib/stripe';
import { updateUserById, findUserById } from '@/data-access/user';
import Stripe from 'stripe';

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_placeholder";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function createCheckoutSession(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await updateUserById(userId, { stripeCustomerId: customerId });
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
    throw new Error("Failed to generate checkout URL");
  }

  return stripeSession.url;
}

export async function createBillingPortalSession(userId: string) {
  const user = await findUserById(userId);

  if (!user?.stripeCustomerId) {
    throw new Error("No active subscription");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const stripeSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return stripeSession.url;
}

export async function processStripeWebhook(body: string, signature: string) {
  let event: Stripe.Event;

  if (!webhookSecret) {
    event = JSON.parse(body);
  } else {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!session?.metadata?.userId) {
        throw new Error("User id is required in metadata");
      }

      await updateUserById(session.metadata.userId, {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
      });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    
    if ((invoice as unknown as { subscription: string }).subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        (invoice as unknown as { subscription: string }).subscription
      );
      
      // We need to find the user by subscription id first, but Prisma doesn't have stripeSubscriptionId indexed by default.
      // So we use raw prisma query for this one or we can add it to user data-access if it existed.
      // Assuming we need to add findUserByStripeSubscriptionId if we didn't have one, or just use raw query via data-access.
      // But we can just import prisma here for this specific one, or add to data-access.
      // Let's add it to data-access via another tool call later if needed, but for now we'll import it from data-access.
      // Wait, we need to update the user where stripeSubscriptionId matches. 
      // I'll add updateSubscription to user data-access.
      const { updateStripeSubscription } = await import('@/data-access/user').catch(() => ({ updateStripeSubscription: null as unknown as (id: string, data: unknown) => Promise<unknown> }));
      if (updateStripeSubscription) {
          await updateStripeSubscription(subscription.id, {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          });
      }
    }
  }
}
