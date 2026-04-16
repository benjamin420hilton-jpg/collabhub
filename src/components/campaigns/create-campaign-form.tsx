"use client";

import { useTransition, useState } from "react";
import { createCampaign } from "@/server/actions/campaigns";
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
import { Plus, Trash2 } from "lucide-react";
import type { CreateCampaignInput, CampaignDeliverableInput } from "@/lib/validators/campaign";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "pinterest", label: "Pinterest" },
  { value: "snapchat", label: "Snapchat" },
  { value: "threads", label: "Threads" },
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

const DELIVERABLE_TYPES = [
  { value: "instagram_post", label: "Instagram Post" },
  { value: "instagram_reel", label: "Instagram Reel" },
  { value: "instagram_story", label: "Instagram Story" },
  { value: "tiktok_video", label: "TikTok Video" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "youtube_short", label: "YouTube Short" },
  { value: "twitter_post", label: "Twitter/X Post" },
  { value: "blog_post", label: "Blog Post" },
  { value: "ugc_content", label: "UGC Content" },
  { value: "product_review", label: "Product Review" },
  { value: "other", label: "Other" },
];

interface CreateCampaignFormProps {
  isPro: boolean;
}

export function CreateCampaignForm({ isPro }: CreateCampaignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [campaignType, setCampaignType] = useState<"paid" | "gifting">("paid");
  const [targetPlatform, setTargetPlatform] = useState<string>("");
  const [targetNiche, setTargetNiche] = useState<string>("");
  const [deliverables, setDeliverables] = useState<CampaignDeliverableInput[]>([
    { type: "instagram_post", quantity: 1 },
  ]);

  function addDeliverable() {
    setDeliverables([...deliverables, { type: "instagram_post", quantity: 1 }]);
  }

  function removeDeliverable(index: number) {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  }

  function updateDeliverable(index: number, field: keyof CampaignDeliverableInput, value: string | number) {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: CreateCampaignInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: campaignType,
      targetPlatform: targetPlatform as CreateCampaignInput["targetPlatform"],
      targetNiche: (targetNiche || undefined) as CreateCampaignInput["targetNiche"],
      targetLocation: (formData.get("targetLocation") as string) || undefined,
      minFollowerCount: Number(formData.get("minFollowerCount")) || undefined,
      budgetMin: Number(formData.get("budgetMin")) || undefined,
      budgetMax: Number(formData.get("budgetMax")) || undefined,
      maxApplications: Number(formData.get("maxApplications")) || undefined,
      giftDescription: (formData.get("giftDescription") as string) || undefined,
      giftValue: Number(formData.get("giftValue")) || undefined,
      deliverables,
    };

    startTransition(async () => {
      const result = await createCampaign(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Summer Fashion Collection Launch"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your campaign, what you're looking for, and any specific requirements..."
                rows={5}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select
                  value={campaignType}
                  onValueChange={(v) => setCampaignType(v as "paid" | "gifting")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid Campaign</SelectItem>
                    <SelectItem value="gifting" disabled={!isPro}>
                      Product Gifting {!isPro && "(Pro only)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Platform *</Label>
                <Select value={targetPlatform} onValueChange={(v) => setTargetPlatform(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        {campaignType === "paid" ? (
          <Card>
            <CardHeader>
              <CardTitle>Budget (AUD)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum ($)</Label>
                  <Input
                    id="budgetMin"
                    name="budgetMin"
                    type="number"
                    min="0"
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum ($)</Label>
                  <Input
                    id="budgetMax"
                    name="budgetMax"
                    type="number"
                    min="0"
                    placeholder="2000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Gift Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="giftDescription">What are you gifting?</Label>
                <Textarea
                  id="giftDescription"
                  name="giftDescription"
                  placeholder="Describe the product or experience..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="giftValue">Estimated Value ($AUD)</Label>
                <Input
                  id="giftValue"
                  name="giftValue"
                  type="number"
                  min="0"
                  placeholder="150"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Preferred Niche</Label>
                <Select value={targetNiche} onValueChange={(v) => setTargetNiche(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLocation">Location</Label>
                <Input
                  id="targetLocation"
                  name="targetLocation"
                  placeholder="e.g. Sydney, NSW"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minFollowerCount">Minimum Followers</Label>
                <Input
                  id="minFollowerCount"
                  name="minFollowerCount"
                  type="number"
                  min="0"
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxApplications">Max Applications</Label>
                <Input
                  id="maxApplications"
                  name="maxApplications"
                  type="number"
                  min="1"
                  placeholder="50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliverables */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Deliverables</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
              <Plus className="mr-1 size-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={d.type}
                      onValueChange={(v) => updateDeliverable(i, "type", v ?? "instagram_post")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERABLE_TYPES.map((dt) => (
                          <SelectItem key={dt.value} value={dt.value}>
                            {dt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={d.quantity}
                      onChange={(e) => updateDeliverable(i, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <Input
                      placeholder="Optional notes..."
                      value={d.requirements ?? ""}
                      onChange={(e) => updateDeliverable(i, "requirements", e.target.value)}
                    />
                  </div>
                </div>
                {deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-6"
                    onClick={() => removeDeliverable(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
