import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { deliverableTypeEnum } from "./enums";
import { campaigns } from "./campaigns";

export const campaignDeliverables = pgTable(
  "campaign_deliverables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    type: deliverableTypeEnum("type").notNull(),
    description: text("description"),
    quantity: integer("quantity").notNull().default(1),
    requirements: text("requirements"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campaign_deliverables_campaign_id_idx").on(table.campaignId),
  ],
);

export const campaignDeliverablesRelations = relations(
  campaignDeliverables,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignDeliverables.campaignId],
      references: [campaigns.id],
    }),
  }),
);
