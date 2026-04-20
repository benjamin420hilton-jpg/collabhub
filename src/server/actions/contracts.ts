"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  users,
  brandProfiles,
  influencerProfiles,
  proposals,
  campaigns,
  contracts,
  milestones,
  payments,
} from "@/db/schema";
import { createNotification } from "@/server/actions/notifications";
import { eq, and, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createContractSchema,
  submitMilestoneSchema,
  reviewMilestoneSchema,
  type CreateContractInput,
  type SubmitMilestoneInput,
  type ReviewMilestoneInput,
} from "@/lib/validators/contract";
import {
  dollarsToCents,
  centsToDollars,
  PLATFORM_FEE_RATES,
  calculatePlatformFee,
} from "@/lib/constants";
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
  return profile;
}

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
  return profile;
}

export async function createContract(input: CreateContractInput) {
  const brandProfile = await getCurrentBrandProfile();

  const parsed = createContractSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid contract data" };
  }

  // Get the proposal
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, parsed.data.proposalId))
    .limit(1);

  if (!proposal) return { error: "Proposal not found" };
  if (proposal.status !== "accepted")
    return { error: "Proposal must be accepted first" };

  // Verify brand owns the campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, proposal.campaignId))
    .limit(1);

  if (!campaign || campaign.brandProfileId !== brandProfile.id)
    return { error: "Unauthorized" };

  // Check if contract already exists for this proposal
  const [existing] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(eq(contracts.proposalId, proposal.id))
    .limit(1);

  if (existing) return { error: "Contract already exists for this proposal" };

  // Calculate financials
  const totalAmountDollars = parsed.data.milestones.reduce(
    (sum, m) => sum + m.amount,
    0,
  );
  const totalAmount = dollarsToCents(totalAmountDollars);
  const feeRate =
    PLATFORM_FEE_RATES[brandProfile.subscriptionTier] ??
    PLATFORM_FEE_RATES.free;
  const feeAmount = calculatePlatformFee(totalAmount, feeRate);
  const influencerPayout = totalAmount - feeAmount;

  const isNonCash =
    campaign.type === "gifting" || campaign.type === "product_exchange";
  const isProductExchange =
    campaign.type === "product_exchange" || campaign.type === "hybrid";

  // Create contract
  const [contract] = await db
    .insert(contracts)
    .values({
      proposalId: proposal.id,
      brandProfileId: brandProfile.id,
      influencerProfileId: proposal.influencerProfileId,
      status: isNonCash ? "active" : "pending_escrow",
      totalAmount: isNonCash ? 0 : totalAmount,
      platformFeeRate: isNonCash ? 0 : feeRate,
      platformFeeAmount: isNonCash ? 0 : feeAmount,
      influencerPayout: isNonCash ? 0 : influencerPayout,
      // Product exchange fields
      deliveryStatus: isProductExchange ? "pending" : null,
      productDescription: isProductExchange
        ? (campaign.giftDescription ?? null)
        : null,
    })
    .returning();

  // Create milestones
  await db.insert(milestones).values(
    parsed.data.milestones.map((m, i) => ({
      contractId: contract.id,
      sortOrder: i + 1,
      title: m.title,
      description: m.description ?? null,
      amount: isNonCash ? 0 : dollarsToCents(m.amount),
      dueDate: m.dueDate ?? null,
    })),
  );

  // Update campaign status
  await db
    .update(campaigns)
    .set({ status: "in_progress" })
    .where(eq(campaigns.id, campaign.id));

  revalidatePath("/contracts");
  redirect(`/contracts/${contract.id}`);
}

export async function submitMilestone(input: SubmitMilestoneInput) {
  const influencerProfile = await getCurrentInfluencerProfile();

  const parsed = submitMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid submission data" };
  }

  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, parsed.data.milestoneId))
    .limit(1);

  if (!milestone) return { error: "Milestone not found" };

  // Verify influencer owns this contract
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, milestone.contractId))
    .limit(1);

  if (!contract || contract.influencerProfileId !== influencerProfile.id)
    return { error: "Unauthorized" };

  if (
    milestone.status !== "pending" &&
    milestone.status !== "in_progress" &&
    milestone.status !== "revision_requested"
  )
    return { error: "Milestone cannot be submitted in its current state" };

  // Block submission if product delivery hasn't been confirmed
  if (
    contract.deliveryStatus !== null &&
    contract.deliveryStatus !== "delivered"
  ) {
    return {
      error:
        "Product delivery must be confirmed before you can submit content.",
    };
  }

  await db
    .update(milestones)
    .set({
      status: "submitted",
      submissionUrl: parsed.data.submissionUrl,
      submissionNotes: parsed.data.submissionNotes ?? null,
      submittedAt: new Date(),
    })
    .where(eq(milestones.id, milestone.id));

  revalidatePath(`/contracts/${contract.id}`);
  return { success: true };
}

