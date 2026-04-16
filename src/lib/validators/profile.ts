import { z } from "zod/v4";

export const selectRoleSchema = z.object({
  role: z.enum(["brand", "influencer"]),
});

export const brandProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  abn: z.string().optional(),
  website: z.url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("AU"),
});

export const influencerProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  primaryNiche: z.enum([
    "fashion", "beauty", "fitness", "food", "travel", "tech", "gaming",
    "lifestyle", "parenting", "finance", "education", "entertainment",
    "health", "sports", "automotive", "pets", "home_decor", "sustainability", "other",
  ]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("AU"),
  minimumRate: z.coerce.number().int().min(0).optional(),
  acceptsDirectOffers: z.boolean().default(true),
});

export type SelectRoleInput = z.infer<typeof selectRoleSchema>;
export type BrandProfileInput = z.infer<typeof brandProfileSchema>;
export type InfluencerProfileInput = z.infer<typeof influencerProfileSchema>;
