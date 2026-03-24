# Button

> Source: `components/ui/button.tsx` — Client Component (`"use client"`)

## Overview
Accessible button built on `@base-ui/react`'s `ButtonPrimitive`, styled with [[Utils — cn|cn()]] and CVA (class-variance-authority).

## Exports
- `Button` — the component
- `buttonVariants` — CVA config (useful for anchor-styled buttons)

## Props
```ts
ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default"` \| `"outline"` \| `"secondary"` \| `"ghost"` \| `"destructive"` \| `"link"` | `"default"` | Visual style |
| `size` | `"default"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"icon"` \| `"icon-xs"` \| `"icon-sm"` \| `"icon-lg"` | `"default"` | Size preset |
| `className` | `string?` | — | Additional Tailwind classes |
| ...rest | `ButtonPrimitive.Props` | — | All Base UI button props (onClick, disabled, etc.) |

## Variant Styles

| Variant | Appearance |
|---------|-----------|
| `default` | Solid primary background |
| `outline` | Border + transparent background, fills on hover |
| `secondary` | Lighter secondary background |
| `ghost` | No background, fills on hover |
| `destructive` | Red tinted background (10-20% opacity) |
| `link` | Text-only with underline on hover |

## Size Presets

| Size | Height | Notes |
|------|--------|-------|
| `default` | `h-8` | Standard |
| `xs` | `h-6` | Extra small, smaller text & icons |
| `sm` | `h-7` | Small |
| `lg` | `h-9` | Large |
| `icon` | `size-8` | Square, icon only |
| `icon-xs` | `size-6` | Square XS |
| `icon-sm` | `size-7` | Square SM |
| `icon-lg` | `size-9` | Square LG |

## Full Source
```tsx
"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

## Accessibility
- Built on Base UI `ButtonPrimitive` — handles ARIA roles, keyboard nav, disabled state
- Focus ring via `focus-visible:border-ring focus-visible:ring-3`
- `aria-invalid` styling for form validation
- `aria-expanded` styling for dropdown triggers
- `active:translate-y-px` gives tactile press feedback

## Related
- [[Utils — cn]]
- [[Theming]]
- [[Home]]
