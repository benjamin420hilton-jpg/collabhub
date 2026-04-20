import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { nicheCategoryEnum, subscriptionTierEnum } from "./enums";
import { users } from "./users";
import { socialAccounts } from "./social-accounts";
import { proposals } from "./proposals";

export const influencerProfiles = pgTable(
  "influencer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    primaryNiche: nicheCategoryEnum("primary_niche"),
    secondaryNiches: jsonb("secondary_niches").$type<string[]>().default([]),
    city: text("city"),
    state: text("state"),
    country: text("country").notNull().default("AU"),
    totalFollowers: integer("total_followers").default(0),
    totalEngagementRate: text("total_engagement_rate"),
    acceptsDirectOffers: boolean("accepts_direct_offers")
      .notNull()
      .default(true),
    minimumRate: integer("minimum_rate"),
    stripeConnectAccountId: text("stripe_connect_account_id"),
    stripeConnectOnboarded: boolean("stripe_connect_onboarded")
      .notNull()
      .default(false),
    stripeChargesEnabled: boolean("stripe_charges_enabled")
      .notNull()
      .default(false),
    stripePayoutsEnabled: boolean("stripe_payouts_enabled")
      .notNull()
      .default(false),
    stripeRequirementsDisabledReason: text(
      "stripe_requirements_disabled_reason",
    ),
    stripeRequirementsCurrentlyDue: jsonb("stripe_requirements_currently_due")
      .$type<string[]>()
      .default([]),
    stripeConnectStatusUpdatedAt: timestamp("stripe_connect_status_updated_at", {
      withTimezone: true,
    }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", {
      withTimezone: true,
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    subscriptionTier: subscriptionTierEnum("subscription_tier")
      .notNull()
      .default("free"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("influencer_profiles_user_id_idx").on(table.userId),
    index("influencer_profiles_primary_niche_idx").on(table.primaryNiche),
    index("influencer_profiles_country_state_idx").on(
      table.country,
      table.state,
    ),
    index("influencer_profiles_total_followers_idx").on(table.totalFollowers),
    index("influencer_profiles_is_public_idx").on(table.isPublic),
    index("influencer_profiles_directory_rank_idx").on(
      table.isFeatured,
      table.subscriptionTier,
      table.totalFollowers,
    ),
  ],
);

export const influencerProfilesRelations = relations(
  influencerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [influencerProfiles.userId],
      references: [users.id],
    }),
    socialAccounts: many(socialAccounts),
    proposals: many(proposals),
  }),
);
