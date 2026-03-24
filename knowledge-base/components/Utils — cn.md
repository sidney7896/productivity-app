# Utils — cn

> Source: `lib/utils.ts`

## Overview
Class name merge utility that combines `clsx` (conditional classes) with `tailwind-merge` (intelligent Tailwind deduplication). Used by every styled component.

## Full Source
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Signature
```ts
cn(...inputs: ClassValue[]): string
```

## Usage Example
```tsx
cn("px-4 py-2", isActive && "bg-primary", className)
// → merges and deduplicates Tailwind classes
```

## Why Both Libraries?
- **clsx**: Handles conditional values, arrays, objects → produces a class string
- **tailwind-merge**: Resolves conflicts (e.g. `px-4 px-2` → `px-2`) so later classes win

## Related
- [[Button]]
- [[Tech Stack]]
- [[Home]]
