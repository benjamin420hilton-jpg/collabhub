"use client";

import { useTransition, useState } from "react";
import { addSocialAccount, removeSocialAccount } from "@/server/actions/socials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { SocialAccount } from "@/types";
import type { AddSocialInput } from "@/server/actions/socials";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", urlPrefix: "https://instagram.com/" },
  { value: "tiktok", label: "TikTok", urlPrefix: "https://tiktok.com/@" },
  { value: "youtube", label: "YouTube", urlPrefix: "https://youtube.com/@" },
  { value: "twitter", label: "Twitter/X", urlPrefix: "https://x.com/" },
  { value: "linkedin", label: "LinkedIn", urlPrefix: "https://linkedin.com/in/" },
  { value: "facebook", label: "Facebook", urlPrefix: "https://facebook.com/" },
  { value: "pinterest", label: "Pinterest", urlPrefix: "https://pinterest.com/" },
  { value: "snapchat", label: "Snapchat", urlPrefix: "https://snapchat.com/add/" },
  { value: "threads", label: "Threads", urlPrefix: "https://threads.net/@" },
];

interface SocialAccountsManagerProps {
  accounts: SocialAccount[];
}

export function SocialAccountsManager({ accounts }: SocialAccountsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");

  const linkedPlatforms = accounts.map((a) => a.platform);
  const availablePlatforms = PLATFORMS.filter(
    (p) => !linkedPlatforms.includes(p.value as typeof accounts[0]["platform"]),
  );

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const handle = formData.get("handle") as string;
    const platformInfo = PLATFORMS.find((p) => p.value === platform);
    const profileUrl = platformInfo
      ? `${platformInfo.urlPrefix}${handle.replace("@", "")}`
      : "";

    const data: AddSocialInput = {
      platform: platform as AddSocialInput["platform"],
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      profileUrl,
      followerCount: Number(formData.get("followerCount")) || undefined,
    };

    startTransition(async () => {
      const result = await addSocialAccount(data);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        setPlatform("");
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeSocialAccount(id);
    });
  }

  return (
    <Card className="animate-fade-in-up delay-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Social Accounts</CardTitle>
          <CardDescription>
            Link your socials so brands can find and verify you.
          </CardDescription>
        </div>
        {availablePlatforms.length > 0 && !showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="border-brand/20 hover:bg-brand-light"
          >
            <Plus className="mr-1 size-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing accounts */}
        {accounts.map((account) => {
          const platformInfo = PLATFORMS.find((p) => p.value === account.platform);
          return (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-lg border border-border/60 p-3"
            >
              <div className="flex items-center gap-3">
                <Badge className="border-brand/20 bg-brand-light text-brand-dark">
                  {platformInfo?.label ?? account.platform}
                </Badge>
                <span className="font-medium">{account.handle}</span>
                {account.followerCount && account.followerCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {account.followerCount.toLocaleString()} followers
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {account.profileUrl && (
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:text-brand-dark"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(account.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && !showForm && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No social accounts linked yet. Add your socials to be discoverable by brands.
          </p>
        )}

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-brand/20 bg-brand-light/30 p-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Handle</Label>
                <Input name="handle" placeholder="@yourhandle" required />
              </div>
              <div className="space-y-2">
                <Label>Followers</Label>
                <Input
                  name="followerCount"
                  type="number"
                  min="0"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-primary text-white"
                disabled={isPending || !platform}
              >
                {isPending ? "Adding..." : "Add Account"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
