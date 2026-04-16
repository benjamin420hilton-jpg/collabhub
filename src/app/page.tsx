import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Megaphone, Shield, Users, Zap, Star, Globe } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/70 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-gradient-violet">CollabHub</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-violet text-white shadow-lg shadow-violet/25 transition-all hover:shadow-xl hover:shadow-violet/30 hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 right-1/4 size-72 rounded-full bg-violet/5 blur-3xl" />
            <div className="absolute -bottom-20 left-1/4 size-96 rounded-full bg-indigo/5 blur-3xl" />
            <div className="absolute top-1/3 right-10 size-4 rounded-full bg-violet/20 animate-float" />
            <div className="absolute top-1/4 left-16 size-3 rounded-full bg-indigo/25 animate-float delay-300" />
            <div className="absolute bottom-1/3 right-1/3 size-2 rounded-full bg-lavender/40 animate-float delay-500" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="animate-fade-in-down">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet-light px-4 py-1.5 text-sm font-medium text-violet-dark">
                <Zap className="size-3.5" />
                The #1 Influencer Marketplace in Australia
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl animate-fade-in-up">
              Where Brands Meet{" "}
              <span className="text-gradient-violet">Creators</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-fade-in-up delay-100">
              CollabHub connects brands with social media influencers for
              sponsored campaigns. Post briefs, discover talent, manage
              contracts, and handle payments — all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up delay-200">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-violet px-8 text-white shadow-lg shadow-violet/25 transition-all hover:shadow-xl hover:shadow-violet/30 hover:-translate-y-0.5"
                >
                  Start Free <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-violet/20 px-8 transition-all hover:border-violet/40 hover:bg-violet-light"
                >
                  I Have an Account
                </Button>
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up delay-300">
              <span className="flex items-center gap-1.5">
                <Shield className="size-4 text-violet" /> Stripe-secured payments
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 text-violet" /> Free for influencers
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-4 text-violet" /> Built for Australia
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-white px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center animate-fade-in-up">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything you need to{" "}
                <span className="text-gradient-violet">collaborate</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                From discovery to payment, CollabHub handles the entire
                influencer marketing workflow.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <div className="group rounded-2xl border border-border/50 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-violet/5 hover:-translate-y-1 animate-fade-in-up delay-100">
                <div className="inline-flex rounded-xl bg-violet-light p-3">
                  <Megaphone className="size-6 text-violet" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">For Brands</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Post campaigns, browse the influencer directory, and manage
                  milestone-based contracts with built-in escrow payments.
                </p>
              </div>

              <div className="group rounded-2xl border border-border/50 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-violet/5 hover:-translate-y-1 animate-fade-in-up delay-200">
                <div className="inline-flex rounded-xl bg-violet-light p-3">
                  <Users className="size-6 text-violet" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">For Influencers</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Find brand deals, submit proposals, and get paid securely
                  through milestone tracking. Always free for creators.
                </p>
              </div>

              <div className="group rounded-2xl border border-border/50 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-violet/5 hover:-translate-y-1 animate-fade-in-up delay-300">
                <div className="inline-flex rounded-xl bg-violet-light p-3">
                  <Shield className="size-6 text-violet" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Secure Payments</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Stripe-powered escrow ensures brands pay and influencers get
                  paid on milestone completion. No more chasing invoices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-gradient-warm px-4 py-20">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold">Ready to grow?</h2>
            <p className="mt-4 text-muted-foreground">
              Join CollabHub today and start connecting with the right partners.
            </p>
            <Link href="/sign-up" className="mt-8 inline-block">
              <Button
                size="lg"
                className="bg-gradient-violet px-10 text-white shadow-lg shadow-violet/25 transition-all hover:shadow-xl hover:shadow-violet/30 hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white px-4 py-8">
          <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-semibold text-gradient-violet">CollabHub</span>
            <span>&copy; {new Date().getFullYear()} CollabHub. Built in Australia.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
