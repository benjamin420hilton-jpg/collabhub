import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/db";
import {
  brandProfiles,
  subscriptions,
  contracts,
  milestones,
  payments,
  influencerProfiles,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { centsToDollars } from "@/lib/constants";

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
        // Handle escrow payment checkout
        if (
          session.mode === "payment" &&
          session.metadata?.type === "escrow_hold" &&
          session.metadata?.contractId
        ) {
          const piId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          if (piId) {
            // Store payment intent ID on the contract
            await db
              .update(contracts)
              .set({
                stripePaymentIntentId: piId,
                stripeTransferGroup: session.metadata.contractId,
                status: "active",
              })
              .where(eq(contracts.id, session.metadata.contractId));

            // Update payment record
            const contractPayments = await db
              .select()
              .from(payments)
              .where(eq(payments.contractId, session.metadata.contractId))
              .limit(1);

            if (contractPayments.length > 0) {
              await db
                .update(payments)
                .set({
                  status: "succeeded",
                  stripePaymentIntentId: piId,
                  processedAt: new Date(),
                })
                .where(eq(payments.id, contractPayments[0].id));
            }

            // Notify influencer
            const [contract] = await db
              .select()
              .from(contracts)
              .where(eq(contracts.id, session.metadata.contractId))
              .limit(1);

            if (contract) {
              const [influencer] = await db
                .select({ userId: influencerProfiles.userId })
                .from(influencerProfiles)
                .where(
                  eq(influencerProfiles.id, contract.influencerProfileId),
                )
                .limit(1);

              if (influencer) {
                await db.insert(notifications).values({
                  userId: influencer.userId,
                  type: "escrow_funded",
                  title: "Contract funded",
                  message:
                    "The brand has funded the escrow. You can start working on your deliverables.",
                  link: `/contracts/${contract.id}`,
                });
              }
            }
          }
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

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        if (pi.metadata?.type === "escrow_hold") {
          await handleEscrowSucceeded(pi);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        if (pi.metadata?.type === "escrow_hold") {
          await handleEscrowFailed(pi);
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferCreated(transfer);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleConnectAccountUpdated(account);
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

// --- Payment / Escrow handlers ---

async function handleEscrowSucceeded(pi: Stripe.PaymentIntent) {
  const contractId = pi.metadata?.contractId;
  if (!contractId) return;

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return;

  // Move contract from pending_escrow → escrow_funded → active
  await db
    .update(contracts)
    .set({ status: "active" })
    .where(eq(contracts.id, contractId));

  // Update payment record
  await db
    .update(payments)
    .set({ status: "succeeded", processedAt: new Date() })
    .where(eq(payments.stripePaymentIntentId, pi.id));

  // Notify the influencer
  // Look up the influencer's userId via their profile
  const [influencer] = await db
    .select({ userId: influencerProfiles.userId })
    .from(influencerProfiles)
    .where(eq(influencerProfiles.id, contract.influencerProfileId))
    .limit(1);

  if (influencer) {
    await db.insert(notifications).values({
      userId: influencer.userId,
      type: "escrow_funded",
      title: "Contract funded",
      message:
        "The brand has funded the escrow for your contract. You can start working on your deliverables.",
      link: `/contracts/${contractId}`,
    });
  }
}

async function handleEscrowFailed(pi: Stripe.PaymentIntent) {
  const contractId = pi.metadata?.contractId;
  if (!contractId) return;

  // Update payment record
  await db
    .update(payments)
    .set({
      status: "failed",
      failureReason:
        (pi.last_payment_error?.message as string) ?? "Payment failed",
      processedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, pi.id));

  // Notify the brand
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return;

  // Find brand userId
  const [brand] = await db
    .select({ userId: brandProfiles.userId })
    .from(brandProfiles)
    .where(eq(brandProfiles.id, contract.brandProfileId))
    .limit(1);

  if (brand) {
    await db.insert(notifications).values({
      userId: brand.userId,
      type: "payment_failed",
      title: "Escrow payment failed",
      message:
        "Your escrow payment failed. Please update your payment method and try again.",
      link: `/contracts/${contractId}`,
    });
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  const milestoneId = transfer.metadata?.milestoneId;
  if (!milestoneId) return;

  // Update milestone
  await db
    .update(milestones)
    .set({ paidAt: new Date() })
    .where(eq(milestones.id, milestoneId));

  // Update the payment record
  if (transfer.metadata?.paymentId) {
    await db
      .update(payments)
      .set({ status: "succeeded", processedAt: new Date() })
      .where(eq(payments.id, transfer.metadata.paymentId));
  }

  // Notify the influencer
  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);

  if (!milestone) return;

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, milestone.contractId))
    .limit(1);

  if (!contract) return;

  const [influencer] = await db
    .select({ userId: influencerProfiles.userId })
    .from(influencerProfiles)
    .where(eq(influencerProfiles.id, contract.influencerProfileId))
    .limit(1);

  if (influencer) {
    await db.insert(notifications).values({
      userId: influencer.userId,
      type: "milestone_paid",
      title: "Payment received",
      message: `You've been paid $${centsToDollars(milestone.amount)} for "${milestone.title}".`,
      link: `/contracts/${contract.id}`,
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const piId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!piId) return;

  // Update refund payment records
  await db
    .update(payments)
    .set({ status: "refunded", processedAt: new Date() })
    .where(eq(payments.stripePaymentIntentId, piId));
}

async function handleConnectAccountUpdated(account: Stripe.Account) {
  if (!account.id) return;

  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;
  const isOnboarded = chargesEnabled && payoutsEnabled;

  if (isOnboarded) {
    await db
      .update(influencerProfiles)
      .set({ stripeConnectOnboarded: true })
      .where(eq(influencerProfiles.stripeConnectAccountId, account.id));
  }
}
