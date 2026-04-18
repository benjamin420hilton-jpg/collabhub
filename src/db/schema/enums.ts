import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["brand", "influencer"]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "trialing",
]);

export const campaignTypeEnum = pgEnum("campaign_type", [
  "paid",
  "gifting",
  "product_exchange",
  "hybrid",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "published",
  "in_progress",
  "completed",
  "canceled",
  "paused",
  "archived",
  "pending_review",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "linkedin",
  "facebook",
  "pinterest",
  "snapchat",
  "threads",
]);

export const nicheCategoryEnum = pgEnum("niche_category", [
  "fashion",
  "beauty",
  "fitness",
  "food",
  "travel",
  "tech",
  "gaming",
  "lifestyle",
  "parenting",
  "finance",
  "education",
  "entertainment",
  "health",
  "sports",
  "automotive",
  "pets",
  "home_decor",
  "sustainability",
  "other",
]);

export const proposalTypeEnum = pgEnum("proposal_type", [
  "inbound",
  "outbound",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "pending_escrow",
  "escrow_funded",
  "active",
  "completed",
  "disputed",
  "canceled",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "paid",
  "disputed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "escrow_hold",
  "milestone_release",
  "platform_fee",
  "refund",
  "subscription",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "shipped",
  "in_transit",
  "delivered",
  "returned",
]);

export const deliverableTypeEnum = pgEnum("deliverable_type", [
  "instagram_post",
  "instagram_reel",
  "instagram_story",
  "tiktok_video",
  "youtube_video",
  "youtube_short",
  "twitter_post",
  "blog_post",
  "ugc_content",
  "product_review",
  "other",
]);
