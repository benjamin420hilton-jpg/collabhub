import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
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
} from "@/db/schema";

// Select types (reading from DB)
export type User = InferSelectModel<typeof users>;
export type BrandProfile = InferSelectModel<typeof brandProfiles>;
export type InfluencerProfile = InferSelectModel<typeof influencerProfiles>;
export type SocialAccount = InferSelectModel<typeof socialAccounts>;
export type Campaign = InferSelectModel<typeof campaigns>;
export type CampaignDeliverable = InferSelectModel<typeof campaignDeliverables>;
export type Proposal = InferSelectModel<typeof proposals>;
export type Contract = InferSelectModel<typeof contracts>;
export type Milestone = InferSelectModel<typeof milestones>;
export type Payment = InferSelectModel<typeof payments>;
export type Subscription = InferSelectModel<typeof subscriptions>;

// Insert types (writing to DB)
export type NewUser = InferInsertModel<typeof users>;
export type NewBrandProfile = InferInsertModel<typeof brandProfiles>;
export type NewInfluencerProfile = InferInsertModel<typeof influencerProfiles>;
export type NewSocialAccount = InferInsertModel<typeof socialAccounts>;
export type NewCampaign = InferInsertModel<typeof campaigns>;
export type NewCampaignDeliverable = InferInsertModel<
  typeof campaignDeliverables
>;
export type NewProposal = InferInsertModel<typeof proposals>;
export type NewContract = InferInsertModel<typeof contracts>;
export type NewMilestone = InferInsertModel<typeof milestones>;
export type NewPayment = InferInsertModel<typeof payments>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
