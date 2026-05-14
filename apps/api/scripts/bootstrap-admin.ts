/**
 * Bootstrap Admin Script
 * ─────────────────────
 * Promotes an existing user to the "admin" role via a direct DB update.
 * Run ONCE per environment to create the first admin operator.
 *
 * Usage:
 *   pnpm --filter api bootstrap:admin -- <email>
 *
 * Exit codes:
 *   0 — success
 *   1 — user not found
 *   2 — missing email argument
 *
 * RUNBOOK NOTES
 * ─────────────
 * 1. Stale JWT window: after promoting a user, their old token (minted before
 *    promotion) still carries the old role. The stale window equals the token
 *    TTL (~1 hour for NextAuth sessions). The user must sign out and sign back
 *    in to receive a new token with role: "admin".
 *
 * 2. Phase B tightening: once all in-flight tokens have expired post-deploy,
 *    update ApiJwtClaimsSchema.role from .optional() to .required() and remove
 *    the `?? "customer"` fallback in JwtStrategy.validate().
 *
 * 3. Emergency demotion: if an admin account is compromised, rotate
 *    NEXTAUTH_SECRET immediately to invalidate all active sessions. Then use
 *    this script (or a direct DB UPDATE) to set a replacement admin.
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { parseDatabaseEnv } from "../src/config/env";
import * as schema from "../src/database/schema";
import { usersTable } from "../src/database/schema/users";

async function main() {
  const email = process.argv[2];
  if (!email) {
    process.stderr.write(
      "Usage: pnpm --filter api bootstrap:admin -- <email>\n",
    );
    process.exit(2);
  }

  const env = parseDatabaseEnv(process.env);
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    const [updated] = await db
      .update(usersTable)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(usersTable.email, email))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
      });

    if (!updated) {
      process.stderr.write(`[bootstrap] user not found: ${email}\n`);
      process.exit(1);
    }

    process.stdout.write(
      `[bootstrap] promoted ${updated.email} (${updated.id}) to ${updated.role}\n`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  process.stderr.write(`[bootstrap] failed: ${(err as Error).message}\n`);
  process.exit(1);
});
