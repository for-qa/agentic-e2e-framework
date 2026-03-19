import { defineConfig, devices } from "@playwright/test";
import * as path from "path";

/**
 * Playwright Configuration — Agentic E2E Framework (Portfolio Demo)
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // ── Test Discovery ────────────────────────────────────────────────────────
  testDir: "./tests/e2e",
  testMatch: "**/*.case.ts",

  // ── Execution Settings ────────────────────────────────────────────────────
  fullyParallel: false,     // Serial by default — tests share page/session state
  workers: process.env["CI"] ? 2 : 4,
  retries: process.env["CI"] ? 1 : 0,
  timeout: 120_000,         // 2 min default — heavy suites override per-test

  // ── Reporters ─────────────────────────────────────────────────────────────
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ...(process.env["CI"] ? [["github"] as ["github"]] : []),
  ],

  // ── Global Test Settings ──────────────────────────────────────────────────
  use: {
    baseURL: process.env["BASE_URL"] ?? "https://staging.example-app.com",
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // ── Path Aliases ──────────────────────────────────────────────────────────
  // In production these are resolved via tsconfig paths + tsconfig-paths plugin.
  // Shown here for documentation purposes.

  // ── Browser Projects ──────────────────────────────────────────────────────
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],

  // ── Output Directories ────────────────────────────────────────────────────
  outputDir: "test-results",
  snapshotDir: "screenshots",
});
