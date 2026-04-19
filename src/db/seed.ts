import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { like, inArray, or } from "drizzle-orm";
import * as schema from "./schema";
import {
  users,
  brandProfiles,
  influencerProfiles,
  socialAccounts,
  campaigns,
  campaignDeliverables,
  proposals,
  contracts,
  milestones,
  payments,
  subscriptions,
  conversations,
  messages,
  notifications,
} from "./schema";
import {
  dollarsToCents,
  PLATFORM_FEE_RATES,
  calculatePlatformFee,
} from "../lib/constants";

const SEED_PREFIX = "seed_";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function wipe() {
  console.log("Wiping existing seed data...");

  const seedUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.clerkUserId, `${SEED_PREFIX}%`));

  if (seedUsers.length === 0) {
    console.log("  no prior seed users found");
    return;
  }

  const seedUserIds = seedUsers.map((u) => u.id);

  const seedBrands = await db
    .select({ id: brandProfiles.id })
    .from(brandProfiles)
    .where(inArray(brandProfiles.userId, seedUserIds));
  const brandIds = seedBrands.map((b) => b.id);

  const seedInfluencers = await db
    .select({ id: influencerProfiles.id })
    .from(influencerProfiles)
    .where(inArray(influencerProfiles.userId, seedUserIds));
  const influencerIds = seedInfluencers.map((i) => i.id);

  if (brandIds.length > 0 || influencerIds.length > 0) {
    const affectedProfileContracts = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(
        or(
          brandIds.length > 0
            ? inArray(contracts.brandProfileId, brandIds)
            : undefined,
          influencerIds.length > 0
            ? inArray(contracts.influencerProfileId, influencerIds)
            : undefined,
        ),
      );

    const contractIds = affectedProfileContracts.map((c) => c.id);
    if (contractIds.length > 0) {
      await db
        .delete(payments)
        .where(inArray(payments.contractId, contractIds));
      await db.delete(contracts).where(inArray(contracts.id, contractIds));
    }
  }

  await db.delete(users).where(inArray(users.id, seedUserIds));
  console.log(`  removed ${seedUserIds.length} seed users (cascade)`);
}

