import { z } from "zod/v4";

export const campaignDeliverableSchema = z.object({
  type: z.enum([
    "instagram_post", "instagram_reel", "instagram_story",
    "tiktok_video", "youtube_video", "youtube_short",
    "twitter_post", "blog_post", "ugc_content", "product_review", "other",
  ]),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  requirements: z.string().optional(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  type: z.enum(["paid", "gifting", "product_exchange", "hybrid"]).default("paid"),
  expiresAt: z.coerce.date().optional(),
  targetPlatform: z.enum([
    "instagram", "tiktok", "youtube", "twitter", "linkedin",
    "facebook", "pinterest", "snapchat", "threads",
  ]),
  targetNiche: z.enum([
    "fashion", "beauty", "fitness", "food", "travel", "tech", "gaming",
    "lifestyle", "parenting", "finance", "education", "entertainment",
    "health", "sports", "automotive", "pets", "home_decor", "sustainability", "other",
  ]).optional(),
  targetLocation: z.string().optional(),
  minFollowerCount: z.coerce.number().int().min(0).optional(),
  budgetMin: z.coerce.number().int().min(0).optional(),
  budgetMax: z.coerce.number().int().min(0).optional(),
  applicationDeadline: z.coerce.date().optional(),
  campaignStartDate: z.coerce.date().optional(),
  campaignEndDate: z.coerce.date().optional(),
  giftDescription: z.string().optional(),
  giftValue: z.coerce.number().int().min(0).optional(),
  maxApplications: z.coerce.number().int().min(1).optional(),
  deliverables: z.array(campaignDeliverableSchema).min(1, "At least one deliverable is required"),
}).refine(
  (data) => {
    if (data.budgetMin != null && data.budgetMax != null) {
      return data.budgetMin <= data.budgetMax;
    }
    return true;
  },
  { message: "Minimum budget cannot exceed maximum budget", path: ["budgetMax"] },
);

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CampaignDeliverableInput = z.infer<typeof campaignDeliverableSchema>;
