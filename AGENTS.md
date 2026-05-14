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

| Layer                                | Purpose                                                | Allowed imports                                      | Keep out                                             |
| ------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| `apps/web/app/**`                    | Route composition, layouts, server-first entrypoints   | `app/**`, `@features/<name>`, `@shared/*`, `@core/*` | Feature internals, business rules, raw infra logic   |
| `apps/web/src/features/<feature>/**` | Feature UI, hooks, services, feature-local helpers     | Same feature internals, `@shared/*`, `@core/*`       | Other feature internals, cross-feature reach-through |
| `apps/web/src/shared/**`             | Reusable UI, shared hooks, pure presentation helpers   | `src/shared/**`, `@core/*`                           | Feature/domain behavior                              |
| `apps/web/src/core/**`               | Platform/infrastructure concerns like auth, i18n, HTTP | Own internals and external packages                  | `app/**`, `src/features/**`, `src/shared/**`         |

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

| ID                                | Severity | What to flag                                                                                                            |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `business-logic-in-server-action` | BLOCKING | Calculations, branching, availability rules, pricing rules, or orchestration living in Server Actions or route handlers |
| `domain-entity-in-presentation`   | BLOCKING | Domain entities or backend-only shapes leaking directly into presentation components                                    |
| `inline-fetch-in-presentational`  | BLOCKING | Presentational components doing inline data fetching instead of receiving data via feature/service boundaries           |
| `cross-layer-dynamic-import`      | BLOCKING | Dynamic imports used to bypass FDA or package boundaries                                                                |
| `useeffect-as-state-machine`      | WARNING  | `useEffect` coordinating state transitions that should be derived data, event handlers, or explicit reducers            |
| `dead-export`                     | WARNING  | Exports with no consumers and no deliberate public API reason                                                           |
| `legacy-folder-reintroduction`    | BLOCKING | New code added to legacy/non-FDA locations or aliases                                                                   |
| `cross-feature-reachthrough`      | BLOCKING | Importing another feature’s internal files instead of its public API                                                    |

## 5. False-Positive Hints

- `apps/web/test-fixtures/**` intentionally contains boundary violations for `tools/verify-boundary-violation.mjs`. Those files are test fixtures, not production regressions.
- `apps/web/app/**` server components composing `@features/*` public APIs are valid and should not be treated as boundary leaks.
- `apps/web/src/features/*/actions/**` is acceptable only when the action forwards to the backend and keeps business logic out.
- `apps/web/src/shared/components/**` importing from `@base-ui/react` is valid — it is the project's approved headless primitive library.
- Feature-local adapters that reshape backend DTOs for UI consumption are valid when they stay inside the owning feature or `core/http` boundary.
- Emergency `--no-verify` bypass is allowed only for real incidents and must be called out explicitly in the PR description.

## NestJS Backend Architecture

### Layer Rules

| Layer      | File pattern      | Allowed imports                                       | Forbidden                                                 |
| ---------- | ----------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Controller | `*.controller.ts` | Service of same domain, NestJS decorators             | `DatabaseService`, `drizzle-orm`, other domains' services |
| Service    | `*.service.ts`    | Repository of same domain, `HttpException` subclasses | `DatabaseService`, `drizzle-orm`, DB schema               |
| Repository | `*.repository.ts` | `DatabaseService`, `drizzle-orm`, DB schema           | Services, controllers                                     |
| Module     | `*.module.ts`     | All of same domain                                    | Cross-domain internals                                    |

### Domain Structure

Every domain lives under `src/<domain>/` with exactly these 4 files:

- `<domain>.module.ts` — NestJS module wiring
- `<domain>.controller.ts` — HTTP layer, delegates to service only
- `<domain>.service.ts` — Business logic, throws `HttpException` subclasses
- `<domain>.repository.ts` — All Drizzle queries + money field mapping

Exception: `auth/` and `database/` are infrastructure modules, not domain modules. They follow their own patterns and are exempt from this rule.

### Response Envelope

