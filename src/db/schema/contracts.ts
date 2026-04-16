import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contractStatusEnum } from "./enums";
import { proposals } from "./proposals";
import { milestones } from "./milestones";
import { payments } from "./payments";

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proposalId: uuid("proposal_id")
      .notNull()
      .unique()
      .references(() => proposals.id, { onDelete: "restrict" }),
    brandProfileId: uuid("brand_profile_id").notNull(),
    influencerProfileId: uuid("influencer_profile_id").notNull(),
    status: contractStatusEnum("status").notNull().default("pending_escrow"),
    totalAmount: integer("total_amount").notNull(),
    platformFeeRate: integer("platform_fee_rate").notNull(),
    platformFeeAmount: integer("platform_fee_amount").notNull(),
    influencerPayout: integer("influencer_payout").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeTransferGroup: text("stripe_transfer_group"),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("contracts_proposal_id_idx").on(table.proposalId),
    index("contracts_brand_profile_id_idx").on(table.brandProfileId),
    index("contracts_influencer_profile_id_idx").on(
      table.influencerProfileId,
    ),
    index("contracts_status_idx").on(table.status),
    index("contracts_stripe_payment_intent_id_idx").on(
      table.stripePaymentIntentId,
    ),
  ],
);

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
  milestones: many(milestones),
  payments: many(payments),
}));