export async function reviewMilestone(input: ReviewMilestoneInput) {
  const brandProfile = await getCurrentBrandProfile();

  const parsed = reviewMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid review data" };
  }

  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, parsed.data.milestoneId))
    .limit(1);

  if (!milestone) return { error: "Milestone not found" };
  if (milestone.status !== "submitted")
    return { error: "Milestone must be submitted before review" };

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, milestone.contractId))
    .limit(1);

  if (!contract || contract.brandProfileId !== brandProfile.id)
    return { error: "Unauthorized" };

  if (parsed.data.action === "approve") {
    // If milestone has a cash amount, create a Stripe transfer to the influencer
    if (milestone.amount > 0 && contract.stripeTransferGroup) {
      const stripe = getStripe();

      // Calculate influencer's share for this milestone
      const milestoneFee = calculatePlatformFee(
        milestone.amount,
        contract.platformFeeRate,
      );
      const milestoneInfluencerAmount = milestone.amount - milestoneFee;

      // Get influencer's connected account
      const [influencer] = await db
        .select()
        .from(influencerProfiles)
        .where(eq(influencerProfiles.id, contract.influencerProfileId))
        .limit(1);

      if (!influencer?.stripeConnectAccountId) {
        return {
          error: "Influencer has not completed payment setup",
        };
      }

      if (!influencer.stripePayoutsEnabled) {
        return {
          error:
            "Influencer's Stripe account cannot receive payouts yet. Ask them to complete their Stripe onboarding.",
        };
      }

      const transfer = await stripe.transfers.create(
        {
          amount: milestoneInfluencerAmount,
          currency: "aud",
          destination: influencer.stripeConnectAccountId,
          transfer_group: contract.stripeTransferGroup,
          metadata: {
            milestoneId: milestone.id,
            contractId: contract.id,
          },
        },
        { idempotencyKey: `milestone_transfer_${milestone.id}` },
      );

      // Update milestone with transfer ID
      await db
        .update(milestones)
        .set({
          status: "paid",
          approvedAt: new Date(),
          paidAt: new Date(),
          stripeTransferId: transfer.id,
        })
        .where(eq(milestones.id, milestone.id));

      // Create payment record for the milestone release
      await db.insert(payments).values({
        contractId: contract.id,
        milestoneId: milestone.id,
        type: "milestone_release",
        status: "processing",
        amount: milestoneInfluencerAmount,
        platformFeeAmount: milestoneFee,
        currency: "aud",
        stripeTransferId: transfer.id,
        description: `Payout for milestone: ${milestone.title}`,
      });

      // Create platform fee audit record
      if (milestoneFee > 0) {
        await db.insert(payments).values({
          contractId: contract.id,
          milestoneId: milestone.id,
          type: "platform_fee",
          status: "succeeded",
          amount: milestoneFee,
          currency: "aud",
          description: `5% Payment Protection Fee on "${milestone.title}"`,
          processedAt: new Date(),
        });
      }
    } else {
      // Non-cash milestone (gifting/product exchange) — just approve
      await db
        .update(milestones)
        .set({
          status: "approved",
          approvedAt: new Date(),
        })
        .where(eq(milestones.id, milestone.id));
    }

    // Check if all milestones are approved/paid → complete the contract
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.contractId, contract.id));

    const allDone = allMilestones.every(
      (m) =>
        m.id === milestone.id ||
        m.status === "approved" ||
        m.status === "paid",
    );

    if (allDone) {
      await db
        .update(contracts)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(contracts.id, contract.id));
    }
  } else {
    await db
      .update(milestones)
      .set({
        status: "revision_requested",
        revisionNotes: parsed.data.revisionNotes ?? null,
      })
      .where(eq(milestones.id, milestone.id));
  }

  revalidatePath(`/contracts/${contract.id}`);
  return { success: true };
}

// --- Product Exchange / Shipping actions ---

/**
 * Brand provides a shipping tracking number after sending the product.
 */
export async function updateShippingTracking(
  contractId: string,
  trackingNumber: string,
  estimatedDeliveryDate?: Date,
) {
  const brandProfile = await getCurrentBrandProfile();

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return { error: "Contract not found" };
  if (contract.brandProfileId !== brandProfile.id)
    return { error: "Unauthorized" };
  if (contract.deliveryStatus === null)
    return { error: "This contract does not involve product delivery" };

  await db
    .update(contracts)
    .set({
      shippingTrackingNumber: trackingNumber,
      deliveryStatus: "shipped",
      estimatedDeliveryDate: estimatedDeliveryDate ?? null,
    })
    .where(eq(contracts.id, contractId));

  // Notify the influencer
  const [influencer] = await db
    .select({ userId: influencerProfiles.userId })
    .from(influencerProfiles)
    .where(eq(influencerProfiles.id, contract.influencerProfileId))
    .limit(1);

  if (influencer) {
    await createNotification(
      influencer.userId,
      "product_shipped",
      "Your product has shipped",
      `Tracking number: ${trackingNumber}`,
      `/contracts/${contractId}`,
    );
  }

  revalidatePath(`/contracts/${contractId}`);
  return { success: true };
}

