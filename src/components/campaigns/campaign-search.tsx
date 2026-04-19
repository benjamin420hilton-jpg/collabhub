"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { CampaignFilters } from "@/server/queries/campaigns";

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

const TYPES = [
  { value: "paid", label: "Paid" },
  { value: "gifting", label: "Gifting" },
  { value: "product_exchange", label: "Product Exchange" },
  { value: "hybrid", label: "Hybrid" },
];

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

// Budget thresholds stored as cents ($500, $1k, $5k, $10k)
const BUDGET_OPTIONS = [
  { value: "50000", label: "$500+" },
  { value: "100000", label: "$1k+" },
  { value: "500000", label: "$5k+" },
  { value: "1000000", label: "$10k+" },
];

interface CampaignSearchProps {
  filters: CampaignFilters;
}

export function CampaignSearch({ filters }: CampaignSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");

  function applyFilters(newFilters: Partial<CampaignFilters>) {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (merged.search) params.set("search", merged.search);
    if (merged.niche) params.set("niche", merged.niche);
    if (merged.type) params.set("type", merged.type);
    if (merged.platform) params.set("platform", merged.platform);
    if (merged.minBudget) params.set("minBudget", String(merged.minBudget));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ search: search || undefined });
  }

  const hasFilters =
    filters.search ||
    filters.niche ||
    filters.type ||
    filters.platform ||
    filters.minBudget;

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title or description..."
            className="pl-9"
          />
        </div>
        <Button
          type="submit"
          className="bg-gradient-primary text-white"
          disabled={isPending}
        >
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.niche ?? ""}
          onValueChange={(v) => applyFilters({ niche: v || undefined })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            {NICHES.map((n) => (
              <SelectItem key={n.value} value={n.value}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type ?? ""}
          onValueChange={(v) => applyFilters({ type: v || undefined })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Campaign type" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.platform ?? ""}
          onValueChange={(v) => applyFilters({ platform: v || undefined })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.minBudget ? String(filters.minBudget) : ""}
          onValueChange={(v) =>
            applyFilters({ minBudget: v ? Number(v) : undefined })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Min budget" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_OPTIONS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
