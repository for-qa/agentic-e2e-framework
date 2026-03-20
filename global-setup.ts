/**
 * Global Setup — Playwright Test Suite
 *
 * Runs ONCE before any test worker starts.
 * Authenticates each configured user and saves their session storage
 * state to disk so test cases can skip the login flow entirely.
 *
 * This pattern:
 *  - Eliminates the ~5-10s login overhead from every test
 *  - Makes tests independent of authentication implementation details
 *  - Allows parallel workers to share the same cached session safely
 *
 * Each user's state is saved to: tests/.cache/<userKey>.json
 *
 * Usage in playwright.config.ts:
 *   globalSetup: "./global-setup.ts"
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import { chromium, type FullConfig } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Configuration ────────────────────────────────────────────────────────────

const CACHE_DIR = path.join(__dirname, "tests", ".cache");
const LOGIN_URL_PATH = "/auth/login";
const POST_LOGIN_URL_PATTERN = /\/dashboard/;

// Selectors for the login form (update to match your application)
const SELECTORS = {
  usernameInput: "[data-testid='login-email']",
  credentialInput: "[data-testid='login-password']",
  submitButton: "[data-testid='login-submit']",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachePath(userKey: string): string {
  return path.join(CACHE_DIR, `${userKey}.json`);
}

function isCacheValid(cachePath: string, maxAgeMinutes = 60): boolean {
  if (!fs.existsSync(cachePath)) return false;
  const stats = fs.statSync(cachePath);
  const ageMs = Date.now() - stats.mtimeMs;
  return ageMs < maxAgeMinutes * 60 * 1_000;
}

function loadUserCredentials(): Array<{ key: string; username: string; password: string }> {
  const users: Array<{ key: string; username: string; password: string }> = [];
  const knownKeys = ["admin", "viewer", "editor"];

  for (const key of knownKeys) {
    const username = process.env[`${key.toUpperCase()}_USER`];
    const password = process.env[`${key.toUpperCase()}_PASS`];
    if (username && password) {
      users.push({ key, username, password });
    }
  }

  if (users.length === 0) {
    console.warn(
      "[global-setup] No user credentials found in environment. " +
        "Ensure ADMIN_USER / ADMIN_PASS (etc.) are set in your .env file."
    );
  }
  return users;
}

// ─── Login Flow ───────────────────────────────────────────────────────────────

async function authenticateUser(
  config: FullConfig,
  userKey: string,
  username: string,
  password: string
): Promise<void> {
  const cachePath = getCachePath(userKey);

  // Re-use a valid cached session — skip login if still fresh
  if (isCacheValid(cachePath)) {
    console.log(`[global-setup] Using cached session for: ${userKey}`);
    return;
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`[global-setup] Authenticating: ${userKey} (${username})`);

    // Navigate to login page
    await page.goto(`${baseURL}${LOGIN_URL_PATH}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    // Fill credentials
    await page.locator(SELECTORS.usernameInput).fill(username);
    await page.locator(SELECTORS.credentialInput).fill(password);
    await page.locator(SELECTORS.submitButton).click();

    // Wait for successful redirect to dashboard
    await page.waitForURL(POST_LOGIN_URL_PATTERN, { timeout: 30_000 });

    // Persist the authenticated session state
    await page.context().storageState({ path: cachePath });
    console.log(`[global-setup] ✅ Session saved for: ${userKey}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[global-setup] ❌ Authentication failed for ${userKey}: ${message}`);
    // Don't throw — let individual tests fail with clearer messages
  } finally {
    await browser.close();
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export default async function globalSetup(config: FullConfig): Promise<void> {
  ensureCacheDir();

  const users = loadUserCredentials();

  // Authenticate all users sequentially to avoid race conditions on shared state
  for (const user of users) {
    await authenticateUser(config, user.key, user.username, user.password);
  }

  console.log(`[global-setup] Bootstrap complete — ${users.length} user(s) ready.`);
}
