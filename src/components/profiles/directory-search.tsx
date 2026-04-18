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
import type { DirectoryFilters } from "@/server/queries/directory";

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

const STATES = [
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
];

interface DirectorySearchProps {
  filters: DirectoryFilters;
}

export function DirectorySearch({ filters }: DirectorySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");

  function applyFilters(newFilters: Partial<DirectoryFilters>) {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (merged.search) params.set("search", merged.search);
    if (merged.niche) params.set("niche", merged.niche);
    if (merged.state) params.set("state", merged.state);
    if (merged.minFollowers) params.set("minFollowers", String(merged.minFollowers));
    if (merged.platform) params.set("platform", merged.platform);

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

  const hasFilters = filters.search || filters.niche || filters.state || filters.minFollowers || filters.platform;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-white p-4 shadow-sm">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, bio, or location..."
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
          value={filters.state ?? ""}
          onValueChange={(v) => applyFilters({ state: v || undefined })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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
