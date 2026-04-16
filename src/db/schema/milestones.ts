import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { milestoneStatusEnum } from "./enums";
import { contracts } from "./contracts";

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("pending"),
    amount: integer("amount").notNull(),
    submissionUrl: text("submission_url"),
    submissionNotes: text("submission_notes"),
    revisionNotes: text("revision_notes"),
    stripeTransferId: text("stripe_transfer_id"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("milestones_contract_id_idx").on(table.contractId),
    index("milestones_status_idx").on(table.status),
    index("milestones_contract_sort_idx").on(
      table.contractId,
      table.sortOrder,
    ),
    check("milestone_amount_positive", sql`${table.amount} > 0`),
  ],
);

export const milestonesRelations = relations(milestones, ({ one }) => ({
  contract: one(contracts, {
    fields: [milestones.contractId],
    references: [contracts.id],
  }),
}));
