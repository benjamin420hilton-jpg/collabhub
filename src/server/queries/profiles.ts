import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, brandProfiles, influencerProfiles, socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (existing) return existing;

  // User exists in Clerk but not in our DB — create them now
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    })
    .onConflictDoNothing({ target: users.clerkUserId })
    .returning();

  return created ?? null;
}

export async function getBrandProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function getInfluencerProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function getInfluencerProfileWithSocials(userId: string) {
  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, userId))
    .limit(1);

  if (!profile) return null;

  const socials = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.influencerProfileId, profile.id));

  return { ...profile, socialAccounts: socials };
}

export async function getUserWithProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "brand") {
    const profile = await getBrandProfile(user.id);
    return { user, profile, role: "brand" as const };
  }

  if (user.role === "influencer") {
    const profile = await getInfluencerProfileWithSocials(user.id);
    return { user, profile, role: "influencer" as const };
  }

  return { user, profile: null, role: null };
}