All endpoints return `{ data: T }` (via global `ResponseEnvelopeInterceptor`).
All errors return `{ error: { code: string, message: string, details?: unknown } }` (via global `AllExceptionsFilter`).
Controllers return raw values — never construct envelopes manually.

### Validation

Use `ZodValidationPipe` explicitly per endpoint:

```typescript
@Post()
create(@Body(new ZodValidationPipe(CreateVehicleSchema)) dto: CreateVehicleDto) {}
```

Schemas live ONLY in `packages/validations`. Never define Zod schemas inline in service or controller files.

### Error Handling

Services throw NestJS `HttpException` subclasses only:

- `NotFoundException` — resource not found
- `BadRequestException` — invalid input (business rule)
- `ConflictException` — duplicate / state conflict
- `UnauthorizedException` — auth required
- `ForbiddenException` — authenticated but not allowed

Never: `throw new Error(...)`, never return `{ error: ... }` from a service.

### Logging

One `Logger` per class: `private readonly logger = new Logger(ClassName.name)`.

- `logger.log()` — normal flow
- `logger.warn()` — recoverable issues
- `logger.error(message, stack)` — exceptions
  Never use `console.*`. Never log passwords, tokens, or PII.

### Money Fields

DB stores integer cents (`dailyRateCents: integer`).
API exposes decimal (`dailyRate: number`).
Conversion happens ONLY in the Repository layer via `toDomain()` / `toDb()` methods.
Use `Math.round(dailyRate * 100)` when writing to DB.

### Enum Convention

Source of truth chain (within `apps/api`):

1. `pgEnum` in Drizzle schema — DB source of truth
2. `z.enum(pgEnum.enumValues)` in the same package — Zod source of truth
3. `z.infer<typeof ZodEnum>` — TypeScript type

For enums shared across monorepo packages (`apps/api` ↔ `packages/validations`):

- `packages/validations` cannot import from `apps/api` (dependency cycle)
- Define an `as const` object with the values in `packages/validations`
- Define `z.enum([...values])` in `packages/validations` using those values
- Define `pgEnum(...)` in `apps/api/src/database/schema/` using the same values
- The DB migration is the authoritative source — if values diverge, the migration wins
- Mirror schema in `apps/web/src/core/auth/db/` uses `varchar` for cross-package enum columns

Never use the `enum` keyword. Non-DB enums use `as const` objects.

### Test Structure

- `*.spec.ts` — unit tests, no DB, run with `pnpm test`
- `*.integration.test.ts` — require real DB, run with `pnpm test:integration`
- Co-locate test files next to the file they test

### Anti-Pattern Catalog

GGA flags these patterns. Each tag is searchable:

| Tag                            | Pattern                                                          | Why forbidden                                      |
| ------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| `db-in-controller`             | `DatabaseService` imported in `*.controller.ts`                  | Controllers must go through service → repository   |
| `drizzle-in-controller`        | `drizzle-orm` imported in `*.controller.ts`                      | Same as above                                      |
| `business-logic-in-controller` | Complex logic beyond a single service call in controller         | Controllers are HTTP adapters only                 |
| `console-log-in-backend`       | `console.log/warn/error` anywhere in `apps/api/`                 | Use NestJS `Logger`                                |
| `raw-error-thrown`             | `throw new Error(` in controllers or services                    | Use typed `HttpException` subclasses               |
| `cross-domain-import`          | Service from domain A imported in controller/service of domain B | Domains must be decoupled                          |
| `inline-zod-in-service`        | Zod schema defined inside `*.service.ts` or `*.controller.ts`    | Schemas live in `packages/validations` only        |
| `plain-typescript-enum`        | `enum` keyword used anywhere in `apps/api/`                      | Use `z.enum` or `as const` objects                 |
| `cents-in-controller`          | `*Cents` field exposed or manipulated outside `*.repository.ts`  | Cents/decimal mapping belongs in repository only   |
| `missing-response-envelope`    | Controller manually wrapping `{ data: ... }`                     | Envelope is added by `ResponseEnvelopeInterceptor` |
