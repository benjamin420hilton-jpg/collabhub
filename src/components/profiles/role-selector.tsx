"use client";

import { Building2, Users, Check } from "lucide-react";
import { selectRole } from "@/server/actions/profiles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BRAND_POINTS = [
  "Post campaigns to a public job board",
  "Browse a vetted creator directory",
  "Escrow-backed milestone payments",
  "Low 5% payment protection fee",
];

const CREATOR_POINTS = [
  "Apply to real, paying brand campaigns",
  "Build a public media kit that sells you",
  "Get paid via Stripe, no chasing invoices",
  "Free forever — no platform fees on your earnings",
];

export function RoleSelector() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <form action={selectRole} className="h-full">
        <input type="hidden" name="role" value="brand" />
        <Card className="card-hover cursor-pointer border-border/60 animate-fade-in-up delay-100 flex h-full flex-col">
          <CardHeader className="pb-4">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-coral-light">
              <Building2 className="size-7 text-coral" />
            </div>
            <CardTitle className="text-xl">I&apos;m a Brand</CardTitle>
            <p className="text-sm text-muted-foreground">
              Run creator campaigns without chasing DMs or spreadsheets.
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <ul className="space-y-2">
              {BRAND_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-coral" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Button
              type="submit"
              className="w-full bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
            >
              Continue as Brand
            </Button>
          </CardContent>
        </Card>
      </form>

      <form action={selectRole} className="h-full">
        <input type="hidden" name="role" value="influencer" />
        <Card className="card-hover cursor-pointer border-border/60 animate-fade-in-up delay-200 flex h-full flex-col">
          <CardHeader className="pb-4">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-teal-light">
              <Users className="size-7 text-teal" />
            </div>
            <CardTitle className="text-xl">I&apos;m a Creator</CardTitle>
            <p className="text-sm text-muted-foreground">
              Turn your audience into a pipeline of paid brand deals.
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <ul className="space-y-2">
              {CREATOR_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-teal" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Button
              type="submit"
              className="w-full bg-gradient-ocean text-white shadow-md shadow-teal/20 transition-all hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5"
            >
              Continue as Creator
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
