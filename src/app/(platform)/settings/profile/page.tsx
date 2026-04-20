import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/server/queries/profiles";
import { InfluencerProfileEditForm } from "@/components/profiles/influencer-profile-edit-form";
import { BrandProfileEditForm } from "@/components/profiles/brand-profile-edit-form";
import { ArrowLeft } from "lucide-react";
import type { InfluencerProfile, BrandProfile } from "@/types";

export default async function ProfileSettingsPage() {
  const data = await getUserWithProfile();
  if (!data || !data.profile) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to settings
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Edit profile</h1>
        <p className="mt-1 text-muted-foreground">
          Keep your public profile fresh. Changes show up immediately on the
          directory and your media kit.
        </p>
      </div>

      {data.role === "influencer" ? (
        <InfluencerProfileEditForm
          initial={{
            displayName: (data.profile as InfluencerProfile).displayName,
            bio: (data.profile as InfluencerProfile).bio,
            primaryNiche: (data.profile as InfluencerProfile).primaryNiche,
            secondaryNiches:
              (data.profile as InfluencerProfile).secondaryNiches ?? [],
            city: (data.profile as InfluencerProfile).city,
            state: (data.profile as InfluencerProfile).state,
            minimumRateCents:
              (data.profile as InfluencerProfile).minimumRate,
            acceptsDirectOffers: (data.profile as InfluencerProfile)
              .acceptsDirectOffers,
          }}
        />
      ) : (
        <BrandProfileEditForm
          initial={{
            companyName: (data.profile as BrandProfile).companyName,
            abn: (data.profile as BrandProfile).abn,
            website: (data.profile as BrandProfile).website,
            industry: (data.profile as BrandProfile).industry,
            companySize: (data.profile as BrandProfile).companySize,
            description: (data.profile as BrandProfile).description,
            city: (data.profile as BrandProfile).city,
            state: (data.profile as BrandProfile).state,
          }}
        />
      )}
    </div>
  );
}
