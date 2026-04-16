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
    <div className="grid gap-6 sm:grid-cols-2">
      <form action={selectRole} className="flex">
        <input type="hidden" name="role" value="brand" />
        <Card className="card-hover flex flex-col cursor-pointer border-border/60 animate-fade-in-up delay-100">
          <CardHeader className="flex-1 text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-violet-light">
              <Building2 className="size-7 text-violet" />
            </div>
            <CardTitle className="text-xl">I&apos;m a Brand</CardTitle>
            <CardDescription className="min-h-[3rem]">
              Post campaigns, discover influencers, and manage sponsored content.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              type="submit"
              className="w-full bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5"
            >
              Continue as Brand
            </Button>
          </CardContent>
        </Card>
      </form>

      <form action={selectRole} className="flex">
        <input type="hidden" name="role" value="influencer" />
        <Card className="card-hover flex flex-col cursor-pointer border-border/60 animate-fade-in-up delay-200">
          <CardHeader className="flex-1 text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-violet-light">
              <Users className="size-7 text-violet" />
            </div>
            <CardTitle className="text-xl">I&apos;m an Influencer</CardTitle>
            <CardDescription className="min-h-[3rem]">
              Find brand deals, showcase your content, and grow your career. 100% free.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              type="submit"
              className="w-full bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5"
            >
              Continue as Influencer
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
