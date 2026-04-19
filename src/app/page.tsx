import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Megaphone, Shield, Zap, Star, Globe,
  CheckCircle, TrendingUp, DollarSign, Search, FileText,
  Camera, Heart, Award,
} from "lucide-react";

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
              <Button className="bg-gradient-primary text-white shadow-lg shadow-coral/20 transition-all hover:shadow-xl hover:shadow-coral/25 hover:-translate-y-0.5">
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
                  <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/5 px-4 py-1.5 text-sm font-medium text-coral-dark shadow-sm backdrop-blur-sm">
                    <Zap className="size-3.5" />
                    Australia&apos;s Influencer Marketing Platform
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-extrabold leading-[0.95] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-[4.5rem] animate-fade-in-up">
                  Where Brands Meet{" "}
                  <span className="text-gradient-animated">Creators</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground animate-fade-in-up delay-100 sm:text-lg">
                  The all-in-one platform to discover influencers, manage
                  campaigns, and handle payments with built-in escrow
                  protection.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row animate-fade-in-up delay-200">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-gradient-primary px-8 text-white shadow-lg shadow-coral/25 transition-all hover:shadow-xl hover:shadow-coral/30 hover:-translate-y-0.5 text-base h-12"
                    >
                      Start Free <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-gray-300 text-gray-700 px-8 transition-all hover:border-coral/40 hover:bg-coral/5 text-base h-12"
                    >
                      I Have an Account
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-in-up delay-300">
                  <span className="flex items-center gap-2">
                    <Shield className="size-4 text-coral" /> Secure escrow payments
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-teal" /> Free for influencers
                  </span>
                  <span className="flex items-center gap-2">
                    <Globe className="size-4 text-coral" /> Built for Australia
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
                    <div className="flex size-10 items-center justify-center rounded-xl bg-coral-light">
                      <TrendingUp className="size-5 text-coral" />
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
              <p className="text-sm font-semibold uppercase tracking-widest text-coral">
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
                  color: "bg-coral-light text-coral",
                },
                {
                  step: "02",
                  icon: Search,
                  title: "Match with Creators",
                  desc: "Influencers apply from the job board, or brands send direct offers via the directory.",
                  color: "bg-teal-light text-teal",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Manage Milestones",
                  desc: "Track deliverables with milestone-based contracts. Review, approve, or request revisions.",
                  color: "bg-coral-light text-coral",
                },
                {
                  step: "04",
                  icon: DollarSign,
                  title: "Secure Payment",
                  desc: "Funds held in escrow and released automatically when milestones are approved.",
                  color: "bg-teal-light text-teal",
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
              <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-coral-light/50 p-8 shadow-sm animate-fade-in-up">
                <div className="inline-flex rounded-xl bg-coral-light p-3">
                  <Megaphone className="size-6 text-coral" />
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
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-coral" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-8 inline-block">
                  <Button className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/25 hover:-translate-y-0.5">
                    Start as a Brand <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>

              {/* Influencers */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-teal-light/50 p-8 shadow-sm animate-fade-in-up delay-200">
                <div className="inline-flex rounded-xl bg-teal-light p-3">
                  <Camera className="size-6 text-teal" />
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
                    "100% free \u2014 no commissions, ever",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-teal" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-8 inline-block">
                  <Button variant="outline" className="border-teal/30 text-teal-dark transition-all hover:border-teal/50 hover:bg-teal-light/50">
                    Join as an Influencer <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
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
              <p className="text-sm font-semibold uppercase tracking-widest text-teal">
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
                  accent: "bg-teal-light text-teal",
                },
                {
                  icon: Award,
                  title: "Verified Profiles",
                  desc: "Brands verify their business. Influencers link their socials. Everyone knows who they're working with.",
                  accent: "bg-coral-light text-coral",
                },
                {
                  icon: TrendingUp,
                  title: "Real Metrics",
                  desc: "No fake follower counts. Connected social accounts show real, verified audience data.",
                  accent: "bg-teal-light text-teal",
                },
                {
                  icon: FileText,
                  title: "Smart Contracts",
                  desc: "Milestone-based agreements with clear deliverables, deadlines, and automatic payment triggers.",
                  accent: "bg-coral-light text-coral",
                },
                {
                  icon: Heart,
                  title: "Community First",
                  desc: "Ratings, reviews, and reputation scores help the best creators and brands rise to the top.",
                  accent: "bg-teal-light text-teal",
                },
                {
                  icon: Globe,
                  title: "Made for Australia",
                  desc: "AUD payments, Australian business support, and a community built for the local market.",
                  accent: "bg-coral-light text-coral",
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
                  className="bg-white px-10 text-coral-dark font-semibold shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:-translate-y-0.5 text-base h-12"
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
