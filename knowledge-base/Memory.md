# Memory — Project Context

> Auto-generated summary for LLM context. Last synced: 2026-03-24.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| CSS Animations | tw-animate-css | ^1.4.0 |
| Component Primitives | @base-ui/react | ^1.3.0 |
| Component CLI | shadcn | ^4.1.0 |
| Variant Utility | class-variance-authority (CVA) | ^0.7.1 |
| Class Merging | clsx + tailwind-merge | ^2.1.1 / ^3.5.0 |
| Icons | lucide-react | ^1.0.1 |

## Architecture Overview

- **App Router** — all routing via `app/` directory (Next.js 16 conventions)
- **Server Components by default** — only marked `"use client"` where interactivity is needed
- **Styling** — Tailwind CSS 4 utility classes; theme tokens defined as CSS custom properties in `globals.css` using `oklch()` color space
- **Component pattern** — Base UI primitives wrapped with CVA variants and `cn()` utility for class merging
- **Font** — Geist (sans + mono) loaded via `next/font/google`

## Key Types / Interfaces

_No custom types directory yet. Button component uses inline type:_

```ts
ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
```

## Directory Map

```
app/
  layout.tsx        — Root layout (Geist font, metadata)
  page.tsx          — Home page (default starter)
  globals.css       — Theme tokens, Tailwind config
components/
  ui/
    button.tsx      — Button component (CVA variants)
lib/
  utils.ts          — cn() class-merge utility
```

## Missing / Not Yet Created
- `hooks/` — no custom hooks
- `types/` — no shared type definitions
- `app/api/` — no API routes
- No database or authentication configured

## Related
- [[Home]]
- [[Tech Stack]]
- [[Project Structure]]
