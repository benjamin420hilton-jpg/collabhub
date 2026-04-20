import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SocialAccountsManager } from "@/components/profiles/social-accounts-manager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { InfluencerProfile } from "@/types";

export default async function SettingsPage() {
  const data = await getUserWithProfile();
  if (!data || !data.profile) redirect("/dashboard");

  const isInfluencer = data.role === "influencer";

  let socials: (typeof socialAccounts.$inferSelect)[] = [];
  if (isInfluencer && data.profile) {
    socials = await db
      .select()
      .from(socialAccounts)
      .where(
        eq(
          socialAccounts.influencerProfileId,
          (data.profile as InfluencerProfile).id,
        ),
      );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      {/* Account info */}
      <Card className="animate-fade-in-up delay-100">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{data.user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">
              {data.user.firstName} {data.user.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{data.role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Profile edit entry */}
      <Card className="animate-fade-in-up delay-150">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Profile</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {isInfluencer
                ? "Your bio, niches, location, rate, and how brands can reach you."
                : "Your company details, industry, and how creators see your brand."}
            </p>
          </div>
          <Link href="/settings/profile">
            <Button variant="outline" className="gap-2">
              <Pencil className="size-4" />
              Edit profile
            </Button>
          </Link>
        </CardHeader>
      </Card>

      {/* Social accounts for influencers */}
      {isInfluencer && <SocialAccountsManager accounts={socials} />}
    </div>
  );
}
