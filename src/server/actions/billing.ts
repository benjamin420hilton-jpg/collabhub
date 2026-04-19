"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, brandProfiles, influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

type ActionError = { error: string };

type StripeErrorLike = Error & { code?: string; param?: string };

function isStripeError(err: unknown): err is StripeErrorLike {
  return err instanceof Stripe.errors.StripeError;
}

function describeStripeError(err: unknown, context: string): string {
  if (isStripeError(err)) {
    const code = err.code ? ` [${err.code}]` : "";
    const param = err.param ? ` (param: ${err.param})` : "";
    return `Stripe error during ${context}${code}${param}: ${err.message}`;
  }
  if (err instanceof Error) return `${context} failed: ${err.message}`;
  return `${context} failed: ${String(err)}`;
}

function requireEnv(name: string): string | ActionError {
  const value = process.env[name];
  if (!value) {
    console.error(`[billing] Missing env var: ${name}`);
    return { error: `Server misconfiguration: ${name} is not set.` };
  }
  return value;
}

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

export async function createCheckoutSession(): Promise<ActionError> {
  const priceIdOrErr = requireEnv("STRIPE_PRO_MONTHLY_PRICE_ID");
  if (typeof priceIdOrErr !== "string") return priceIdOrErr;
  const appUrlOrErr = requireEnv("NEXT_PUBLIC_APP_URL");
  if (typeof appUrlOrErr !== "string") return appUrlOrErr;
  const secretOrErr = requireEnv("STRIPE_SECRET_KEY");
  if (typeof secretOrErr !== "string") return secretOrErr;

  const stripe = getStripe();
  const { user, profile } = await getCurrentBrandProfile();

  let checkoutUrl: string | null = null;
  try {
    let customerId = profile.stripeCustomerId;

    const ensureCustomer = async () => {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { brandProfileId: profile.id, userId: user.id },
      });
      await db
        .update(brandProfiles)
        .set({ stripeCustomerId: customer.id })
        .where(eq(brandProfiles.id, profile.id));
      return customer.id;
    };

    if (!customerId) customerId = await ensureCustomer();

    const createSession = (id: string) =>
      stripe.checkout.sessions.create({
        customer: id,
        mode: "subscription",
        line_items: [{ price: priceIdOrErr, quantity: 1 }],
        success_url: `${appUrlOrErr}/settings/billing?success=true`,
        cancel_url: `${appUrlOrErr}/settings/billing?canceled=true`,
        metadata: { brandProfileId: profile.id },
      });

    let session;
    try {
      session = await createSession(customerId);
    } catch (err) {
      // Recover from stale/cross-mode customer ID
      if (isStripeError(err) && err.code === "resource_missing") {
        console.warn(
          `[billing] Stale brand stripeCustomerId ${customerId} — recreating.`,
        );
        customerId = await ensureCustomer();
        session = await createSession(customerId);
      } else {
        throw err;
      }
    }

    if (!session.url) {
      return { error: "Stripe did not return a checkout URL." };
    }
    checkoutUrl = session.url;
  } catch (err) {
    const message = describeStripeError(err, "brand checkout session");
    console.error("[billing]", message, err);
    return { error: message };
  }

  redirect(checkoutUrl);
}

export async function createPortalSession(): Promise<ActionError> {
  const appUrlOrErr = requireEnv("NEXT_PUBLIC_APP_URL");
  if (typeof appUrlOrErr !== "string") return appUrlOrErr;

  const stripe = getStripe();
  const { profile } = await getCurrentBrandProfile();

  if (!profile.stripeCustomerId) {
    return { error: "No billing account found" };
  }

  let portalUrl: string | null = null;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${appUrlOrErr}/settings/billing`,
    });
    if (!session.url) return { error: "Stripe did not return a portal URL." };
    portalUrl = session.url;
  } catch (err) {
    const message = describeStripeError(err, "brand billing portal session");
    console.error("[billing]", message, err);
    return { error: message };
  }

  redirect(portalUrl);
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

export async function createInfluencerCheckoutSession(): Promise<ActionError> {
  const priceIdOrErr = requireEnv("STRIPE_INFLUENCER_PRO_PRICE_ID");
  if (typeof priceIdOrErr !== "string") return priceIdOrErr;
  const appUrlOrErr = requireEnv("NEXT_PUBLIC_APP_URL");
  if (typeof appUrlOrErr !== "string") return appUrlOrErr;
  const secretOrErr = requireEnv("STRIPE_SECRET_KEY");
  if (typeof secretOrErr !== "string") return secretOrErr;

  const stripe = getStripe();
  const { user, profile } = await getCurrentInfluencerProfile();

  let checkoutUrl: string | null = null;
  try {
    let customerId = profile.stripeCustomerId;

    const ensureCustomer = async () => {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { influencerProfileId: profile.id, userId: user.id },
      });
      await db
        .update(influencerProfiles)
        .set({ stripeCustomerId: customer.id })
        .where(eq(influencerProfiles.id, profile.id));
      return customer.id;
    };

    if (!customerId) customerId = await ensureCustomer();

    const createSession = (id: string) =>
      stripe.checkout.sessions.create({
        customer: id,
        mode: "subscription",
        line_items: [{ price: priceIdOrErr, quantity: 1 }],
        subscription_data: {
          trial_period_days: 7,
          metadata: { influencerProfileId: profile.id },
        },
        success_url: `${appUrlOrErr}/settings/billing?success=true`,
        cancel_url: `${appUrlOrErr}/settings/billing?canceled=true`,
        metadata: {
          influencerProfileId: profile.id,
          subscriberType: "influencer",
        },
      });

    let session;
    try {
      session = await createSession(customerId);
    } catch (err) {
      if (isStripeError(err) && err.code === "resource_missing") {
        console.warn(
          `[billing] Stale influencer stripeCustomerId ${customerId} — recreating.`,
        );
        customerId = await ensureCustomer();
        session = await createSession(customerId);
      } else {
        throw err;
      }
    }

    if (!session.url) {
      return { error: "Stripe did not return a checkout URL." };
    }
    checkoutUrl = session.url;
  } catch (err) {
    const message = describeStripeError(err, "influencer checkout session");
    console.error("[billing]", message, err);
    return { error: message };
  }

  redirect(checkoutUrl);
}

export async function createInfluencerPortalSession(): Promise<ActionError> {
  const appUrlOrErr = requireEnv("NEXT_PUBLIC_APP_URL");
  if (typeof appUrlOrErr !== "string") return appUrlOrErr;

  const stripe = getStripe();
  const { profile } = await getCurrentInfluencerProfile();

  if (!profile.stripeCustomerId) {
    return { error: "No billing account found" };
  }

  let portalUrl: string | null = null;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${appUrlOrErr}/settings/billing`,
    });
    if (!session.url) return { error: "Stripe did not return a portal URL." };
    portalUrl = session.url;
  } catch (err) {
    const message = describeStripeError(
      err,
      "influencer billing portal session",
    );
    console.error("[billing]", message, err);
    return { error: message };
  }

  redirect(portalUrl);
}
