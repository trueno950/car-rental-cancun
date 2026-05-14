import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

/**
 * Unit test config — no DB, fast.
 * Includes: src/**\/*.spec.ts
 * Excludes: anything containing .integration.
 *
 * Uses SWC transformer so NestJS decorator metadata (emitDecoratorMetadata)
 * is preserved during test compilation, enabling proper DI resolution.
 */
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { decoratorMetadata: true },
      },
    }),
  ],
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
