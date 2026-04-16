import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialPlatformEnum } from "./enums";
import { influencerProfiles } from "./influencer-profiles";

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    influencerProfileId: uuid("influencer_profile_id")
      .notNull()
      .references(() => influencerProfiles.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    handle: text("handle").notNull(),
    profileUrl: text("profile_url"),
    followerCount: integer("follower_count"),
    engagementRate: text("engagement_rate"),
    verified: boolean("verified").notNull().default(false),
    metricsLastSyncedAt: timestamp("metrics_last_synced_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("social_accounts_profile_platform_idx").on(
      table.influencerProfileId,
      table.platform,
    ),
    index("social_accounts_influencer_profile_id_idx").on(
      table.influencerProfileId,
    ),
  ],
);

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  influencerProfile: one(influencerProfiles, {
    fields: [socialAccounts.influencerProfileId],
    references: [influencerProfiles.id],
  }),
}));
