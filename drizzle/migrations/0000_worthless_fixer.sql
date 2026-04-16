CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'published', 'in_progress', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('paid', 'gifting');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('pending_escrow', 'escrow_funded', 'active', 'completed', 'disputed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."deliverable_type" AS ENUM('instagram_post', 'instagram_reel', 'instagram_story', 'tiktok_video', 'youtube_video', 'youtube_short', 'twitter_post', 'blog_post', 'ugc_content', 'product_review', 'other');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'paid', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."niche_category" AS ENUM('fashion', 'beauty', 'fitness', 'food', 'travel', 'tech', 'gaming', 'lifestyle', 'parenting', 'finance', 'education', 'entertainment', 'health', 'sports', 'automotive', 'pets', 'home_decor', 'sustainability', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('escrow_hold', 'milestone_release', 'platform_fee', 'refund', 'subscription');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'expired');--> statement-breakpoint
CREATE TYPE "public"."proposal_type" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'facebook', 'pinterest', 'snapchat', 'threads');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'unpaid', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('brand', 'influencer');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"role" "user_role",
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"abn" text,
	"website" text,
	"industry" text,
	"company_size" text,
	"description" text,
	"logo_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"city" text,
	"state" text,
	"country" text DEFAULT 'AU' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "influencer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"primary_niche" "niche_category",
	"secondary_niches" jsonb DEFAULT '[]'::jsonb,
	"city" text,
	"state" text,
	"country" text DEFAULT 'AU' NOT NULL,
	"total_followers" integer DEFAULT 0,
	"total_engagement_rate" text,
	"accepts_direct_offers" boolean DEFAULT true NOT NULL,
	"minimum_rate" integer,
	"stripe_connect_account_id" text,
	"stripe_connect_onboarded" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "influencer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_profile_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"handle" text NOT NULL,
	"profile_url" text,
	"follower_count" integer,
	"engagement_rate" text,
	"verified" boolean DEFAULT false NOT NULL,
	"metrics_last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "campaign_type" DEFAULT 'paid' NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"target_platform" "social_platform" NOT NULL,
	"target_niche" "niche_category",
	"target_location" text,
	"min_follower_count" integer,
	"application_deadline" timestamp with time zone,
	"campaign_start_date" timestamp with time zone,
	"campaign_end_date" timestamp with time zone,
	"is_public" boolean DEFAULT true NOT NULL,
	"gift_description" text,
	"gift_value" integer,
	"max_applications" integer,
	"application_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "budget_range_check" CHECK ("campaigns"."budget_min" IS NULL OR "campaigns"."budget_max" IS NULL OR "campaigns"."budget_min" <= "campaigns"."budget_max")
);
--> statement-breakpoint
CREATE TABLE "campaign_deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"type" "deliverable_type" NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"requirements" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"influencer_profile_id" uuid NOT NULL,
	"type" "proposal_type" NOT NULL,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"cover_letter" text,
	"proposed_rate" integer,
	"counter_rate" integer,
	"expires_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"brand_profile_id" uuid NOT NULL,
	"influencer_profile_id" uuid NOT NULL,
	"status" "contract_status" DEFAULT 'pending_escrow' NOT NULL,
	"total_amount" integer NOT NULL,
	"platform_fee_rate" integer NOT NULL,
	"platform_fee_amount" integer NOT NULL,
	"influencer_payout" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_transfer_group" text,
	"terms_accepted_at" timestamp with time zone,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_proposal_id_unique" UNIQUE("proposal_id")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"submission_url" text,
	"submission_notes" text,
	"revision_notes" text,
	"stripe_transfer_id" text,
	"due_date" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestone_amount_positive" CHECK ("milestones"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"milestone_id" uuid,
	"type" "payment_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"platform_fee_amount" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'aud' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_transfer_id" text,
	"stripe_charge_id" text,
	"stripe_refund_id" text,
	"description" text,
	"failure_reason" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_profile_id" uuid NOT NULL,
	"tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"stripe_current_period_start" timestamp with time zone,
	"stripe_current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_brand_profile_id_unique" UNIQUE("brand_profile_id")
);
--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_influencer_profile_id_influencer_profiles_id_fk" FOREIGN KEY ("influencer_profile_id") REFERENCES "public"."influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_deliverables" ADD CONSTRAINT "campaign_deliverables_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_influencer_profile_id_influencer_profiles_id_fk" FOREIGN KEY ("influencer_profile_id") REFERENCES "public"."influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "brand_profiles_user_id_idx" ON "brand_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "brand_profiles_subscription_tier_idx" ON "brand_profiles" USING btree ("subscription_tier");--> statement-breakpoint
CREATE INDEX "brand_profiles_stripe_customer_id_idx" ON "brand_profiles" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "influencer_profiles_user_id_idx" ON "influencer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "influencer_profiles_primary_niche_idx" ON "influencer_profiles" USING btree ("primary_niche");--> statement-breakpoint
CREATE INDEX "influencer_profiles_country_state_idx" ON "influencer_profiles" USING btree ("country","state");--> statement-breakpoint
CREATE INDEX "influencer_profiles_total_followers_idx" ON "influencer_profiles" USING btree ("total_followers");--> statement-breakpoint
CREATE INDEX "influencer_profiles_is_public_idx" ON "influencer_profiles" USING btree ("is_public");--> statement-breakpoint
CREATE UNIQUE INDEX "social_accounts_profile_platform_idx" ON "social_accounts" USING btree ("influencer_profile_id","platform");--> statement-breakpoint
CREATE INDEX "social_accounts_influencer_profile_id_idx" ON "social_accounts" USING btree ("influencer_profile_id");--> statement-breakpoint
CREATE INDEX "campaigns_brand_profile_id_idx" ON "campaigns" USING btree ("brand_profile_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_type_idx" ON "campaigns" USING btree ("type");--> statement-breakpoint
CREATE INDEX "campaigns_target_platform_idx" ON "campaigns" USING btree ("target_platform");--> statement-breakpoint
CREATE INDEX "campaigns_target_niche_idx" ON "campaigns" USING btree ("target_niche");--> statement-breakpoint
CREATE INDEX "campaigns_is_public_status_idx" ON "campaigns" USING btree ("is_public","status");--> statement-breakpoint
CREATE INDEX "campaign_deliverables_campaign_id_idx" ON "campaign_deliverables" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "proposals_campaign_influencer_idx" ON "proposals" USING btree ("campaign_id","influencer_profile_id");--> statement-breakpoint
CREATE INDEX "proposals_campaign_id_idx" ON "proposals" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "proposals_influencer_profile_id_idx" ON "proposals" USING btree ("influencer_profile_id");--> statement-breakpoint
CREATE INDEX "proposals_status_idx" ON "proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "proposals_type_idx" ON "proposals" USING btree ("type");--> statement-breakpoint
CREATE INDEX "contracts_proposal_id_idx" ON "contracts" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "contracts_brand_profile_id_idx" ON "contracts" USING btree ("brand_profile_id");--> statement-breakpoint
CREATE INDEX "contracts_influencer_profile_id_idx" ON "contracts" USING btree ("influencer_profile_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_stripe_payment_intent_id_idx" ON "contracts" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "milestones_contract_id_idx" ON "milestones" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "milestones_status_idx" ON "milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "milestones_contract_sort_idx" ON "milestones" USING btree ("contract_id","sort_order");--> statement-breakpoint
CREATE INDEX "payments_contract_id_idx" ON "payments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "payments_milestone_id_idx" ON "payments" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "payments_type_idx" ON "payments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscriptions_brand_profile_id_idx" ON "subscriptions" USING btree ("brand_profile_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");