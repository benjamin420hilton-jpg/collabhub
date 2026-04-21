import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProBadge, FeaturedBadge } from "@/components/ui/pro-badge";
import {
  ArrowRight, Megaphone, Shield, Zap, Star, Globe,
  CheckCircle, TrendingUp, DollarSign, Search, FileText,
  Camera, Heart, Award, MapPin, Users, Crown, Rocket,
  Infinity as InfinityIcon, Clock,
} from "lucide-react";
import { getFeaturedCreatorsForLanding } from "@/server/queries/directory";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&auto=format&fit=crop",
    alt: "Curated boutique clothing rack",
    aspect: "aspect-[4/5]",
    width: 600,
    height: 750,
  },
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80&auto=format&fit=crop",
    alt: "Flat-lay of beauty and skincare products",
    aspect: "aspect-square",
    width: 500,
    height: 500,
  },
  {
    src: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80&auto=format&fit=crop",
    alt: "Creator workspace with camera and accessories",
    aspect: "aspect-square",
    width: 500,
    height: 500,
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop",
    alt: "Travel lifestyle shot on a beach",
    aspect: "aspect-[4/5]",
    width: 600,
    height: 750,
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  const featuredCreators = await getFeaturedCreatorsForLanding(6);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <span className="text-3xl font-extrabold tracking-tight text-gradient-primary">CollabHub</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-primary text-white shadow-lg shadow-brand/20 transition-all hover:shadow-xl hover:shadow-brand/25 hover:-translate-y-0.5">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero — text + imagery collage */}
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="relative mx-auto max-w-7xl px-6 pt-6 pb-8 sm:pt-8 sm:pb-10 lg:pt-10 lg:pb-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
              {/* Left — text, natural flow */}
              <div className="max-w-2xl">
                <div className="animate-fade-in-down">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm font-medium text-brand-dark shadow-sm backdrop-blur-sm">
                    <Zap className="size-3.5" />
                    Australia&apos;s Influencer Marketing Platform
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-extrabold leading-[0.95] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-[4.5rem] animate-fade-in-up">
                  Where Brands Meet{" "}
                  <span className="text-gradient-animated">Creators</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground animate-fade-in-up delay-100 sm:text-lg">
                  Land your first brand deal — or find the creator your
                  campaign needs. Free to start, escrow-protected from brief
                  to payout.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row animate-fade-in-up delay-200">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-gradient-primary px-8 text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 text-base h-12"
                    >
                      Start Free <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-gray-300 text-gray-700 px-8 transition-all hover:border-brand/40 hover:bg-brand/5 text-base h-12"
                    >
                      I Have an Account
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-in-up delay-300">
                  <span className="flex items-center gap-2">
                    <Shield className="size-4 text-brand" /> Secure escrow payments
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-highlight" /> Free for influencers
                  </span>
                  <span className="flex items-center gap-2">
                    <Globe className="size-4 text-brand" /> Built for Australia
                  </span>
                </div>
              </div>

              {/* Right — imagery collage (compact, badge overlays a corner) */}
              <div className="relative mx-auto w-full max-w-xs animate-fade-in-up delay-200 sm:max-w-sm lg:max-w-md">
                {/* Soft gradient anchor behind the collage */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-primary opacity-10 blur-3xl"
                />

                <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Left column — slight offset down */}
                  <div className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                    {HERO_IMAGES.slice(0, 2).map((img, i) => (
                      <div
                        key={img.src}
                        className={`relative ${img.aspect} overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-xl shadow-navy/10 animate-float`}
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          priority={i === 0}
                          sizes="(min-width: 1024px) 20vw, 40vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Right column — starts at top */}
                  <div className="space-y-3 sm:space-y-4">
                    {HERO_IMAGES.slice(2).map((img, i) => (
                      <div
                        key={img.src}
                        className={`relative ${img.aspect} overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-xl shadow-navy/10 animate-float`}
                        style={{ animationDelay: `${(i + 2) * 200}ms` }}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 1024px) 20vw, 40vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating stat badge — overlaps bottom-left corner, stays inside hero */}
                <div className="absolute bottom-3 left-3 hidden rounded-2xl border border-border/50 bg-white/95 p-3 shadow-xl shadow-navy/10 backdrop-blur sm:left-4 sm:bottom-4 sm:p-4 lg:block animate-fade-in-up delay-500">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand-light">
                      <TrendingUp className="size-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Creators paid this month
                      </p>
                      <p className="text-lg font-bold tracking-tight">
                        $284k AUD
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — warm sand background */}
        <section className="border-t border-border bg-gradient-sand py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
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
                  color: "bg-brand-light text-brand",
                },
                {
                  step: "02",
                  icon: Search,
                  title: "Match with Creators",
                  desc: "Influencers apply from the job board, or brands send direct offers via the directory.",
                  color: "bg-highlight-light text-highlight",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Manage Milestones",
                  desc: "Track deliverables with milestone-based contracts. Review, approve, or request revisions.",
                  color: "bg-brand-light text-brand",
                },
                {
                  step: "04",
                  icon: DollarSign,
                  title: "Secure Payment",
                  desc: "Funds held in escrow and released automatically when milestones are approved.",
                  color: "bg-highlight-light text-highlight",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="relative flex flex-col animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-navy/10">
                      {item.step}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:shadow-navy/5 hover:-translate-y-1">
                    <div className={`inline-flex rounded-xl p-2.5 ${item.color.split(" ")[0]}`}>
                      <item.icon className={`size-5 ${item.color.split(" ")[1]}`} />
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

        {/* For brands / For influencers — white background */}
        <section className="border-t border-border bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Brands */}
              <div className="flex flex-col rounded-3xl border border-border bg-gradient-to-br from-white to-brand-light/50 p-8 shadow-sm animate-fade-in-up">
                <div className="inline-flex rounded-xl bg-brand-light p-3">
                  <Megaphone className="size-6 text-brand" />
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
                    "Low 5% Payment Protection Fee",
                    "Product gifting & exchange campaigns",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-auto inline-block pt-8">
                  <Button className="bg-gradient-primary text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/25 hover:-translate-y-0.5">
                    Start as a Brand <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>

              {/* Creators */}
              <div className="flex flex-col rounded-3xl border border-border bg-gradient-to-br from-white to-highlight-light/50 p-8 shadow-sm animate-fade-in-up delay-200">
                <div className="inline-flex rounded-xl bg-highlight-light p-3">
                  <Camera className="size-6 text-highlight" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">
                  For Creators
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Turn your feed into a full-time income. Your first brand
                  deal starts here.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Apply to real, paying brand campaigns",
                    "Build a public media kit that does the selling for you",
                    "Receive direct offers from Pro brands",
                    "Escrow-protected payouts — no chasing invoices",
                    "Works even if you're just starting out",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-highlight" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-brand/20 bg-white/70 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-dark">
                    <Zap className="size-3" /> Fast-track with Pro
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Serious about landing deals? Pro creators see briefs{" "}
                    <strong className="text-foreground">24 hours early</strong>,
                    apply <strong className="text-foreground">unlimited</strong>{" "}
                    times, and get a{" "}
                    <strong className="text-foreground">PRO badge</strong> that
                    brands trust.
                  </p>
                </div>
                <Link href="/sign-up" className="mt-auto inline-block pt-8">
                  <Button className="bg-gradient-ocean text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/25 hover:-translate-y-0.5">
                    Start as a Creator <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Meet creators — public preview of the directory */}
        {featuredCreators.length > 0 && (
          <section className="relative overflow-hidden border-t border-border bg-white py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-gradient-primary opacity-[0.06] blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 -left-20 size-80 rounded-full bg-gradient-ocean opacity-[0.05] blur-3xl"
            />

            <div className="relative mx-auto max-w-6xl px-6">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  Meet the creators
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Real Australian creators, ready to work with you
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  Browse a sample of the influencers waiting for your brief.
                  Free to sign up. Free to post a campaign. No card required.
                </p>
              </div>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCreators.map(({ profile, socialAccounts }, i) => (
                  <Link
                    key={profile.id}
                    href={`/creator/${profile.id}`}
                    className="group block animate-fade-in-up"
                    style={{ animationDelay: `${(i + 1) * 70}ms` }}
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/40 p-6 shadow-sm transition-all group-hover:-translate-y-1 group-hover:border-brand/40 group-hover:shadow-xl group-hover:shadow-brand/10">
                      <div className="flex items-start gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-ocean text-lg font-bold text-white shadow-md shadow-brand/20">
                          {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="truncate font-semibold">
                              {profile.displayName}
                            </h3>
                            {profile.isFeatured && <FeaturedBadge />}
                            {profile.subscriptionTier === "pro" && (
                              <ProBadge />
                            )}
                          </div>
                          {profile.city && profile.state && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3" />
                              {profile.city}, {profile.state}
                            </p>
                          )}
                        </div>
                      </div>

                      {profile.bio && (
                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                          {profile.bio}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {profile.primaryNiche && (
                          <Badge className="border-highlight/20 bg-highlight-light text-highlight-dark">
                            {profile.primaryNiche.replace("_", " ")}
                          </Badge>
                        )}
                        {profile.totalFollowers &&
                          profile.totalFollowers > 0 && (
                            <Badge
                              variant="outline"
                              className="border-border/60"
                            >
                              <Users className="mr-1 size-3" />
                              {profile.totalFollowers >= 1000
                                ? `${(profile.totalFollowers / 1000).toFixed(1)}K followers`
                                : `${profile.totalFollowers} followers`}
                            </Badge>
                          )}
                        {socialAccounts.length > 0 && (
                          <Badge
                            variant="outline"
                            className="border-border/60 capitalize"
                          >
                            {socialAccounts.length} platform
                            {socialAccounts.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 flex flex-col items-center gap-3">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-primary px-8 text-white shadow-md shadow-brand/25 transition-all hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5"
                  >
                    Sign up to browse all creators
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  Post your first campaign free — no card needed.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Pro Creator — fast-track section */}
        <section className="relative overflow-hidden border-t border-border bg-gradient-sand py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-gradient-primary opacity-[0.08] blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-dark shadow-sm backdrop-blur-sm">
                <Crown className="size-3.5" />
                Pro Creator
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Stop waiting for luck.{" "}
                <span className="text-gradient-animated">Fast-track</span> your
                first deal.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                You&apos;re building something. Pro Creator gets you in front
                of briefs 24&nbsp;hours before everyone else and removes every
                limit holding you back.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Clock,
                  title: "24h early access",
                  desc: "See new campaigns 24 hours before free creators. Apply before the inbox is full.",
                  color: "text-brand",
                  bg: "bg-brand-light",
                },
                {
                  icon: InfinityIcon,
                  title: "Unlimited applications",
                  desc: "Free tier caps at 5/month. Pro removes the cap — go hard, land deals faster.",
                  color: "text-highlight",
                  bg: "bg-highlight-light",
                },
                {
                  icon: Crown,
                  title: "PRO badge",
                  desc: "Brands trust verified Pro creators first. Badge appears on your profile and every proposal.",
                  color: "text-brand",
                  bg: "bg-brand-light",
                },
                {
                  icon: Rocket,
                  title: "Priority placement",
                  desc: "Top of the directory when brands search. More eyes, more offers, more bookings.",
                  color: "text-highlight",
                  bg: "bg-highlight-light",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div
                    className={`inline-flex rounded-xl p-2.5 ${feature.bg}`}
                  >
                    <feature.icon className={`size-5 ${feature.color}`} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing + CTA */}
            <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand-light via-white to-highlight-light/50 p-8 text-center shadow-lg shadow-brand/10 sm:p-10">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-extrabold tracking-tight">
                  $14.99
                </span>
                <span className="text-muted-foreground">AUD / month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Less than one coffee a week. Cancel anytime.
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-primary px-8 text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 text-base h-12"
                >
                  Start your 7-day free trial
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                No card charged during trial · Downgrade anytime
              </p>
            </div>
          </div>
        </section>

        {/* Stats / Social proof — dark navy */}
        <section className="bg-gradient-dark py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: "0%", label: "Fees for influencers", sub: "Always free", color: "text-gradient-primary" },
                { value: "$49", label: "Pro plan per month", sub: "AUD / month", color: "text-gradient-ocean" },
                { value: "10+", label: "Platforms supported", sub: "IG, TikTok, YT...", color: "text-gradient-primary" },
                { value: "100%", label: "Escrow protected", sub: "Stripe secured", color: "text-gradient-ocean" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="mt-1 font-medium text-white">{stat.label}</p>
                  <p className="text-sm text-slate-400">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why CollabHub — sand background */}
        <section className="border-t border-border bg-gradient-sand py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-highlight">
                Why CollabHub
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Built for creators who mean business
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Escrow Protection",
                  desc: "Funds are held securely and only released when both sides are happy with the deliverables.",
                  accent: "bg-highlight-light text-highlight",
                },
                {
                  icon: Award,
                  title: "Verified Profiles",
                  desc: "Brands verify their business. Influencers link their socials. Everyone knows who they're working with.",
                  accent: "bg-brand-light text-brand",
                },
                {
                  icon: TrendingUp,
                  title: "Real Metrics",
                  desc: "No fake follower counts. Connected social accounts show real, verified audience data.",
                  accent: "bg-highlight-light text-highlight",
                },
                {
                  icon: FileText,
                  title: "Smart Contracts",
                  desc: "Milestone-based agreements with clear deliverables, deadlines, and automatic payment triggers.",
                  accent: "bg-brand-light text-brand",
                },
                {
                  icon: Heart,
                  title: "Community First",
                  desc: "Ratings, reviews, and reputation scores help the best creators and brands rise to the top.",
                  accent: "bg-highlight-light text-highlight",
                },
                {
                  icon: Globe,
                  title: "Made for Australia",
                  desc: "AUD payments, Australian business support, and a community built for the local market.",
                  accent: "bg-brand-light text-brand",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <div className={`inline-flex rounded-xl p-2.5 ${item.accent.split(" ")[0]}`}>
                    <item.icon className={`size-5 ${item.accent.split(" ")[1]}`} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — vivid gradient */}
        <section className="bg-gradient-cta py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to grow your brand?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join CollabHub today. Free to start, no credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white px-10 text-brand-dark font-semibold shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:-translate-y-0.5 text-base h-12"
                >
                  Get Started Free <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer — dark */}
        <footer className="border-t border-white/10 bg-navy py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-2xl font-extrabold tracking-tight text-gradient-primary">CollabHub</span>
              <div className="flex gap-6 text-sm text-slate-400">
                <span className="hover:text-white transition-colors cursor-pointer">Campaigns</span>
                <span className="hover:text-white transition-colors cursor-pointer">Directory</span>
                <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
              </div>
              <span className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} CollabHub. Built in Australia.
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
