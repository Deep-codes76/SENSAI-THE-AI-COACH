import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.js"],
    testTimeout: 180_000,
    hookTimeout: 180_000,
    // Live services rate-limit; run these one at a time.
    fileParallelism: false,
  },
  resolve: { alias: { "@": path.resolve(process.cwd()) } },
});
