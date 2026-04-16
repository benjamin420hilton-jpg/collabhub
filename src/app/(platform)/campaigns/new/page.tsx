import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";

export default async function NewCampaignPage() {
  const data = await getUserWithProfile();

  if (!data || data.role !== "brand" || !data.profile) {
    redirect("/dashboard");
  }

  const isPro =
    "subscriptionTier" in data.profile &&
    data.profile.subscriptionTier === "pro";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="mt-1 text-muted-foreground">
          Post a brief to the job board and receive proposals from influencers.
        </p>
      </div>
      <CreateCampaignForm isPro={isPro} />
    </div>
  );
}
