import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest configuration — unit tests only.
 * E2E tests are handled separately by Playwright.
 *
 * Run:  npm run test:unit
 * Cover: npm run test:unit:coverage
 */
export default defineConfig({
  test: {
    name: "unit",
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globals: false, // explicit imports only — cleaner and more portable
    coverage: {
      provider: "v8",
      include: ["src/utils/**/*.ts"],
      exclude: ["src/utils/**/*.test.ts"],
      reporter: ["text", "html", "json"],
      outputDir: "coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@tests": path.resolve(__dirname, "tests"),
    },
  },
});
