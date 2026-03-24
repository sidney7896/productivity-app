# Decision — Component Library

> Recorded: 2026-03-24

## Context
The project needs a component system that is accessible, customizable, and compatible with Tailwind CSS 4.

## Decision
Use **shadcn/ui v4** with **@base-ui/react** primitives (replacing the older Radix UI primitives from shadcn v3).

## Rationale
- **@base-ui/react** provides unstyled, accessible primitives (WAI-ARIA compliant)
- **shadcn** provides a CLI to add pre-styled components that are fully owned (copied into `components/ui/`)
- **CVA** (class-variance-authority) gives a typed variant API
- **cn()** utility ([[Utils — cn]]) handles class merging with Tailwind conflict resolution
- Components are not installed as a dependency — source code lives in the project and can be freely modified

## Consequences
- All UI components reside in `components/ui/`
- Styling is done via Tailwind utility classes, not CSS modules or styled-components
- Adding new components: `npx shadcn add <component>`

## Related
- [[Button]]
- [[Tech Stack]]
- [[Theming]]
- [[Home]]
