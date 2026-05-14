# Runbook

Operational procedures for `rental-car-cancun`.

---

## User Roles

### Bootstrapping the first admin

Every environment starts with all users having role `customer`. Before any
employee or manager can use the back-office, you must promote at least one
user to `admin`.

**Prerequisites**: the user must already have signed in at least once (so their
account exists in the `users` table) and `DATABASE_URL` must be set.

```sh
pnpm --filter api bootstrap:admin -- ops@yourcompany.com
```

Exit codes:

- `0` — user promoted successfully
- `1` — email not found in `users` table (user has not signed in yet)
- `2` — no email argument supplied

After promotion, the user must **sign out and sign back in** to receive a new
JWT that carries `role: "admin"`. The old token (if any) keeps the old role
until its TTL expires.

---

### Stale JWT window after a role change

JWTs are minted by the NextAuth session callback and are valid for the duration
of the session TTL (typically ~1 hour). When a user's role is changed:

1. Their **in-flight JWT still carries the old role** until it expires or the
   user signs out and back in.
2. The API falls back to `"customer"` for any token that has no `role` claim
   (Phase A behaviour — pre-deploy tokens). This default is safe: it will only
   downgrade, never upgrade permissions.

**Operator action**: after promoting a user, ask them to sign out immediately.

---

### Phase B: tightening `ApiJwtClaimsSchema.role` to required

Once all tokens minted before the role-feature deploy have expired (after ~1
hour of token TTL post-deploy), make `role` required in the JWT schema:

1. In `packages/validations/src/auth.schema.ts`, change:

   ```ts
   // Phase A (optional, for backward compat with in-flight tokens)
   role: UserRoleSchema.optional();
   ```

   to:

   ```ts
   // Phase B (required — all tokens now carry role)
   role: UserRoleSchema;
   ```

2. In `apps/api/src/auth/jwt.strategy.ts`, remove the fallback:

   ```ts
   // Remove this line:
   role: parsed.data.role ?? "customer";
   // Replace with:
   role: parsed.data.role;
   ```

3. Deploy. Any token without a `role` claim will now be rejected at the
   gateway with `401 Unauthorized`.

---

### Emergency demotion / NEXTAUTH_SECRET rotation

If an admin account is compromised:

1. Rotate `NEXTAUTH_SECRET` immediately in your deployment environment. This
   invalidates **all active sessions** for all users.
2. Use a direct DB `UPDATE` (or the bootstrap script) to change the
   compromised account's role back to `customer`.
3. Re-promote a trusted user to `admin` via the bootstrap script.
4. Notify affected users to sign in again.
