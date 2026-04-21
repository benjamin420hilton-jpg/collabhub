# Colour scheme

Every colour in the app comes from this palette. If you reach for a new hex, stop and pick a token instead.

All tokens are defined in one place: [src/app/globals.css](src/app/globals.css) (`@theme` block).

## The palette

### Brand

| Token            | Hex       | Role                                     |
| ---------------- | --------- | ---------------------------------------- |
| `brand`          | `#8B5CF6` | Primary brand violet. Main CTAs, accents |
| `brand-light`    | `#F5F3FF` | Tinted backgrounds, hover surfaces       |
| `brand-dark`     | `#7C3AED` | Pressed states, deep violet accents      |
| `highlight`      | `#EC4899` | Secondary accent pink. Gradient pair     |
| `highlight-light`| `#FDF2F8` | Tinted pink backgrounds                  |
| `highlight-dark` | `#DB2777` | Deep pink accents                        |

The signature gradient is `brand → highlight` (violet to pink). Use `.bg-gradient-primary` or `.text-gradient-primary`.

### Neutrals

| Token         | Hex       | Role                              |
| ------------- | --------- | --------------------------------- |
| `navy`        | `#0F0A2A` | Sidebar, dark surfaces            |
| `navy-light`  | `#1A1145` | Gradient partner for navy         |
| `navy-muted`  | `#3B3570` | Muted dark text                   |
| `sand`        | `#FAF8FF` | Page backgrounds                  |
| `sand-dark`   | `#F0ECFF` | Section separators                |
| `slate-warm`  | `#64748b` | Body text on light surfaces       |

### Semantic (status)

These are standard Tailwind hex values used for state. No custom tokens — use the Tailwind `green-*`, `amber-*`, `red-*` utility classes.

| Role        | Class prefix | Hex (500)  |
| ----------- | ------------ | ---------- |
| Success     | `green-*`    | `#22c55e`  |
| Warning     | `amber-*`    | `#f59e0b`  |
| Destructive | `red-*`      | `#ef4444`  |
| Muted/info  | `gray-*`     | `#9ca3af`  |

shadcn's `destructive` token mirrors red and is the preferred choice for destructive CTAs.

## Rules

1. **No new hex values in components.** If the token doesn't exist, add it to `globals.css` first.
2. **Class names:** `bg-brand`, `text-brand`, `border-brand`, `bg-brand/20` (opacity works), `hover:bg-brand-light`.
3. **Gradients stay on-palette.** Mix `brand`, `highlight`, `navy`, `sand` — don't introduce new stops.
4. **shadcn tokens** (`primary`, `accent`, `muted`, `destructive`, `card`, `sidebar`) are the semantic layer — reach for those first. The brand palette is for bespoke accents the shadcn tokens don't cover.
5. **Charts:** brand elements use `#8B5CF6`/`#EC4899`; status elements use the semantic hex table above.

## Known hex sites (by design)

These files have hex values that are intentional and match the palette — don't token-ify them blindly:

- [src/app/globals.css](src/app/globals.css) — gradient utility classes (Tailwind can't compose `linear-gradient()` from tokens ergonomically)
- [src/app/(auth)/sign-in/\[\[...sign-in\]\]/page.tsx](src/app/(auth)/sign-in/[[...sign-in]]/page.tsx) — Clerk `variables` object doesn't accept CSS vars
- [src/app/(auth)/sign-up/\[\[...sign-up\]\]/page.tsx](src/app/(auth)/sign-up/[[...sign-up]]/page.tsx) — same
- [src/lib/email/index.ts](src/lib/email/index.ts) — email clients don't support CSS vars
- [src/components/payments/money-over-time-chart.tsx](src/components/payments/money-over-time-chart.tsx), [src/components/proposals/proposals-chart.tsx](src/components/proposals/proposals-chart.tsx) — Recharts props take raw strings

If you change the brand hex in `globals.css`, update these sites too.
