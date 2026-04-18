"use client";

import { Building2, Users } from "lucide-react";
import { selectRole } from "@/server/actions/profiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RoleSelector() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <form action={selectRole} className="h-full">
        <input type="hidden" name="role" value="brand" />
        <Card className="card-hover cursor-pointer border-border/60 animate-fade-in-up delay-100 flex flex-col h-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-coral-light">
              <Building2 className="size-7 text-coral" />
            </div>
            <CardTitle className="text-xl">I&apos;m a Brand</CardTitle>
          </CardHeader>
          <CardContent className="text-center flex flex-col flex-1 justify-between gap-4">
            <CardDescription>
              Post campaigns, discover influencers, and manage sponsored content.
            </CardDescription>
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
        <Card className="card-hover cursor-pointer border-border/60 animate-fade-in-up delay-200 flex flex-col h-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-teal-light">
              <Users className="size-7 text-teal" />
            </div>
            <CardTitle className="text-xl">I&apos;m an Influencer</CardTitle>
          </CardHeader>
          <CardContent className="text-center flex flex-col flex-1 justify-between gap-4">
            <CardDescription>
              Find brand deals, showcase your content, and grow your career. 100% free.
            </CardDescription>
            <Button
              type="submit"
              className="w-full bg-gradient-ocean text-white shadow-md shadow-teal/20 transition-all hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5"
            >
              Continue as Influencer
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
