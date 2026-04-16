import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { subscriptionTierEnum, subscriptionStatusEnum } from "./enums";
import { brandProfiles } from "./brand-profiles";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandProfileId: uuid("brand_profile_id")
      .notNull()
      .unique()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    tier: subscriptionTierEnum("tier").notNull().default("free"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    stripeCurrentPeriodStart: timestamp("stripe_current_period_start", {
      withTimezone: true,
    }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", {
      withTimezone: true,
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    trialStart: timestamp("trial_start", { withTimezone: true }),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("subscriptions_brand_profile_id_idx").on(table.brandProfileId),
    index("subscriptions_stripe_subscription_id_idx").on(
      table.stripeSubscriptionId,
    ),
    index("subscriptions_status_idx").on(table.status),
  ],
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  brandProfile: one(brandProfiles, {
    fields: [subscriptions.brandProfileId],
    references: [brandProfiles.id],
  }),
}));
