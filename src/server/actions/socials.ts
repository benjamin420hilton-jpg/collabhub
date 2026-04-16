"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, influencerProfiles, socialAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const addSocialSchema = z.object({
  platform: z.enum([
    "instagram", "tiktok", "youtube", "twitter", "linkedin",
    "facebook", "pinterest", "snapchat", "threads",
  ]),
  handle: z.string().min(1, "Handle is required"),
  profileUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  followerCount: z.coerce.number().int().min(0).optional(),
});

export type AddSocialInput = z.infer<typeof addSocialSchema>;

async function getInfluencerProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "influencer") throw new Error("Not an influencer");

  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, user.id))
    .limit(1);

  if (!profile) throw new Error("Profile not found");
  return profile;
}

export async function addSocialAccount(input: AddSocialInput) {
  const profile = await getInfluencerProfile();

  const parsed = addSocialSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data" };

  // Check if platform already linked
  const [existing] = await db
    .select({ id: socialAccounts.id })
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.influencerProfileId, profile.id),
        eq(socialAccounts.platform, parsed.data.platform),
      ),
    )
    .limit(1);

  if (existing) return { error: "This platform is already linked" };

  await db.insert(socialAccounts).values({
    influencerProfileId: profile.id,
    platform: parsed.data.platform,
    handle: parsed.data.handle,
    profileUrl: parsed.data.profileUrl || null,
    followerCount: parsed.data.followerCount ?? null,
  });

  // Update total followers on profile
  const allSocials = await db
    .select({ followerCount: socialAccounts.followerCount })
    .from(socialAccounts)
    .where(eq(socialAccounts.influencerProfileId, profile.id));

  const totalFollowers = allSocials.reduce(
    (sum, s) => sum + (s.followerCount ?? 0),
    0,
  );

  await db
    .update(influencerProfiles)
    .set({ totalFollowers })
    .where(eq(influencerProfiles.id, profile.id));

  revalidatePath("/settings");
  revalidatePath("/directory");
  return { success: true };
}

export async function removeSocialAccount(socialAccountId: string) {
  const profile = await getInfluencerProfile();

  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, socialAccountId))
    .limit(1);

  if (!account || account.influencerProfileId !== profile.id)
    return { error: "Not found" };

  await db.delete(socialAccounts).where(eq(socialAccounts.id, socialAccountId));

  // Recalculate total followers
  const allSocials = await db
    .select({ followerCount: socialAccounts.followerCount })
    .from(socialAccounts)
    .where(eq(socialAccounts.influencerProfileId, profile.id));

  const totalFollowers = allSocials.reduce(
    (sum, s) => sum + (s.followerCount ?? 0),
    0,
  );

  await db
    .update(influencerProfiles)
    .set({ totalFollowers })
    .where(eq(influencerProfiles.id, profile.id));

  revalidatePath("/settings");
  revalidatePath("/directory");
  return { success: true };
}
