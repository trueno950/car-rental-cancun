# Railway multi-service setup

## Services

| Service | Root directory | Runtime responsibility |
|---------|----------------|------------------------|
| `web` | `/apps/web` | Next.js app with Auth.js + next-intl |
| `api` | `/apps/api` | NestJS API + Drizzle migrations |

## Environments

| Environment | Services | Notes |
|-------------|----------|-------|
| `staging` | `web`, `api`, PostgreSQL | Auto-deploy target after merge to `main` |
| `production` | `web`, `api`, PostgreSQL | Promote manually after staging verification |

## Verified platform constraint

Current Railway monorepo support lets each service point to its own **Root Directory**, but the repo-level `railway.json` is still service-scoped config-as-code, not a true multi-service declaration file.

That means the required `web`/`api` split must be completed in Railway by creating two services and setting these root directories in the dashboard or CLI:

- `web` → `/apps/web`
- `api` → `/apps/api`

## Required variables

### Web service

- `DATABASE_URL` (same PostgreSQL instance used for Auth.js tables)
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

### API service

- `DATABASE_URL`
- `NEXTAUTH_SECRET`

## Deploy notes

- Keep `NEXTAUTH_SECRET` identical between `web` and `api` until the API bearer secret is intentionally split out.
- Run `pnpm --filter @rental/api run db:migrate` as the API pre-deploy command.
- Do **not** attach browser traffic to `api`; only `web` should be public by default.
