import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Live-service tests have their own config and are run explicitly with
    // `npm run test:integration`; `npm test` stays hermetic and offline.
    exclude: ["tests/integration/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["app/lib/**", "lib/ai.js", "lib/pdf.js"],
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(process.cwd()) },
  },
});
