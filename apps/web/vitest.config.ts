import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const appRoot = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": appRoot,
      "@features": `${appRoot}src/features`,
      "@shared": `${appRoot}src/shared`,
      "@core": `${appRoot}src/core`,
    },
  },
});
