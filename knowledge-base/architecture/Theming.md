# Theming

> Source: `app/globals.css`

## Overview
The app uses **Tailwind CSS 4** with a custom theme defined via CSS custom properties. Colors use the **oklch()** color space for perceptual uniformity.

## CSS Imports
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

## Dark Mode
Dark mode uses the class strategy:
```css
@custom-variant dark (&:is(.dark *));
```
Toggle by adding/removing the `.dark` class on a parent element.

## Color Tokens (Light)

| Token | Value |
|-------|-------|
| `--background` | `oklch(1 0 0)` (white) |
| `--foreground` | `oklch(0.145 0 0)` (near-black) |
| `--primary` | `oklch(0.205 0 0)` |
| `--primary-foreground` | `oklch(0.985 0 0)` |
| `--secondary` | `oklch(0.97 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` (red) |
| `--muted` | `oklch(0.97 0 0)` |
| `--accent` | `oklch(0.97 0 0)` |
| `--border` | `oklch(0.922 0 0)` |
| `--ring` | `oklch(0.708 0 0)` |
| `--radius` | `0.625rem` |

## Radius Scale
Derived from `--radius` base:
- `--radius-sm`: `× 0.6`
- `--radius-md`: `× 0.8`
- `--radius-lg`: `× 1.0`
- `--radius-xl`: `× 1.4`
- `--radius-2xl`: `× 1.8`
- `--radius-3xl`: `× 2.2`
- `--radius-4xl`: `× 2.6`

## Fonts
- **Sans**: Geist (`--font-geist-sans`) — loaded in [[Root Layout]]
- **Mono**: Geist Mono (`--font-geist-mono`)

## Base Layer
```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
```

## Related
- [[Root Layout]]
- [[Button]]
- [[Tech Stack]]
- [[Home]]
