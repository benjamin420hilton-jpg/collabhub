import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { proposalTypeEnum, proposalStatusEnum } from "./enums";
import { campaigns } from "./campaigns";
import { influencerProfiles } from "./influencer-profiles";
import { contracts } from "./contracts";

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    influencerProfileId: uuid("influencer_profile_id")
      .notNull()
      .references(() => influencerProfiles.id, { onDelete: "cascade" }),
    type: proposalTypeEnum("type").notNull(),
    status: proposalStatusEnum("status").notNull().default("pending"),
    coverLetter: text("cover_letter"),
    proposedRate: integer("proposed_rate"),
    counterRate: integer("counter_rate"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("proposals_campaign_influencer_idx").on(
      table.campaignId,
      table.influencerProfileId,
    ),
    index("proposals_campaign_id_idx").on(table.campaignId),
    index("proposals_influencer_profile_id_idx").on(
      table.influencerProfileId,
    ),
    index("proposals_status_idx").on(table.status),
    index("proposals_type_idx").on(table.type),
  ],
);

export const proposalsRelations = relations(proposals, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [proposals.campaignId],
    references: [campaigns.id],
  }),
  influencerProfile: one(influencerProfiles, {
    fields: [proposals.influencerProfileId],
    references: [influencerProfiles.id],
  }),
  contract: one(contracts),
}));
