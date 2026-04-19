ALTER TABLE "influencer_profiles" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "influencer_profiles_directory_rank_idx" ON "influencer_profiles" USING btree ("is_featured","subscription_tier","total_followers");