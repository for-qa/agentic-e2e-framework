/**
 * Login Validation Test Cases
 *
 * Acceptance Criteria:
 *   AC-AUTH-01: Valid credentials redirect to the dashboard.
 *   AC-AUTH-02: Invalid credentials show an error message without redirecting.
 *   AC-AUTH-03: Empty submission shows field-level validation messages.
 *   AC-AUTH-04: Submitting with only an email shows a password validation error.
 *
 * These tests intentionally do NOT use stored session state — they exercise
 * the login page UI directly to validate the authentication boundary.
 *
 * Required env vars:
 *   ADMIN_USER  — Valid admin email
 *   ADMIN_PASS  — Valid admin password
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Locators ─────────────────────────────────────────────────────────────────

const loginLocators = {
  emailInput: "[data-testid='login-email']",
  credentialInput: "[data-testid='login-password']",
  submitButton: "[data-testid='login-submit']",
  errorBanner: "[data-testid='login-error-banner']",
  emailValidationMsg: "[data-testid='validation-email']",
  credentialValidationMsg: "[data-testid='validation-password']",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function navigateToLogin(page: Page): Promise<void> {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
}

async function submitLoginForm(page: Page, email: string, credential: string): Promise<void> {
  await page.locator(loginLocators.emailInput).fill(email);
  await page.locator(loginLocators.credentialInput).fill(credential);
  await page.locator(loginLocators.submitButton).click();
}

// ─── Environment ──────────────────────────────────────────────────────────────
// Resolved once at module load — keeps test bodies free of conditional logic.
const ENV = {
  adminEmail: process.env["ADMIN_USER"] ?? "",
  adminCredential: process.env["ADMIN_PASS"] ?? "",
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe("Login Validation @auth @smoke", () => {
  // These tests exercise the raw login UI — no stored auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await navigateToLogin(page);
  });

  // ── AC-AUTH-01 ──────────────────────────────────────────────────────────────

  test("AC-AUTH-01: valid credentials redirect to dashboard", async ({ page }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(!ENV.adminEmail || !ENV.adminCredential, "ADMIN_USER / ADMIN_PASS not configured");

    await submitLoginForm(page, ENV.adminEmail, ENV.adminCredential);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  });

  // ── AC-AUTH-02 ──────────────────────────────────────────────────────────────

  test("AC-AUTH-02: invalid credentials show error banner", async ({ page }) => {
    await submitLoginForm(page, "notreal@example.com", "wrongcredential123");

    await expect(page.locator(loginLocators.errorBanner)).toBeVisible({ timeout: 10_000 });
    // Must NOT navigate away from the login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ── AC-AUTH-03 ──────────────────────────────────────────────────────────────

  test("AC-AUTH-03: empty submission shows field validation messages", async ({ page }) => {
    // Click submit without filling anything
    await page.locator(loginLocators.submitButton).click();

    await expect(page.locator(loginLocators.emailValidationMsg)).toBeVisible();
    await expect(page.locator(loginLocators.credentialValidationMsg)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ── AC-AUTH-04 ──────────────────────────────────────────────────────────────

  test("AC-AUTH-04: email only — credential validation message shown", async ({ page }) => {
    await page.locator(loginLocators.emailInput).fill("valid@example.com");
    await page.locator(loginLocators.submitButton).click();

    await expect(page.locator(loginLocators.credentialValidationMsg)).toBeVisible();
    await expect(page.locator(loginLocators.emailValidationMsg)).toBeHidden();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
