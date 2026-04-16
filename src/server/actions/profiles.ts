"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, brandProfiles, influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  selectRoleSchema,
  brandProfileSchema,
  influencerProfileSchema,
  type BrandProfileInput,
  type InfluencerProfileInput,
} from "@/lib/validators/profile";

export async function selectRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = selectRoleSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error("Invalid role selection");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  await db
    .update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, user.id));

  redirect(`/onboarding/${parsed.data.role}`);
}

export async function createBrandProfile(input: BrandProfileInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = brandProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid profile data", issues: parsed.error.issues };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (user.role !== "brand") throw new Error("User is not a brand");

  const existing = await db
    .select({ id: brandProfiles.id })
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Brand profile already exists" };
  }

  await db.insert(brandProfiles).values({
    userId: user.id,
    companyName: parsed.data.companyName,
    abn: parsed.data.abn || null,
    website: parsed.data.website || null,
    industry: parsed.data.industry || null,
    companySize: parsed.data.companySize || null,
    description: parsed.data.description || null,
    city: parsed.data.city || null,
    state: parsed.data.state || null,
    country: parsed.data.country,
  });

  await db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createInfluencerProfile(input: InfluencerProfileInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = influencerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid profile data", issues: parsed.error.issues };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (user.role !== "influencer") throw new Error("User is not an influencer");

  const existing = await db
    .select({ id: influencerProfiles.id })
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Influencer profile already exists" };
  }

  await db.insert(influencerProfiles).values({
    userId: user.id,
    displayName: parsed.data.displayName,
    bio: parsed.data.bio || null,
    primaryNiche: parsed.data.primaryNiche || null,
    city: parsed.data.city || null,
    state: parsed.data.state || null,
    country: parsed.data.country,
    minimumRate: parsed.data.minimumRate ?? null,
    acceptsDirectOffers: parsed.data.acceptsDirectOffers,
  });

  await db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