/**
 * Influencer confirms receipt of the product.
 * This unblocks milestone submissions.
 */
export async function confirmDelivery(contractId: string) {
  const influencerProfile = await getCurrentInfluencerProfile();

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return { error: "Contract not found" };
  if (contract.influencerProfileId !== influencerProfile.id)
    return { error: "Unauthorized" };
  if (contract.deliveryStatus === null)
    return { error: "This contract does not involve product delivery" };
  if (contract.deliveryStatus === "delivered")
    return { error: "Delivery already confirmed" };

  await db
    .update(contracts)
    .set({
      deliveryStatus: "delivered",
      deliveryConfirmedAt: new Date(),
    })
    .where(eq(contracts.id, contractId));

  // Notify the brand
  const [brand] = await db
    .select({ userId: brandProfiles.userId })
    .from(brandProfiles)
    .where(eq(brandProfiles.id, contract.brandProfileId))
    .limit(1);

  if (brand) {
    await createNotification(
      brand.userId,
      "product_delivered",
      "Product received",
      "The influencer has confirmed receipt of your product. Content creation period begins now.",
      `/contracts/${contractId}`,
    );
  }

  revalidatePath(`/contracts/${contractId}`);
  return { success: true };
}

/**
 * Raises a dispute on an active or escrow-funded contract.
 */
export async function disputeContract(contractId: string, reason: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) return { error: "Contract not found" };

  // Verify the user is a party to this contract
  let isBrand = false;
  let isInfluencer = false;

  if (user.role === "brand") {
    const [profile] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, user.id))
      .limit(1);
    if (profile?.id === contract.brandProfileId) isBrand = true;
  } else if (user.role === "influencer") {
    const [profile] = await db
      .select()
      .from(influencerProfiles)
      .where(eq(influencerProfiles.userId, user.id))
      .limit(1);
    if (profile?.id === contract.influencerProfileId) isInfluencer = true;
  }

  if (!isBrand && !isInfluencer) return { error: "Unauthorized" };

  if (contract.status !== "active" && contract.status !== "escrow_funded") {
    return { error: "Contract cannot be disputed in its current state" };
  }

  await db
    .update(contracts)
    .set({
      status: "disputed",
      cancellationReason: reason,
    })
    .where(eq(contracts.id, contractId));

  // If the BRAND raised the dispute and any milestones have already been paid
  // out, reverse those Stripe transfers so the funds come back to the platform
  // account. Creators disputing typically means they want something extra
  // resolved (e.g. unpaid final milestone), not to refund their earnings — so
  // we don't auto-reverse in that direction.
  const reversalResults = {
    reversed: 0 as number,
    failed: 0 as number,
  };

  if (isBrand) {
    const paidMilestones = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.contractId, contractId),
          isNotNull(milestones.stripeTransferId),
        ),
      );

    if (paidMilestones.length > 0) {
      const stripe = getStripe();

      for (const m of paidMilestones) {
        if (!m.stripeTransferId) continue;
        try {
          const reversal = await stripe.transfers.createReversal(
            m.stripeTransferId,
            {
              metadata: {
                milestoneId: m.id,
                contractId,
                disputeReason: reason.slice(0, 200),
              },
            },
            { idempotencyKey: `milestone_reversal_${m.id}` },
          );

          await db
            .update(milestones)
            .set({ status: "disputed" })
            .where(eq(milestones.id, m.id));

          await db.insert(payments).values({
            contractId,
            milestoneId: m.id,
            type: "refund",
            status: "succeeded",
            amount: m.amount,
            currency: "aud",
            stripeTransferId: reversal.id,
            description: `Reversal for disputed milestone: ${m.title}`,
            processedAt: new Date(),
          });

          reversalResults.reversed += 1;
        } catch (err) {
          console.error(
            `[dispute] failed to reverse milestone ${m.id}:`,
            err,
          );
          reversalResults.failed += 1;
        }
      }
    }
  }

  // Notify the other party
  const otherProfileId = isBrand
    ? contract.influencerProfileId
    : contract.brandProfileId;
  const otherTable = isBrand ? influencerProfiles : brandProfiles;

  const [otherProfile] = await db
    .select({ userId: otherTable.userId })
    .from(otherTable)
    .where(eq(otherTable.id, otherProfileId))
    .limit(1);

  if (otherProfile) {
    const reversalSuffix =
      reversalResults.reversed > 0
        ? ` ${reversalResults.reversed} milestone payment${reversalResults.reversed === 1 ? "" : "s"} ${reversalResults.reversed === 1 ? "has" : "have"} been reversed.`
        : "";
    await createNotification(
      otherProfile.userId,
      "contract_disputed",
      "Contract disputed",
      `A dispute has been raised. Reason: "${reason.slice(0, 100)}"${reversalSuffix}`,
      `/contracts/${contractId}`,
    );
  }

  revalidatePath(`/contracts/${contractId}`);
  return {
    success: true,
    reversed: reversalResults.reversed,
    failed: reversalResults.failed,
  };
}
