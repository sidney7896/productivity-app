# Project Structure

> Next.js 16 App Router layout

```
productivity-app/
├── app/
│   ├── layout.tsx          → [[Root Layout]]
│   ├── page.tsx            → [[Home Page]]
│   ├── globals.css         → [[Theming]]
│   └── favicon.ico
├── components/
│   └── ui/
│       └── button.tsx      → [[Button]]
├── lib/
│   └── utils.ts            → [[Utils — cn]]
├── public/
│   ├── next.svg
│   ├── vercel.svg
│   └── file-text.svg
├── knowledge-base/         → This documentation
├── package.json            → [[Tech Stack]]
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Conventions
- **Server Components** are the default; add `"use client"` only when needed
- **UI components** live in `components/ui/` (shadcn pattern)
- **Utilities** live in `lib/`
- **Path alias**: `@/` maps to project root (e.g. `@/lib/utils`)

## Related
- [[Tech Stack]]
- [[Memory]]
- [[Home]]
