import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { subscriptionTierEnum } from "./enums";
import { users } from "./users";
import { campaigns } from "./campaigns";
import { subscriptions } from "./subscriptions";

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    abn: text("abn"),
    website: text("website"),
    industry: text("industry"),
    companySize: text("company_size"),
    description: text("description"),
    logoUrl: text("logo_url"),
    verified: boolean("verified").notNull().default(false),
    stripeCustomerId: text("stripe_customer_id"),
    subscriptionTier: subscriptionTierEnum("subscription_tier")
      .notNull()
      .default("free"),
    city: text("city"),
    state: text("state"),
    country: text("country").notNull().default("AU"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("brand_profiles_user_id_idx").on(table.userId),
    index("brand_profiles_subscription_tier_idx").on(table.subscriptionTier),
    index("brand_profiles_stripe_customer_id_idx").on(table.stripeCustomerId),
  ],
);

export const brandProfilesRelations = relations(
  brandProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [brandProfiles.userId],
      references: [users.id],
    }),
    campaigns: many(campaigns),
    subscription: one(subscriptions),
  }),
);
