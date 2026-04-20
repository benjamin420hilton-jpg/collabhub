import { z } from "zod/v4";
import { checkProfanity } from "@/lib/moderation/profanity";

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

export const createCampaignSchema = z
  .object({
    title: z
      .string()
      .min(10, "Title must be at least 10 characters")
      .max(100, "Title must be under 100 characters"),
    description: z
      .string()
      .min(100, "Description must be at least 100 characters — brands get better applications with specifics")
      .max(2000),
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
    applicationDeadline: z.coerce.date({
      message: "Application deadline is required so creators know when to apply",
    }),
    campaignStartDate: z.coerce.date().optional(),
    campaignEndDate: z.coerce.date().optional(),
    giftDescription: z.string().optional(),
    giftValue: z.coerce.number().int().min(0).optional(),
    maxApplications: z.coerce.number().int().min(1).optional(),
    deliverables: z.array(campaignDeliverableSchema).min(1, "At least one deliverable is required"),
  })
  .refine(
    (data) => {
      if (data.budgetMin != null && data.budgetMax != null) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    { message: "Minimum budget cannot exceed maximum budget", path: ["budgetMax"] },
  )
  .refine(
    (data) => {
      if (data.type === "paid" || data.type === "hybrid") {
        return data.budgetMin != null && data.budgetMax != null;
      }
      return true;
    },
    {
      message: "Paid campaigns need a budget range so creators can self-select",
      path: ["budgetMin"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "gifting" || data.type === "product_exchange") {
        return (data.giftDescription?.trim().length ?? 0) >= 10;
      }
      return true;
    },
    {
      message: "Describe what you're gifting (min 10 characters)",
      path: ["giftDescription"],
    },
  )
  .refine(
    (data) => {
      return (
        data.applicationDeadline.getTime() > Date.now() + 60_000
      );
    },
    {
      message: "Application deadline must be in the future",
      path: ["applicationDeadline"],
    },
  )
  .refine(
    (data) => checkProfanity(data.title, data.description, data.giftDescription ?? "").ok,
    {
      message: "Your copy contains language not allowed on CollabHub. Please revise and try again.",
      path: ["description"],
    },
  );

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CampaignDeliverableInput = z.infer<typeof campaignDeliverableSchema>;
