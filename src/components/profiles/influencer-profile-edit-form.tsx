"use client";

import { useTransition, useState } from "react";
import {
  updateInfluencerProfile,
  updateInfluencerAvatar,
} from "@/server/actions/profiles";
import type { UpdateInfluencerProfileInput } from "@/lib/validators/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
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
import { CheckCircle } from "lucide-react";

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
] as const;

type Niche = (typeof NICHES)[number]["value"];

interface Props {
  initial: {
    displayName: string;
    bio: string | null;
    primaryNiche: string | null;
    secondaryNiches: string[] | null;
    city: string | null;
    state: string | null;
    minimumRateCents: number | null;
    acceptsDirectOffers: boolean;
    avatarUrl: string | null;
  };
}

export function InfluencerProfileEditForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [primaryNiche, setPrimaryNiche] = useState<string>(
    initial.primaryNiche ?? "",
  );
  const [secondary, setSecondary] = useState<Set<Niche>>(
    () => new Set((initial.secondaryNiches ?? []) as Niche[]),
  );
  const [state, setState] = useState<string>(initial.state ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);

  async function handleAvatarChange(url: string | null) {
    setAvatarUrl(url);
    const result = await updateInfluencerAvatar(url);
    if (result?.error) setError(result.error);
  }

  function toggleSecondary(niche: Niche) {
    setSecondary((prev) => {
      const next = new Set(prev);
      if (next.has(niche)) next.delete(niche);
      else if (next.size < 4) next.add(niche);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const minRate = formData.get("minimumRate") as string;

    const data: UpdateInfluencerProfileInput = {
      displayName: formData.get("displayName") as string,
      bio: (formData.get("bio") as string) || undefined,
      primaryNiche: primaryNiche
        ? (primaryNiche as UpdateInfluencerProfileInput["primaryNiche"])
        : undefined,
      secondaryNiches: Array.from(secondary) as Niche[],
      city: (formData.get("city") as string) || undefined,
      state: state || undefined,
      minimumRate: minRate ? Number(minRate) : undefined,
      acceptsDirectOffers: formData.get("acceptsDirectOffers") === "on",
    };

    startTransition(async () => {
      const result = await updateInfluencerProfile(data);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  const minimumRateDollars =
    initial.minimumRateCents != null
      ? Math.round(initial.minimumRateCents / 100)
      : "";

  return (
    <form onSubmit={handleSubmit}>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Creator profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              <CheckCircle className="size-4" />
              Profile updated.
            </div>
          )}

          <ImageUploader
            kind="avatar"
            label="Profile photo"
            helperText="JPG, PNG, WebP or GIF — max 5 MB. Square images look best."
            value={avatarUrl}
            onChange={handleAvatarChange}
            fallback={initial.displayName.slice(0, 2).toUpperCase()}
          />

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={initial.displayName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initial.bio ?? ""}
              placeholder="Tell brands what you're about, who your audience is, and how you like to collab."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Max 500 characters.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryNiche">Primary niche</Label>
            <Select
              value={primaryNiche}
              onValueChange={(v) => setPrimaryNiche(v ?? "")}
              name="primaryNiche"
            >
              <SelectTrigger id="primaryNiche">
                <SelectValue placeholder="Pick your main category" />
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

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label>Secondary niches</Label>
              <span className="text-xs text-muted-foreground">
                {secondary.size} / 4 selected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NICHES.filter((n) => n.value !== primaryNiche).map((niche) => {
                const checked = secondary.has(niche.value);
                const disabled = !checked && secondary.size >= 4;
                return (
                  <label
                    key={niche.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? "border-violet-400 bg-violet-50 text-violet-900"
                        : disabled
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-violet-600"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleSecondary(niche.value)}
                    />
                    {niche.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={initial.city ?? ""}
                placeholder="Sydney"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={state}
                onValueChange={(v) => setState(v ?? "")}
                name="state"
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumRate">Minimum rate (AUD)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="minimumRate"
                name="minimumRate"
                type="number"
                min={0}
                step={1}
                defaultValue={minimumRateDollars}
                placeholder="e.g. 250"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The floor for direct offers. Leave empty if you're flexible.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              name="acceptsDirectOffers"
              defaultChecked={initial.acceptsDirectOffers}
              className="mt-1 size-4 accent-violet-600"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                Accept direct offers from brands
              </p>
              <p className="text-xs text-muted-foreground">
                Brands on Pro can skip the campaign board and send you an offer
                directly. Turn off if you only want to apply.
              </p>
            </div>
          </label>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
