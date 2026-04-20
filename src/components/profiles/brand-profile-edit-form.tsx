"use client";

import { useTransition, useState } from "react";
import {
  updateBrandProfile,
  updateBrandLogo,
} from "@/server/actions/profiles";
import type { UpdateBrandProfileInput } from "@/lib/validators/profile";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
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

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];

const INDUSTRIES = [
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Beverage",
  "Technology",
  "Health & Wellness",
  "Travel & Hospitality",
  "Finance",
  "Education",
  "Entertainment",
  "Sports & Fitness",
  "Automotive",
  "Real Estate",
  "Retail",
  "Other",
];

interface Props {
  initial: {
    companyName: string;
    abn: string | null;
    website: string | null;
    industry: string | null;
    companySize: string | null;
    description: string | null;
    city: string | null;
    state: string | null;
    logoUrl: string | null;
  };
}

export function BrandProfileEditForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [industry, setIndustry] = useState<string>(initial.industry ?? "");
  const [companySize, setCompanySize] = useState<string>(
    initial.companySize ?? "",
  );
  const [state, setState] = useState<string>(initial.state ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);

  async function handleLogoChange(url: string | null) {
    setLogoUrl(url);
    const result = await updateBrandLogo(url);
    if (result?.error) setError(result.error);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const data: UpdateBrandProfileInput = {
      companyName: formData.get("companyName") as string,
      abn: (formData.get("abn") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      industry: industry || undefined,
      companySize: companySize || undefined,
      description: (formData.get("description") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: state || undefined,
    };

    startTransition(async () => {
      const result = await updateBrandProfile(data);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Business details</CardTitle>
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
            kind="logo"
            label="Company logo"
            helperText="Square SVG/PNG on a transparent background works best. Max 5 MB."
            value={logoUrl}
            onChange={handleLogoChange}
            fallback={initial.companyName.slice(0, 2).toUpperCase()}
          />

          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={initial.companyName}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                name="abn"
                defaultValue={initial.abn ?? ""}
                placeholder="Australian Business Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={initial.website ?? ""}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={industry}
                onValueChange={(v) => setIndustry(v ?? "")}
                name="industry"
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company size</Label>
              <Select
                value={companySize}
                onValueChange={(v) => setCompanySize(v ?? "")}
                name="companySize"
              >
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initial.description ?? ""}
              placeholder="Tell creators what your brand is about and what kind of content you're looking for."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Max 500 characters.</p>
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
