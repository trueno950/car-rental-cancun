import { defineConfig } from "vitest/config";

/**
 * Integration test config — requires DATABASE_URL.
 * If DATABASE_URL is not set, setupFiles emits a warning and the suite halts.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.integration.test.ts"],
    environment: "node",
    globals: false,
    setupFiles: ["./test/setup.integration.ts"],
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
