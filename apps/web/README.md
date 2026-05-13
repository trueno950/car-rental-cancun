# Frontend contributor guide

`apps/web` already runs on Feature-Driven Architecture (FDA). Keep new code inside that shape from day 0, or the boundary rules will fight you for a GOOD reason.

## Quick path

1. Put routes in `app/` and business UI in `src/features/*`.
2. Import features only from `@features/<name>` and shared/core only from `@shared/*` or `@core/*`.
3. Before opening a PR, run `pnpm --filter @rental/web lint && pnpm --filter @rental/web typecheck && pnpm --filter @rental/web test`.

## What goes where

| Location                  | Put here                                                                  | Keep out                                         |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `app/`                    | Next.js routes, layouts, page composition, server-side data entrypoints   | Domain logic, raw HTTP helpers, reusable UI      |
| `src/features/<feature>/` | Feature UI, feature hooks, services, feature-local helpers, feature types | Cross-feature imports, generic shared primitives |
| `src/shared/`             | Reusable UI, shared hooks, pure UI helpers like `cn()`                    | Feature/domain behavior                          |
| `src/core/`               | Infra and platform concerns like auth, i18n, HTTP base config             | UI primitives, feature logic                     |

## Real aliases in this repo

These are the ONLY frontend architecture aliases documented by the current `tsconfig.json`:

```txt
@/*
@/app/*
@features/*
@shared/*
@core/*
```

Do **not** reintroduce legacy aliases like `@/src/*`, `@/components/*`, or `@/lib/*`.

## Real boundary rules enforced today

The repo enforces FDA through `apps/web/.eslintrc.cjs` with `boundaries/dependencies` plus targeted `no-restricted-imports` rules.

| From                | Allowed                                            | Forbidden examples                       |
| ------------------- | -------------------------------------------------- | ---------------------------------------- |
| `app/`              | `app/`, `@features/<name>`, `@shared/*`, `@core/*` | `@features/<name>/components/*`          |
| `src/features/<a>/` | Same feature internals, `@shared/*`, `@core/*`     | Another feature's internals or barrel    |
| `src/shared/`       | `src/shared/`, `@core/*`                           | Anything in `src/features/*`             |
| `src/core/`         | Own internal files and external packages only      | `app/`, `src/features/*`, `src/shared/*` |

### Non-negotiable package boundaries

- Use `lucide-react` exclusively for icons.
- Leaflet imports stay inside `src/features/map/components/**`.
- Framer Motion stays in leaf client components, never in `app/**/page.tsx` or `app/**/layout.tsx`.
- Forms and API boundaries should consume shared contracts from `@rental/validations` instead of inline Zod schemas in reservation flow files.

## Server/client rules

- Default to Server Components.
- Add `"use client"` only to leaf components that need browser APIs, state, effects, or event handlers.
- Keep `app/` files as server-first composition shells.
- If you need a browser-only island, follow the map pattern: server page imports a feature public API, then the feature owns the client boundary internally.

## Feature scaffold checklist

Create new features under `src/features/<name>/`.

```txt
src/features/<name>/
  components/
  hooks/
  services/
  schemas/
  types.ts
  index.ts
```

Add these only when the feature genuinely needs them:

- `actions/` for Next Server Actions that only dispatch to the backend
- `lib/` for feature-local pure helpers

### Checklist before you add a feature

- [ ] Folder name is `kebab-case`
- [ ] Public API is exported from `src/features/<name>/index.ts`
- [ ] `app/` imports only from `@features/<name>`
- [ ] HTTP calls live in `services/`
- [ ] Adapters that reshape backend responses live next to the service
- [ ] Local UI state stays local; do not promote feature-local state to a global store
- [ ] Interactive leaves own `"use client"`; route containers do not

## Shared and core checklist

Use this when the code is NOT feature-specific.

### Put code in `src/shared/` when it is:

- Reusable across multiple features
- UI-facing or presentation-oriented
- Safe without domain knowledge

Examples in this repo:

- `src/shared/components/ui/*`
- `src/shared/components/motion/*`
- `src/shared/lib/utils.ts`

### Put code in `src/core/` when it is:

- Infrastructure or platform plumbing
- Auth, i18n, or HTTP configuration
- Needed by multiple layers but NOT a reusable UI primitive

Examples in this repo:

- `src/core/auth/*`
- `src/core/i18n/*`
- `src/core/http/*`

## Do not bring legacy back

Do **not** add new code to these old shapes:

- `components/`
- `lib/`
- `src/actions/`
- `src/components/`
- `src/lib/`

If you need UI, shared helpers, or feature logic, place it in FDA folders instead.

## Import examples

### Good

```ts
import { MapView } from "@features/map";
import { ReservationRequestForm } from "@features/reservations";
import { Button } from "@shared/components/ui";
import { resolveReservationApiBaseUrl } from "@core/http";
```

### Bad

```ts
import { MapView } from "@features/map/components/MapView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReservationAvailability } from "@features/reservations/services/reservations.service";
```

## Shadcn and UI primitives

`components.json` already points generators at FDA-safe destinations:

- `ui` → `@shared/components/ui`
- `components` → `@shared/components`
- `utils` → `@shared/lib/utils`
- `hooks` → `@shared/hooks`

Generate into shared UI unless the component is domain-specific.

## PR self-check

Before asking for review:

- [ ] No new root-level legacy folders or aliases were introduced
- [ ] `app/` imports features only through each feature barrel
- [ ] No feature imports from another feature
- [ ] Shared code does not import feature code
- [ ] Server Actions only dispatch; business logic stays in NestJS
- [ ] Leaflet, Motion, Lucide, RHF, and Zod usage follow project standards
- [ ] `pnpm --filter @rental/web lint`
- [ ] `pnpm --filter @rental/web typecheck`
- [ ] `pnpm --filter @rental/web test`

If you break one of these rules, STOP and fix the architecture first. FDA is here to keep the frontend clean, not to create polite chaos.
