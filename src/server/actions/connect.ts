"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";

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

/**
 * Creates a Stripe Connect Express account for the influencer
 * and returns an onboarding link URL.
 */
export async function createConnectAccount() {
  const stripe = getStripe();
  const { user, profile } = await getCurrentInfluencerProfile();

  // If already has an account, just generate a new onboarding link
  if (profile.stripeConnectAccountId) {
    return createConnectOnboardingLink();
  }

  const account = await stripe.accounts.create({
    type: "express",
    country: "AU",
    email: user.email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      influencerProfileId: profile.id,
      userId: user.id,
    },
  });

  await db
    .update(influencerProfiles)
    .set({ stripeConnectAccountId: account.id })
    .where(eq(influencerProfiles.id, profile.id));

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}

/**
 * Generates a new onboarding link for an existing Connect account.
 * Used when the influencer needs to complete or refresh their onboarding.
 */
export async function createConnectOnboardingLink() {
  const stripe = getStripe();
  const { profile } = await getCurrentInfluencerProfile();

  if (!profile.stripeConnectAccountId) {
    return { error: "No Connect account found. Please create one first." };
  }

  const accountLink = await stripe.accountLinks.create({
    account: profile.stripeConnectAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}

/**
 * Generates a Stripe Express dashboard login link for the influencer
 * to view their payouts and transaction history.
 */
export async function createConnectDashboardLink() {
  const stripe = getStripe();
  const { profile } = await getCurrentInfluencerProfile();

  if (!profile.stripeConnectAccountId) {
    return { error: "No Connect account found." };
  }

  if (!profile.stripeConnectOnboarded) {
    return { error: "Connect account onboarding not yet complete." };
  }

  const loginLink = await stripe.accounts.createLoginLink(
    profile.stripeConnectAccountId,
  );

  return { url: loginLink.url };
}
