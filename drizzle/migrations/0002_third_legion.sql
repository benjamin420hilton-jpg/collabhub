CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'shipped', 'in_transit', 'delivered', 'returned');--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'paused';--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'pending_review';--> statement-breakpoint
ALTER TYPE "public"."campaign_type" ADD VALUE 'product_exchange';--> statement-breakpoint
ALTER TYPE "public"."campaign_type" ADD VALUE 'hybrid';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "is_flagged" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "flagged_reason" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "shipping_tracking_number" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "delivery_status" "delivery_status";--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "product_description" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "estimated_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "delivery_confirmed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "campaigns_expires_at_idx" ON "campaigns" USING btree ("expires_at");