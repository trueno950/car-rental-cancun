# AGENTS.md — rental-car-cancun

## 1. Project Context

- Monorepo managed with `pnpm`.
- `apps/web` is Next.js 15 + React 19 and already follows Feature-Driven Architecture (FDA).
- `apps/api` is NestJS 11 and owns backend business logic.
- `packages/validations` holds shared contracts; do not fork Zod schemas inline when a shared contract already exists.
- `@base-ui/react` is the approved headless UI primitive library. Use it in `src/shared/components/**` for base components (button, input, popover, etc.). Do not swap it for Radix UI or other headless libraries.
- `tools/verify-boundary-violation.mjs` is an intentional guardrail fixture runner. Do not “fix” those failing fixture imports.

## 2. FDA Layer Rules

### Web layer map

| Layer | Purpose | Allowed imports | Keep out |
| --- | --- | --- | --- |
| `apps/web/app/**` | Route composition, layouts, server-first entrypoints | `app/**`, `@features/<name>`, `@shared/*`, `@core/*` | Feature internals, business rules, raw infra logic |
| `apps/web/src/features/<feature>/**` | Feature UI, hooks, services, feature-local helpers | Same feature internals, `@shared/*`, `@core/*` | Other feature internals, cross-feature reach-through |
| `apps/web/src/shared/**` | Reusable UI, shared hooks, pure presentation helpers | `src/shared/**`, `@core/*` | Feature/domain behavior |
| `apps/web/src/core/**` | Platform/infrastructure concerns like auth, i18n, HTTP | Own internals and external packages | `app/**`, `src/features/**`, `src/shared/**` |

### Non-negotiable alias and placement rules

- Frontend aliases: `@/*`, `@/app/*`, `@features/*`, `@shared/*`, `@core/*`.
- Do NOT reintroduce legacy shapes such as `src/components`, `src/lib`, root `components/`, or `src/actions/`.
- `app/**` imports features only through each feature public API, never through `components/*` or `services/*` deep paths.
- Shared code never imports feature code.
- `lucide-react` is the icon library.
- Leaflet stays inside `apps/web/src/features/map/components/**`.
- Framer Motion stays in leaf client components, not route entrypoints.

## 3. NestJS / Next.js Boundary

- Server Actions are transport only. They may validate input, read session context, call backend-facing services, and normalize UI-facing responses.
- Business logic belongs in NestJS modules/controllers/services, not in Next.js Server Actions, route handlers, or client components.
- API access tokens, auth plumbing, and HTTP client setup may live in `apps/web/src/core/**`; domain decisions still belong to `apps/api`.
- If a workflow needs backend behavior, the web app dispatches to NestJS. Do NOT recreate backend rules in the frontend “just because it’s faster”.

## 4. Anti-Pattern Catalog

Treat these as review targets for GGA:

| ID | Severity | What to flag |
| --- | --- | --- |
| `business-logic-in-server-action` | BLOCKING | Calculations, branching, availability rules, pricing rules, or orchestration living in Server Actions or route handlers |
| `domain-entity-in-presentation` | BLOCKING | Domain entities or backend-only shapes leaking directly into presentation components |
| `inline-fetch-in-presentational` | BLOCKING | Presentational components doing inline data fetching instead of receiving data via feature/service boundaries |
| `cross-layer-dynamic-import` | BLOCKING | Dynamic imports used to bypass FDA or package boundaries |
| `useeffect-as-state-machine` | WARNING | `useEffect` coordinating state transitions that should be derived data, event handlers, or explicit reducers |
| `dead-export` | WARNING | Exports with no consumers and no deliberate public API reason |
| `legacy-folder-reintroduction` | BLOCKING | New code added to legacy/non-FDA locations or aliases |
| `cross-feature-reachthrough` | BLOCKING | Importing another feature’s internal files instead of its public API |

## 5. False-Positive Hints

- `apps/web/test-fixtures/**` intentionally contains boundary violations for `tools/verify-boundary-violation.mjs`. Those files are test fixtures, not production regressions.
- `apps/web/app/**` server components composing `@features/*` public APIs are valid and should not be treated as boundary leaks.
- `apps/web/src/features/*/actions/**` is acceptable only when the action forwards to the backend and keeps business logic out.
- `apps/web/src/shared/components/**` importing from `@base-ui/react` is valid — it is the project's approved headless primitive library.
- Feature-local adapters that reshape backend DTOs for UI consumption are valid when they stay inside the owning feature or `core/http` boundary.
- Emergency `--no-verify` bypass is allowed only for real incidents and must be called out explicitly in the PR description.
