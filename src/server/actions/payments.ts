"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  users,
  brandProfiles,
  influencerProfiles,
  contracts,
  payments,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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

/**
 * Creates a Stripe PaymentIntent for escrow funding on a contract.
 * Returns the client_secret for frontend confirmation via Stripe Elements.
 */
export async function fundEscrow(contractId: string) {
  const stripe = getStripe();
  const { user, profile } = await getCurrentBrandProfile();

  // Get the contract
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return { error: "Contract not found" };
  if (contract.brandProfileId !== profile.id) return { error: "Unauthorized" };
  if (contract.status !== "pending_escrow")
    return { error: "Contract is not awaiting escrow funding" };
  if (contract.totalAmount <= 0)
    return { error: "No payment required for this contract" };

  // Verify the influencer has completed Stripe Connect onboarding
  const [influencer] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.id, contract.influencerProfileId))
    .limit(1);

  if (!influencer?.stripeConnectOnboarded) {
    return {
      error:
        "The influencer has not completed payment setup yet. They must set up their Stripe account before you can fund the escrow.",
    };
  }

  // Create or retrieve Stripe customer for the brand
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

  // Create PaymentIntent for the full amount (includes platform fee)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: contract.totalAmount,
    currency: "aud",
    customer: customerId,
    transfer_group: contract.id,
    metadata: {
      contractId: contract.id,
      brandProfileId: profile.id,
      influencerProfileId: contract.influencerProfileId,
      type: "escrow_hold",
    },
  });

  // Store payment intent ID on contract
  await db
    .update(contracts)
    .set({
      stripePaymentIntentId: paymentIntent.id,
      stripeTransferGroup: contract.id,
    })
    .where(eq(contracts.id, contract.id));

  // Create payment record
  await db.insert(payments).values({
    contractId: contract.id,
    type: "escrow_hold",
    status: "pending",
    amount: contract.totalAmount,
    platformFeeAmount: contract.platformFeeAmount,
    currency: "aud",
    stripePaymentIntentId: paymentIntent.id,
    description: "Escrow hold for contract",
  });

  revalidatePath(`/contracts/${contract.id}`);

  return { clientSecret: paymentIntent.client_secret };
}

/**
 * Initiates a refund for a contract's escrow hold.
 * Used when a contract is disputed or canceled before completion.
 */
export async function refundEscrow(contractId: string) {
  const stripe = getStripe();
  const { profile } = await getCurrentBrandProfile();

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return { error: "Contract not found" };
  if (contract.brandProfileId !== profile.id) return { error: "Unauthorized" };
  if (!contract.stripePaymentIntentId)
    return { error: "No payment to refund" };

  // Only allow refund on escrow_funded or disputed contracts
  if (
    contract.status !== "escrow_funded" &&
    contract.status !== "disputed"
  ) {
    return { error: "Contract cannot be refunded in its current state" };
  }

  const refund = await stripe.refunds.create({
    payment_intent: contract.stripePaymentIntentId,
    metadata: {
      contractId: contract.id,
      type: "escrow_refund",
    },
  });

  // Create refund payment record
  await db.insert(payments).values({
    contractId: contract.id,
    type: "refund",
    status: "processing",
    amount: contract.totalAmount,
    currency: "aud",
    stripePaymentIntentId: contract.stripePaymentIntentId,
    stripeRefundId: refund.id,
    description: "Escrow refund — contract canceled",
  });

  // Update contract status
  await db
    .update(contracts)
    .set({ status: "canceled", canceledAt: new Date() })
    .where(eq(contracts.id, contract.id));

  revalidatePath(`/contracts/${contract.id}`);
  return { success: true };
}
