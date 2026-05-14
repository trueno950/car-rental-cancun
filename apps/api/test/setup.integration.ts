/**
 * Integration test bootstrap.
 *
 * - Verifies DATABASE_URL is set before any test runs.
 * - If missing: writes to stderr AND throws — the suite halts immediately
 *   so devs are not misled by a silent green run on a workstation without a DB.
 * - CI must set DATABASE_URL explicitly; local devs use `pnpm test:integration`
 *   after starting the docker postgres.
 *
 * Why throw vs skip: a silent skip turned out to be too easy to ignore in CI.
 * A failing setup forces the env to be provisioned correctly.
 */
import { beforeAll } from "vitest";

beforeAll(() => {
  if (!process.env.DATABASE_URL) {
    const message =
      "Integration tests require DATABASE_URL to be set. Run with a real database or skip with pnpm test (unit only).";
    process.stderr.write(`\n[setup.integration] ${message}\n`);
    throw new Error(message);
  }
});
