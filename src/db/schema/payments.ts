import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentStatusEnum, paymentTypeEnum } from "./enums";
import { contracts } from "./contracts";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "restrict" }),
    milestoneId: uuid("milestone_id"),
    type: paymentTypeEnum("type").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amount: integer("amount").notNull(),
    platformFeeAmount: integer("platform_fee_amount").notNull().default(0),
    currency: text("currency").notNull().default("aud"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeTransferId: text("stripe_transfer_id"),
    stripeChargeId: text("stripe_charge_id"),
    stripeRefundId: text("stripe_refund_id"),
    description: text("description"),
    failureReason: text("failure_reason"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("payments_contract_id_idx").on(table.contractId),
    index("payments_milestone_id_idx").on(table.milestoneId),
    index("payments_type_idx").on(table.type),
    index("payments_status_idx").on(table.status),
    index("payments_stripe_payment_intent_id_idx").on(
      table.stripePaymentIntentId,
    ),
    index("payments_created_at_idx").on(table.createdAt),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
}));
