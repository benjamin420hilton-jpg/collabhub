import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Megaphone, Shield, Users, Zap, Star, Globe,
  CheckCircle, TrendingUp, DollarSign, Search, FileText,
} from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold text-gradient-violet">CollabHub</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-violet text-white shadow-lg shadow-violet/20 transition-all hover:shadow-xl hover:shadow-violet/25 hover:-translate-y-0.5">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-hero">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 right-0 size-[500px] rounded-full bg-violet/[0.04] blur-3xl" />
            <div className="absolute -bottom-40 -left-20 size-[600px] rounded-full bg-indigo/[0.04] blur-3xl" />
            <div className="absolute top-32 right-20 size-3 rounded-full bg-violet/20 animate-float" />
            <div className="absolute top-48 left-[15%] size-2 rounded-full bg-indigo/25 animate-float delay-300" />
            <div className="absolute bottom-32 right-[35%] size-2.5 rounded-full bg-lavender/30 animate-float delay-500" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-fade-in-down">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet/15 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-dark shadow-sm backdrop-blur-sm">
                  <Zap className="size-3.5" />
                  Australia&apos;s Influencer Marketing Platform
                </span>
              </div>

              <h1 className="mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl animate-fade-in-up">
                Where Brands Meet{" "}
                <span className="text-gradient-violet">Creators</span>
              </h1>

              <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-in-up delay-100">
                The all-in-one platform to discover influencers, manage campaigns,
                and handle payments with built-in escrow protection.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up delay-200">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-violet px-8 text-white shadow-lg shadow-violet/20 transition-all hover:shadow-xl hover:shadow-violet/25 hover:-translate-y-0.5 text-base h-12"
                  >
                    Start Free <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-violet/15 px-8 transition-all hover:border-violet/30 hover:bg-violet-light/50 text-base h-12"
                  >
                    I Have an Account
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in-up delay-300">
                <span className="flex items-center gap-2">
                  <Shield className="size-4 text-violet" /> Secure escrow payments
                </span>
                <span className="flex items-center gap-2">
                  <Star className="size-4 text-violet" /> Free for influencers
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="size-4 text-violet" /> Built for Australia
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet">
                How It Works
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                From brief to payment in 4 steps
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  icon: Megaphone,
                  title: "Post a Campaign",
                  desc: "Brands create a brief with budget, deliverables, and target audience.",
                },
                {
                  step: "02",
                  icon: Search,
                  title: "Match with Creators",
                  desc: "Influencers apply from the job board, or brands send direct offers via the directory.",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Manage Milestones",
                  desc: "Track deliverables with milestone-based contracts. Review, approve, or request revisions.",
                },
                {
                  step: "04",
                  icon: DollarSign,
                  title: "Secure Payment",
                  desc: "Funds held in escrow and released automatically when milestones are approved.",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-violet/10">
                      {item.step}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-violet/20 to-transparent" />
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:shadow-violet/5 hover:-translate-y-1">
                    <div className="inline-flex rounded-xl bg-violet-light p-2.5">
                      <item.icon className="size-5 text-violet" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For brands / For influencers */}
        <section className="border-t bg-gradient-warm py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Brands */}
              <div className="rounded-3xl border border-border/40 bg-white p-8 shadow-sm animate-fade-in-up">
                <div className="inline-flex rounded-xl bg-violet-light p-3">
                  <Megaphone className="size-6 text-violet" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">For Brands</h3>
                <p className="mt-2 text-muted-foreground">
                  Everything you need to run influencer campaigns at scale.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Post campaigns to the public job board",
                    "Browse the Influencer Discovery Directory",
                    "Send direct offers to creators",
                    "Milestone-based contracts with escrow",
                    "0% transaction fees on the Pro plan",
                    "Product gifting campaigns",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-violet" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-8 inline-block">
                  <Button className="bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/25 hover:-translate-y-0.5">
                    Start as a Brand <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>

              {/* Influencers */}
              <div className="rounded-3xl border border-border/40 bg-white p-8 shadow-sm animate-fade-in-up delay-200">
                <div className="inline-flex rounded-xl bg-violet-light p-3">
                  <Users className="size-6 text-violet" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">For Influencers</h3>
                <p className="mt-2 text-muted-foreground">
                  Get discovered, land deals, and get paid. Always free.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Browse and apply to brand campaigns",
                    "Showcase your profile in the directory",
                    "Link all your social accounts",
                    "Track contracts and milestones",
                    "Get paid securely via Stripe",
                    "100% free — no commissions, ever",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-violet" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-8 inline-block">
                  <Button variant="outline" className="border-violet/20 transition-all hover:border-violet/30 hover:bg-violet-light/50">
                    Join as an Influencer <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Social proof */}
        <section className="border-t bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: "0%", label: "Fees for influencers", sub: "Always free" },
                { value: "$49", label: "Pro plan per month", sub: "AUD / month" },
                { value: "10+", label: "Platforms supported", sub: "IG, TikTok, YT..." },
                { value: "100%", label: "Escrow protected", sub: "Stripe secured" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <p className="text-4xl font-extrabold text-gradient-violet">{stat.value}</p>
                  <p className="mt-1 font-medium text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-gradient-hero py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to grow your brand?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join CollabHub today. Free to start, no credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-violet px-10 text-white shadow-lg shadow-violet/20 transition-all hover:shadow-xl hover:shadow-violet/25 hover:-translate-y-0.5 text-base h-12"
                >
                  Get Started Free <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-lg font-bold text-gradient-violet">CollabHub</span>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>Campaigns</span>
                <span>Directory</span>
                <span>Pricing</span>
              </div>
              <span className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} CollabHub. Built in Australia.
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
