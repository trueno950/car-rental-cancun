import { defineConfig } from "vitest/config";

/**
 * Unit test config — no DB, fast.
 * Includes: src/**\/*.spec.ts
 * Excludes: anything containing .integration.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    exclude: [
      "src/**/*.integration.test.ts",
      "**/node_modules/**",
      "**/dist/**",
    ],
    environment: "node",
    globals: false,
  },
});
