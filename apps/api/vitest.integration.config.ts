import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

/**
 * Integration test config — requires DATABASE_URL.
 * If DATABASE_URL is not set, setupFiles emits a warning and the suite halts.
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
