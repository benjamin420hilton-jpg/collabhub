# CollabHub Architecture

## Overview

CollabHub is a dual-sided SaaS marketplace connecting **Brands** with **Social Media Influencers** for sponsored campaigns. It implements a hybrid monetization model combining pay-as-you-go escrow transactions with SaaS subscriptions.

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript (strict mode)            |
| Styling        | Tailwind CSS v4 + shadcn/ui         |
| Database       | PostgreSQL (Neon serverless)        |
| ORM            | Drizzle ORM                         |
| Authentication | Clerk                               |
| Payments       | Stripe Connect + Stripe Billing     |
| Validation     | Zod                                 |

## Folder Structure

```
├── drizzle/                    # Generated migration files
│   └── migrations/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Public auth routes (sign-in, sign-up)
│   │   ├── (platform)/         # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── campaigns/
│   │   │   ├── contracts/
│   │   │   ├── directory/      # Pro-only influencer discovery
│   │   │   ├── onboarding/
│   │   │   └── settings/
│   │   └── api/
│   │       └── webhooks/       # Clerk + Stripe webhook handlers
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Shell, nav, sidebar
│   │   ├── campaigns/
│   │   ├── contracts/
│   │   └── profiles/
│   ├── db/
│   │   ├── schema/             # Drizzle ORM table definitions
│   │   ├── index.ts            # DB client (Neon HTTP)
│   │   └── migrate.ts          # Migration runner
│   ├── lib/
│   │   ├── utils.ts            # cn() helper
│   │   ├── constants.ts        # Fee rates, currency helpers
│   │   ├── stripe.ts           # Stripe client init
│   │   └── validators/         # Zod schemas
│   ├── server/
│   │   ├── actions/            # Server Actions (mutations)
│   │   └── queries/            # Read-only data fetching
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── middleware.ts                # Clerk auth middleware
├── drizzle.config.ts           # Drizzle Kit config
└── .env.local                  # Environment variables (git-ignored)
```

## Data Flow

### Mutations (writes)

```
Client Component → Server Action (src/server/actions/) → Zod validation → Drizzle ORM → Neon PostgreSQL
```

All data mutations go through **Next.js Server Actions**. No direct client-side database queries. Server actions validate input with Zod, interact with the database via Drizzle, and revalidate relevant paths.

### Queries (reads)

```
Server Component → Query function (src/server/queries/) → Drizzle ORM → Neon PostgreSQL
```

Read-only data fetching happens in server components using dedicated query functions. These can leverage Next.js caching.

### Webhook events

```
External Service → POST /api/webhooks/{service} → Signature verification → DB update
```

Clerk and Stripe send webhook events that sync external state to the local database.

## Authentication Flow

1. **Clerk** handles all authentication (sign-up, sign-in, session management)
2. `middleware.ts` protects all routes except public ones (landing, auth pages, webhooks)
3. On user creation, Clerk fires a webhook → `POST /api/webhooks/clerk` creates a `users` row with the Clerk ID
4. After first sign-in, users are directed to `/onboarding` to select their role (Brand or Influencer) and create their profile

## Database Schema

### Entity Relationships

```
users (1) ←→ (1) brand_profiles
users (1) ←→ (1) influencer_profiles
influencer_profiles (1) ←→ (N) social_accounts
brand_profiles (1) ←→ (N) campaigns
brand_profiles (1) ←→ (1) subscriptions
campaigns (1) ←→ (N) campaign_deliverables
campaigns (1) ←→ (N) proposals
influencer_profiles (1) ←→ (N) proposals
proposals (1) ←→ (1) contracts
contracts (1) ←→ (N) milestones
contracts (1) ←→ (N) payments
```

### Key Design Decisions

- **Clerk ID mapping**: `users.clerkUserId` (text) maps to Clerk's `user_xxx` format. Internal UUID `id` is used for all foreign keys.
- **Money in cents**: All monetary values are stored as integers in the smallest currency unit (cents for AUD). No floating-point arithmetic.
- **Fee snapshotting**: `contracts.platformFeeRate` is set at contract creation based on the brand's current tier. Tier changes don't retroactively affect existing contracts.
- **Denormalized subscription tier**: `brand_profiles.subscriptionTier` is kept in sync with the `subscriptions` table via webhook handlers for fast feature-gating queries.

## Monetization Model

### Free Tier (Pay-as-you-go)

- Brands post public campaigns to the job board
- Influencers apply (inbound proposals)
- Accepted proposals create contracts with **10% platform fee** (1000 basis points)
- Escrow flow: Brand funds → Stripe hold → Milestone approval → Transfer to influencer (minus fee)

### Pro Tier (SaaS Subscription)

- Monthly subscription via Stripe Billing
- Unlocks the **Influencer Discovery Directory**
- Brands can send **direct outbound offers** to influencers
- **0% platform transaction fees**
- Enables **Product Gifting** campaigns (no monetary exchange)

## Escrow / Milestone Flow

```
1. Proposal accepted → Contract created (status: pending_escrow)
2. Brand funds escrow → Stripe PaymentIntent created (status: escrow_funded → active)
3. Influencer submits milestone → (status: submitted)
4. Brand reviews → approves or requests revision
5. On approval → Stripe Transfer to influencer's connected account (milestone: paid)
6. All milestones paid → Contract completed
```

## Conventions

- **Australian defaults**: AUD currency, AEST/AEDT timezone-aware timestamps
- **All timestamps**: Use `withTimezone: true` in PostgreSQL
- **Basis points for fees**: 1000 = 10%, avoids float math
- **Server Actions only**: No API routes for mutations (except webhooks)
- **One schema file per table**: Prevents circular imports, keeps files manageable
