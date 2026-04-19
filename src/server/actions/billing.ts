"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, brandProfiles, influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";

async function getCurrentBrandProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "brand") throw new Error("Not a brand account");

  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, user.id))
    .limit(1);

  if (!profile) throw new Error("Brand profile not found");
  return { user, profile };
}

export async function createCheckoutSession() {
  const stripe = getStripe();
  const { user, profile } = await getCurrentBrandProfile();

  // Create or retrieve Stripe customer
  let customerId = profile.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        brandProfileId: profile.id,
        userId: user.id,
      },
    });
    customerId = customer.id;

    await db
      .update(brandProfiles)
      .set({ stripeCustomerId: customerId })
      .where(eq(brandProfiles.id, profile.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      brandProfileId: profile.id,
    },
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createPortalSession() {
  const stripe = getStripe();
  const { profile } = await getCurrentBrandProfile();

  if (!profile.stripeCustomerId) {
    return { error: "No billing account found" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

// --- Influencer Pro subscription ---

async function getCurrentInfluencerProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "influencer")
    throw new Error("Not an influencer account");

  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, user.id))
    .limit(1);

  if (!profile) throw new Error("Influencer profile not found");
  return { user, profile };
}

export async function createInfluencerCheckoutSession() {
  const stripe = getStripe();
  const { user, profile } = await getCurrentInfluencerProfile();

  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        influencerProfileId: profile.id,
        userId: user.id,
      },
    });
    customerId = customer.id;
    await db
      .update(influencerProfiles)
      .set({ stripeCustomerId: customerId })
      .where(eq(influencerProfiles.id, profile.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_INFLUENCER_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        influencerProfileId: profile.id,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      influencerProfileId: profile.id,
      subscriberType: "influencer",
    },
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createInfluencerPortalSession() {
  const stripe = getStripe();
  const { profile } = await getCurrentInfluencerProfile();

  if (!profile.stripeCustomerId) {
    return { error: "No billing account found" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  if (session.url) {
    redirect(session.url);
  }
}
