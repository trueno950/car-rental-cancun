# Auth.js v5 + Drizzle adapter handoff note

## Verified constraint

Auth.js v5 with the Drizzle adapter supports PostgreSQL-backed auth tables, but its default adapter-backed session flow is cookie/database-session oriented, not a raw `Authorization: Bearer` token contract that Nest can validate with `passport-jwt` out of the box.

## Implication for this slice

- NestJS can ship a JWT guard foundation now.
- The future web slice must decide how to mint the API bearer token.
- Reusing the browser session cookie directly in the API would mix concerns and break the clean boundary between `apps/web` and `apps/api`.

## Recommended bridge

Use Auth.js as the identity/session authority in `apps/web`, then expose a dedicated HS256 bearer token for API calls that carries `sub`, `email`, and `name` and is signed with `NEXTAUTH_SECRET` until a separate API secret is introduced intentionally.
