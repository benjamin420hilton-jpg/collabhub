import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/db";
import { brandProfiles, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const stripe = getStripe();

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (
          session.mode === "subscription" &&
          session.metadata?.brandProfileId
        ) {
          await handleSubscriptionCreated(
            session.metadata.brandProfileId,
            session.subscription as string,
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

function getSubscriptionPeriod(sub: Stripe.Subscription) {
  // In newer Stripe API versions, period moved to subscription item
  // Use unknown cast to access fields that may or may not exist
  const item = sub.items?.data?.[0] as unknown as Record<string, number | undefined> | undefined;
  const subAny = sub as unknown as Record<string, number | undefined>;

  const periodStart = item?.current_period_start ?? subAny.current_period_start;
  const periodEnd = item?.current_period_end ?? subAny.current_period_end;

  return {
    start: periodStart ? new Date(periodStart * 1000) : null,
    end: periodEnd ? new Date(periodEnd * 1000) : null,
  };
}

async function handleSubscriptionCreated(
  brandProfileId: string,
  subscriptionId: string,
) {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const period = getSubscriptionPeriod(sub);

  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.brandProfileId, brandProfileId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({
        tier: "pro",
        status: "active",
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id ?? null,
        stripeCurrentPeriodStart: period.start,
        stripeCurrentPeriodEnd: period.end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
      .where(eq(subscriptions.brandProfileId, brandProfileId));
  } else {
    await db.insert(subscriptions).values({
      brandProfileId,
      tier: "pro",
      status: "active",
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0]?.price.id ?? null,
      stripeCurrentPeriodStart: period.start,
      stripeCurrentPeriodEnd: period.end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  }

  await db
    .update(brandProfiles)
    .set({ subscriptionTier: "pro" })
    .where(eq(brandProfiles.id, brandProfileId));
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.stripeCustomerId, customerId))
    .limit(1);

  if (!profile) return;

  const isActive = sub.status === "active" || sub.status === "trialing";
  const tier = isActive ? "pro" : "free";
  const period = getSubscriptionPeriod(sub);

  await db
    .update(subscriptions)
    .set({
      tier,
      status: sub.status as typeof subscriptions.$inferInsert.status,
      stripeCurrentPeriodStart: period.start,
      stripeCurrentPeriodEnd: period.end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    })
    .where(eq(subscriptions.brandProfileId, profile.id));

  await db
    .update(brandProfiles)
    .set({ subscriptionTier: tier })
    .where(eq(brandProfiles.id, profile.id));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.stripeCustomerId, customerId))
    .limit(1);

  if (!profile) return;

  await db
    .update(subscriptions)
    .set({
      tier: "free",
      status: "canceled",
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.brandProfileId, profile.id));

  await db
    .update(brandProfiles)
    .set({ subscriptionTier: "free" })
    .where(eq(brandProfiles.id, profile.id));
}
