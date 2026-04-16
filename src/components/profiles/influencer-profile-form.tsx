"use client";

import { useTransition, useState } from "react";
import { createInfluencerProfile } from "@/server/actions/profiles";
import type { InfluencerProfileInput } from "@/lib/validators/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

const NICHES = [
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "tech", label: "Tech" },
  { value: "gaming", label: "Gaming" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "parenting", label: "Parenting" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "automotive", label: "Automotive" },
  { value: "pets", label: "Pets" },
  { value: "home_decor", label: "Home & Decor" },
  { value: "sustainability", label: "Sustainability" },
  { value: "other", label: "Other" },
];

export function InfluencerProfileForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: InfluencerProfileInput = {
      displayName: formData.get("displayName") as string,
      bio: (formData.get("bio") as string) || undefined,
      primaryNiche:
        (formData.get("primaryNiche") as InfluencerProfileInput["primaryNiche"]) ||
        undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      country: "AU",
      acceptsDirectOffers: true,
    };

    startTransition(async () => {
      const result = await createInfluencerProfile(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="Your creator name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell brands about yourself and your content..."
              maxLength={500}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryNiche">Primary Niche</Label>
            <Select name="primaryNiche">
              <SelectTrigger id="primaryNiche">
                <SelectValue placeholder="What do you create content about?" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((niche) => (
                  <SelectItem key={niche.value} value={niche.value}>
                    {niche.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Sydney" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select name="state">
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating Profile..." : "Create Profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
