import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  campaignTypeEnum,
  campaignStatusEnum,
  socialPlatformEnum,
  nicheCategoryEnum,
} from "./enums";
import { brandProfiles } from "./brand-profiles";
import { campaignDeliverables } from "./campaign-deliverables";
import { proposals } from "./proposals";

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandProfileId: uuid("brand_profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: campaignTypeEnum("type").notNull().default("paid"),
    status: campaignStatusEnum("status").notNull().default("draft"),
    budgetMin: integer("budget_min"),
    budgetMax: integer("budget_max"),
    targetPlatform: socialPlatformEnum("target_platform").notNull(),
    targetNiche: nicheCategoryEnum("target_niche"),
    targetLocation: text("target_location"),
    minFollowerCount: integer("min_follower_count"),
    applicationDeadline: timestamp("application_deadline", {
      withTimezone: true,
    }),
    campaignStartDate: timestamp("campaign_start_date", {
      withTimezone: true,
    }),
    campaignEndDate: timestamp("campaign_end_date", { withTimezone: true }),
    isPublic: boolean("is_public").notNull().default(true),
    giftDescription: text("gift_description"),
    giftValue: integer("gift_value"),
    maxApplications: integer("max_applications"),
    applicationCount: integer("application_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isFlagged: boolean("is_flagged").notNull().default(false),
    flaggedReason: text("flagged_reason"),
  },
  (table) => [
    index("campaigns_brand_profile_id_idx").on(table.brandProfileId),
    index("campaigns_status_idx").on(table.status),
    index("campaigns_type_idx").on(table.type),
    index("campaigns_target_platform_idx").on(table.targetPlatform),
    index("campaigns_target_niche_idx").on(table.targetNiche),
    index("campaigns_is_public_status_idx").on(table.isPublic, table.status),
    index("campaigns_expires_at_idx").on(table.expiresAt),
    check(
      "budget_range_check",
      sql`${table.budgetMin} IS NULL OR ${table.budgetMax} IS NULL OR ${table.budgetMin} <= ${table.budgetMax}`,
    ),
  ],
);

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brandProfile: one(brandProfiles, {
    fields: [campaigns.brandProfileId],
    references: [brandProfiles.id],
  }),
  deliverables: many(campaignDeliverables),
  proposals: many(proposals),
}));
