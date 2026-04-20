import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, Sparkles, Rocket, HandCoins } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-dark lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 10%, rgba(139, 92, 246, 0.45), transparent), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(236, 72, 153, 0.35), transparent)",
          }}
        />

        <div className="relative flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold tracking-tight">
            CollabHub
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Start collaborating in minutes.
            </h1>
            <p className="text-lg text-white/70">
              Free to join. Set up your profile, get discovered, and start landing paid partnerships.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: Sparkles, label: "Get matched with brands that fit your niche" },
              { icon: HandCoins, label: "Secure payouts — escrow-backed, fees on us for your first deal" },
              { icon: Rocket, label: "Pro fast-track: featured placement from day one" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 backdrop-blur">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm text-white/80">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} CollabHub. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <section className="relative flex min-h-screen flex-col bg-gradient-hero lg:min-h-0">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient-primary">
            CollabHub
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
              <p className="text-sm text-gray-600">
                Already a member?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-violet-600 underline-offset-4 hover:text-violet-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <SignUp
              forceRedirectUrl="/auth-callback"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "bg-white/80 backdrop-blur-xl border border-gray-200/70 shadow-xl shadow-violet-500/5 rounded-2xl",
                  header: "hidden",
                  socialButtonsBlockButton:
                    "border border-gray-200 hover:bg-gray-50 transition-colors",
                  socialButtonsBlockButtonText: "font-medium text-gray-700",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  formFieldLabel: "text-gray-700 font-medium",
                  formFieldInput:
                    "border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg",
                  formButtonPrimary:
                    "bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 transition-all normal-case text-sm font-semibold",
                  footer: "hidden",
                  footerAction: "hidden",
                },
                variables: {
                  colorPrimary: "#8B5CF6",
                  colorText: "#111827",
                  colorTextSecondary: "#4B5563",
                  borderRadius: "0.5rem",
                  fontFamily: "inherit",
                },
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