async function seed() {
  await wipe();

  console.log("Seeding users & profiles...");

  const [brandLuna] = await db
    .insert(users)
    .values({
      clerkUserId: `${SEED_PREFIX}brand_luna`,
      email: "hello@lunabeauty.au",
      firstName: "Sarah",
      lastName: "Chen",
      role: "brand",
      onboardingCompleted: true,
    })
    .returning();

  const [brandOrbit] = await db
    .insert(users)
    .values({
      clerkUserId: `${SEED_PREFIX}brand_orbit`,
      email: "team@orbitapparel.com",
      firstName: "Marcus",
      lastName: "Wright",
      role: "brand",
      onboardingCompleted: true,
    })
    .returning();

  const [lunaProfile] = await db
    .insert(brandProfiles)
    .values({
      userId: brandLuna.id,
      companyName: "Luna Beauty Co.",
      website: "https://lunabeauty.au",
      industry: "Beauty & Cosmetics",
      companySize: "11-50",
      description:
        "Clean-formulation skincare made in Melbourne. We partner with creators who share our sustainability values.",
      city: "Melbourne",
      state: "VIC",
      country: "AU",
      subscriptionTier: "pro",
      verified: true,
    })
    .returning();

  const [orbitProfile] = await db
    .insert(brandProfiles)
    .values({
      userId: brandOrbit.id,
      companyName: "Orbit Apparel",
      website: "https://orbitapparel.com",
      industry: "Fashion",
      companySize: "2-10",
      description:
        "Streetwear for the post-internet generation. Limited drops, big personality.",
      city: "Sydney",
      state: "NSW",
      country: "AU",
      subscriptionTier: "free",
    })
    .returning();

  await db.insert(subscriptions).values({
    brandProfileId: lunaProfile.id,
    tier: "pro",
    status: "active",
    stripeCurrentPeriodStart: daysAgo(12),
    stripeCurrentPeriodEnd: daysFromNow(18),
  });

  const influencerSpecs = [
    {
      clerk: `${SEED_PREFIX}inf_ava`,
      email: "ava@creators.test",
      firstName: "Ava",
      lastName: "Nguyen",
      displayName: "Ava Nguyen",
      bio: "Beauty & skincare reviews. Honest takes only. Melbourne-based.",
      primaryNiche: "beauty" as const,
      secondaryNiches: ["lifestyle", "fashion"],
      city: "Melbourne",
      state: "VIC",
      totalFollowers: 142_000,
      totalEngagementRate: "4.8",
      minimumRate: dollarsToCents(800),
      onboarded: true,
      tier: "pro" as const,
      featured: true,
      socials: [
        { platform: "instagram" as const, handle: "avanguyen", followers: 98_000 },
        { platform: "tiktok" as const, handle: "avanguyen", followers: 44_000 },
      ],
    },
    {
      clerk: `${SEED_PREFIX}inf_jay`,
      email: "jay@creators.test",
      firstName: "Jay",
      lastName: "Okafor",
      displayName: "Jay Okafor",
      bio: "Streetwear, sneakers, and vibes. Sydney.",
      primaryNiche: "fashion" as const,
      secondaryNiches: ["lifestyle"],
      city: "Sydney",
      state: "NSW",
      totalFollowers: 58_000,
      totalEngagementRate: "6.2",
      minimumRate: dollarsToCents(450),
      onboarded: true,
      tier: "pro" as const,
      featured: false,
      socials: [
        { platform: "instagram" as const, handle: "jayokafor", followers: 38_000 },
        { platform: "tiktok" as const, handle: "jay.okafor", followers: 20_000 },
      ],
    },
    {
      clerk: `${SEED_PREFIX}inf_mira`,
      email: "mira@creators.test",
      firstName: "Mira",
      lastName: "Patel",
      displayName: "Mira Patel",
      bio: "Fitness coach & wellness advocate. Brisbane.",
      primaryNiche: "fitness" as const,
      secondaryNiches: ["health", "food"],
      city: "Brisbane",
      state: "QLD",
      totalFollowers: 210_000,
      totalEngagementRate: "3.9",
      minimumRate: dollarsToCents(1200),
      onboarded: false,
      tier: "free" as const,
      featured: false,
      socials: [
        { platform: "instagram" as const, handle: "mirapatelfit", followers: 160_000 },
        { platform: "youtube" as const, handle: "mirapatel", followers: 50_000 },
      ],
    },
    {
      clerk: `${SEED_PREFIX}inf_ben`,
      email: "ben@creators.test",
      firstName: "Ben",
      lastName: "Harrow",
      displayName: "Ben Harrow",
      bio: "Tech reviews, productivity, and indie software. Perth.",
      primaryNiche: "tech" as const,
      secondaryNiches: ["education"],
      city: "Perth",
      state: "WA",
      totalFollowers: 32_500,
      totalEngagementRate: "5.4",
      minimumRate: dollarsToCents(350),
      onboarded: true,
      tier: "free" as const,
      featured: false,
      socials: [
        { platform: "youtube" as const, handle: "benharrow", followers: 28_000 },
        { platform: "twitter" as const, handle: "benharrow", followers: 4_500 },
      ],
    },
  ];

  const influencers: {
    user: typeof users.$inferSelect;
    profile: typeof influencerProfiles.$inferSelect;
  }[] = [];

  for (const s of influencerSpecs) {
    const [user] = await db
      .insert(users)
      .values({
        clerkUserId: s.clerk,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        role: "influencer",
        onboardingCompleted: true,
      })
      .returning();

    const [profile] = await db
      .insert(influencerProfiles)
      .values({
        userId: user.id,
        displayName: s.displayName,
        bio: s.bio,
        primaryNiche: s.primaryNiche,
        secondaryNiches: s.secondaryNiches,
        city: s.city,
        state: s.state,
        country: "AU",
        totalFollowers: s.totalFollowers,
        totalEngagementRate: s.totalEngagementRate,
        minimumRate: s.minimumRate,
        stripeConnectOnboarded: s.onboarded,
        subscriptionTier: s.tier,
        isFeatured: s.featured,
        isPublic: true,
      })
      .returning();

    for (const soc of s.socials) {
      await db.insert(socialAccounts).values({
        influencerProfileId: profile.id,
        platform: soc.platform,
        handle: soc.handle,
        profileUrl: `https://${soc.platform}.com/${soc.handle}`,
        followerCount: soc.followers,
        engagementRate: s.totalEngagementRate,
        verified: true,
      });
    }

    influencers.push({ user, profile });
  }

  console.log(`  ${influencers.length} influencers, 2 brands`);

  console.log("Seeding campaigns & deliverables...");

  const [lunaPublished] = await db
    .insert(campaigns)
    .values({
      brandProfileId: lunaProfile.id,
      title: "Spring skincare launch — IG Reels",
      description:
        "Launching our new hydrating serum. Looking for beauty creators to produce 1 Reel + 3 Stories showcasing morning routines.",
      type: "paid",
      status: "published",
      budgetMin: dollarsToCents(600),
      budgetMax: dollarsToCents(1500),
      targetPlatform: "instagram",
      targetNiche: "beauty",
      targetLocation: "AU",
      minFollowerCount: 25_000,
      applicationDeadline: daysFromNow(14),
      campaignStartDate: daysFromNow(7),
      campaignEndDate: daysFromNow(45),
      maxApplications: 20,
      applicationCount: 1,
      publishedAt: daysAgo(3),
      isPublic: true,
    })
    .returning();

  await db.insert(campaignDeliverables).values([
    {
      campaignId: lunaPublished.id,
      type: "instagram_reel",
      description: "Morning routine Reel, 30–60s",
      quantity: 1,
    },
    {
      campaignId: lunaPublished.id,
      type: "instagram_story",
      description: "Story set showing application",
      quantity: 3,
    },
  ]);

  const [lunaInProgress] = await db
    .insert(campaigns)
    .values({
      brandProfileId: lunaProfile.id,
      title: "Barrier repair cream — UGC package",
      description:
        "Short-form UGC for our barrier repair cream. Deliverables will be used across paid ads.",
      type: "paid",
      status: "in_progress",
      budgetMin: dollarsToCents(1200),
      budgetMax: dollarsToCents(1800),
      targetPlatform: "tiktok",
      targetNiche: "beauty",
      targetLocation: "AU",
      minFollowerCount: 50_000,
      applicationDeadline: daysAgo(10),
      campaignStartDate: daysAgo(5),
      campaignEndDate: daysFromNow(25),
      applicationCount: 1,
      publishedAt: daysAgo(20),
      isPublic: true,
    })
    .returning();

  await db.insert(campaignDeliverables).values({
    campaignId: lunaInProgress.id,
    type: "ugc_content",
    description: "3 x 15-second vertical clips, raw, unedited",
    quantity: 3,
  });

  const [lunaCompleted] = await db
    .insert(campaigns)
    .values({
      brandProfileId: lunaProfile.id,
      title: "Cleanser relaunch — YouTube integration",
      description: "Integrated placement in a monthly favourites video.",
      type: "paid",
      status: "completed",
      budgetMin: dollarsToCents(800),
      budgetMax: dollarsToCents(1200),
      targetPlatform: "youtube",
      targetNiche: "beauty",
      targetLocation: "AU",
      applicationCount: 1,
      publishedAt: daysAgo(60),
      isPublic: true,
    })
    .returning();

  const [orbitPublished] = await db
    .insert(campaigns)
    .values({
      brandProfileId: orbitProfile.id,
      title: "Autumn drop — streetwear try-on",
      description:
        "Looking for fashion creators to feature our autumn drop in a styled try-on Reel.",
      type: "paid",
      status: "published",
      budgetMin: dollarsToCents(400),
      budgetMax: dollarsToCents(900),
      targetPlatform: "instagram",
      targetNiche: "fashion",
      targetLocation: "AU",
      minFollowerCount: 20_000,
      applicationDeadline: daysFromNow(10),
      applicationCount: 1,
      publishedAt: daysAgo(1),
      isPublic: true,
    })
    .returning();

  await db.insert(campaignDeliverables).values({
    campaignId: orbitPublished.id,
    type: "instagram_reel",
    description: "Styled try-on Reel featuring 3 pieces",
    quantity: 1,
  });

  await db.insert(campaigns).values({
    brandProfileId: orbitProfile.id,
    title: "Summer collection teaser (draft)",
    description: "Early draft — still defining deliverables.",
    type: "paid",
    status: "draft",
    targetPlatform: "tiktok",
    targetNiche: "fashion",
    targetLocation: "AU",
    isPublic: false,
  });

  console.log("Seeding proposals, contracts, milestones, payments...");

  const [ava, jay, mira] = influencers;

  // 1. Ava → Luna (in_progress) — contract active with one paid milestone + one submitted
  const [avaToLuna] = await db
    .insert(proposals)
    .values({
      campaignId: lunaInProgress.id,
      influencerProfileId: ava.profile.id,
      type: "inbound",
      status: "accepted",
      coverLetter:
        "Long-time fan of the brand. I'd love to produce the UGC package — quick turnaround and on-brand aesthetic.",
      proposedRate: dollarsToCents(1500),
    })
    .returning();

  const activeTotal = dollarsToCents(1500);
  const activeFeeRate = PLATFORM_FEE_RATES.pro;
  const activeFee = calculatePlatformFee(activeTotal, activeFeeRate);
  const activePayout = activeTotal - activeFee;

  const [activeContract] = await db
    .insert(contracts)
    .values({
      proposalId: avaToLuna.id,
      brandProfileId: lunaProfile.id,
      influencerProfileId: ava.profile.id,
      status: "active",
      totalAmount: activeTotal,
      platformFeeRate: activeFeeRate,
      platformFeeAmount: activeFee,
      influencerPayout: activePayout,
      stripePaymentIntentId: "pi_seed_luna_ava",
      stripeTransferGroup: "seed_luna_ava",
      termsAcceptedAt: daysAgo(5),
      startDate: daysAgo(4),
    })
    .returning();

  const milestoneAmount = dollarsToCents(500);
  const [m1] = await db
    .insert(milestones)
    .values({
      contractId: activeContract.id,
      sortOrder: 1,
      title: "Clip 1 — morning routine",
      description: "15-second vertical clip, applying serum during AM routine.",
      status: "paid",
      amount: milestoneAmount,
      submissionUrl: "https://drive.example.com/ava-clip1.mp4",
      submittedAt: daysAgo(3),
      approvedAt: daysAgo(2),
      paidAt: daysAgo(2),
      stripeTransferId: "tr_seed_1",
    })
    .returning();

  await db.insert(milestones).values([
    {
      contractId: activeContract.id,
      sortOrder: 2,
      title: "Clip 2 — evening routine",
      description: "15-second vertical clip, PM routine.",
      status: "submitted",
      amount: milestoneAmount,
      submissionUrl: "https://drive.example.com/ava-clip2.mp4",
      submittedAt: daysAgo(1),
    },
    {
      contractId: activeContract.id,
      sortOrder: 3,
      title: "Clip 3 — results",
      description: "15-second clip showing 2-week results.",
      status: "pending",
      amount: milestoneAmount,
      dueDate: daysFromNow(10),
    },
  ]);

  // escrow hold
  await db.insert(payments).values({
    contractId: activeContract.id,
    type: "escrow_hold",
    status: "succeeded",
    amount: activeTotal,
    platformFeeAmount: activeFee,
    stripePaymentIntentId: "pi_seed_luna_ava",
    description: "Escrow hold for contract",
    processedAt: daysAgo(4),
  });

  // paid milestone release
  const m1Fee = calculatePlatformFee(milestoneAmount, activeFeeRate);
  await db.insert(payments).values({
    contractId: activeContract.id,
    milestoneId: m1.id,
    type: "milestone_release",
    status: "succeeded",
    amount: milestoneAmount - m1Fee,
    platformFeeAmount: m1Fee,
    stripeTransferId: "tr_seed_1",
    description: `Payout for milestone: ${m1.title}`,
    processedAt: daysAgo(2),
  });
  await db.insert(payments).values({
    contractId: activeContract.id,
    milestoneId: m1.id,
    type: "platform_fee",
    status: "succeeded",
    amount: m1Fee,
    description: `5% Payment Protection Fee on "${m1.title}"`,
    processedAt: daysAgo(2),
  });

  // 2. Jay → Orbit (pending application on published campaign)
  await db.insert(proposals).values({
    campaignId: orbitPublished.id,
    influencerProfileId: jay.profile.id,
    type: "inbound",
    status: "pending",
    coverLetter:
      "Been wearing Orbit since the first drop. Happy to shoot a styled try-on Reel this week.",
    proposedRate: dollarsToCents(700),
  });

  // 3. Mira → Luna (shortlisted on published campaign)
  await db.insert(proposals).values({
    campaignId: lunaPublished.id,
    influencerProfileId: mira.profile.id,
    type: "inbound",
    status: "shortlisted",
    coverLetter:
      "I'd position the serum as part of a pre-workout skincare reset — love this angle for my audience.",
    proposedRate: dollarsToCents(1400),
  });

  // 4. Ava → Luna completed YouTube campaign (completed contract in history)
  const [avaCompletedProposal] = await db
    .insert(proposals)
    .values({
      campaignId: lunaCompleted.id,
      influencerProfileId: ava.profile.id,
      type: "inbound",
      status: "accepted",
      proposedRate: dollarsToCents(1000),
    })
    .returning();

  const completedTotal = dollarsToCents(1000);
  const completedFee = calculatePlatformFee(completedTotal, activeFeeRate);
  const completedPayout = completedTotal - completedFee;

  const [completedContract] = await db
    .insert(contracts)
    .values({
      proposalId: avaCompletedProposal.id,
      brandProfileId: lunaProfile.id,
      influencerProfileId: ava.profile.id,
      status: "completed",
      totalAmount: completedTotal,
      platformFeeRate: activeFeeRate,
      platformFeeAmount: completedFee,
      influencerPayout: completedPayout,
      stripePaymentIntentId: "pi_seed_completed",
      stripeTransferGroup: "seed_completed",
      termsAcceptedAt: daysAgo(55),
      startDate: daysAgo(55),
      completedAt: daysAgo(30),
    })
    .returning();

  const [completedMilestone] = await db
    .insert(milestones)
    .values({
      contractId: completedContract.id,
      sortOrder: 1,
      title: "YouTube integration",
      status: "paid",
      amount: completedTotal,
      submittedAt: daysAgo(40),
      approvedAt: daysAgo(32),
      paidAt: daysAgo(30),
      stripeTransferId: "tr_seed_completed",
    })
    .returning();

  await db.insert(payments).values({
    contractId: completedContract.id,
    type: "escrow_hold",
    status: "succeeded",
    amount: completedTotal,
    platformFeeAmount: completedFee,
    stripePaymentIntentId: "pi_seed_completed",
    description: "Escrow hold for contract",
    processedAt: daysAgo(55),
  });
  await db.insert(payments).values({
    contractId: completedContract.id,
    milestoneId: completedMilestone.id,
    type: "milestone_release",
    status: "succeeded",
    amount: completedPayout,
    platformFeeAmount: completedFee,
    stripeTransferId: "tr_seed_completed",
    description: `Payout for milestone: ${completedMilestone.title}`,
    processedAt: daysAgo(30),
  });
  await db.insert(payments).values({
    contractId: completedContract.id,
    milestoneId: completedMilestone.id,
    type: "platform_fee",
    status: "succeeded",
    amount: completedFee,
    description: `5% Payment Protection Fee on "${completedMilestone.title}"`,
    processedAt: daysAgo(30),
  });

  // 5. Rejected proposal example
  await db.insert(proposals).values({
    campaignId: orbitPublished.id,
    influencerProfileId: mira.profile.id,
    type: "inbound",
    status: "rejected",
    coverLetter: "Happy to collab on the autumn drop.",
    proposedRate: dollarsToCents(1100),
    rejectionReason: "Outside our budget range for this campaign.",
  });

  console.log("Seeding conversations, messages, notifications...");

  const [convo] = await db
    .insert(conversations)
    .values({
      participantOneId: brandLuna.id,
      participantTwoId: ava.user.id,
      lastMessageAt: hoursAgo(3),
    })
    .returning();

  await db.insert(messages).values([
    {
      conversationId: convo.id,
      senderId: brandLuna.id,
      content:
        "Hey Ava — loved clip 1, the lighting is perfect. Any chance clip 2 can land by Friday?",
      read: true,
      createdAt: daysAgo(1),
    },
    {
      conversationId: convo.id,
      senderId: ava.user.id,
      content: "Just submitted it! Let me know what you think.",
      read: true,
      createdAt: hoursAgo(6),
    },
    {
      conversationId: convo.id,
      senderId: brandLuna.id,
      content: "Reviewing now — thanks for the quick turnaround.",
      read: false,
      createdAt: hoursAgo(3),
    },
  ]);

  await db.insert(notifications).values([
    {
      userId: brandLuna.id,
      type: "milestone_submitted",
      title: "New milestone submitted",
      message: 'Ava Nguyen submitted "Clip 2 — evening routine" for review.',
      link: `/contracts/${activeContract.id}`,
      read: false,
      createdAt: hoursAgo(6),
    },
    {
      userId: brandLuna.id,
      type: "proposal_received",
      title: "New proposal",
      message: "Mira Patel applied to your Spring skincare campaign.",
      link: `/campaigns/${lunaPublished.id}`,
      read: false,
      createdAt: daysAgo(2),
    },
    {
      userId: ava.user.id,
      type: "milestone_paid",
      title: "Payment received",
      message: 'You\'ve been paid for "Clip 1 — morning routine".',
      link: `/contracts/${activeContract.id}`,
      read: true,
      createdAt: daysAgo(2),
    },
    {
      userId: jay.user.id,
      type: "proposal_submitted",
      title: "Proposal submitted",
      message: "Your proposal for Orbit's autumn drop is pending review.",
      link: `/campaigns/${orbitPublished.id}`,
      read: false,
      createdAt: hoursAgo(18),
    },
  ]);

  console.log("\nSeed complete.");
  console.log("  2 brands, 4 influencers");
  console.log("  5 campaigns (1 draft, 2 published, 1 in_progress, 1 completed)");
  console.log("  5 proposals, 2 contracts, 4 milestones, 7 payments");
  console.log("  1 conversation (3 messages), 4 notifications\n");
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
