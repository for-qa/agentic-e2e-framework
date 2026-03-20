/**
 * Smoke Test Suite — Demo App (saucedemo.com)
 *
 * These tests run against the publicly available Sauce Demo application.
 * They demonstrate the framework's core capabilities (login, navigation,
 * page object interactions) against a real, live website — ensuring the
 * CI pipeline produces a green result without requiring private credentials.
 *
 * Sauce Demo is a purpose-built QA practice application with stable,
 * publicly documented test credentials.
 *
 * Tags:
 *   @smoke    — included in the npm run test:smoke shortcut
 *   @shard-1  — runs on CI Shard 1 (login & auth boundary tests)
 *   @shard-2  — runs on CI Shard 2 (navigation & cart tests)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import { test, expect } from "@playwright/test";

// ─── Demo App Constants ───────────────────────────────────────────────────────
// Sauce Demo is a publicly available test application with documented credentials.
// See: https://www.saucedemo.com
const DEMO = {
  url: "https://www.saucedemo.com",
  credentials: {
    // Publicly documented test credentials — listed on the saucedemo.com login page itself.
    // These are NOT sensitive; the site is a purpose-built QA practice application.
    valid: { username: "standard_user", password: "secret_sauce" },
    locked: { username: "locked_out_user", password: "secret_sauce" },
    invalid: { username: "not_a_user", password: "wrong_password" },
  },
} as const;

// ─── Locators ────────────────────────────────────────────────────────────────

const locators = {
  usernameInput: "[data-test='username']",
  passwordInput: "[data-test='password']",
  loginButton: "[data-test='login-button']",
  errorMessage: "[data-test='error']",
  inventoryContainer: ".inventory_container",
  productTitle: ".inventory_item_name",
  cartIcon: ".shopping_cart_link",
  cartBadge: ".shopping_cart_badge",
  addToCartButton: "[data-test='add-to-cart-sauce-labs-backpack']",
  removeButton: "[data-test='remove-sauce-labs-backpack']",
  burgerMenu: "#react-burger-menu-btn",
  logoutLink: "#logout_sidebar_link",
  pageTitle: ".title",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(
  page: import("@playwright/test").Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto(DEMO.url, { waitUntil: "domcontentloaded" });
  await page.locator(locators.usernameInput).fill(username);
  await page.locator(locators.passwordInput).fill(password);
  await page.locator(locators.loginButton).click();
}

// ─── Shard 1: Authentication Boundary Tests ───────────────────────────────────

test.describe("@shard-1 @smoke — Auth Boundary Tests", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("AUTH-01: valid credentials → redirects to inventory page", async ({ page }) => {
    await login(page, DEMO.credentials.valid.username, DEMO.credentials.valid.password);
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator(locators.inventoryContainer)).toBeVisible();
  });

  test("AUTH-02: invalid credentials → shows error message", async ({ page }) => {
    await login(page, DEMO.credentials.invalid.username, DEMO.credentials.invalid.password);
    await expect(page.locator(locators.errorMessage)).toBeVisible();
    await expect(page.locator(locators.errorMessage)).toContainText(
      "Username and password do not match"
    );
    await expect(page).toHaveURL(DEMO.url + "/");
  });

  test("AUTH-03: locked account → shows locked-out error", async ({ page }) => {
    await login(page, DEMO.credentials.locked.username, DEMO.credentials.locked.password);
    await expect(page.locator(locators.errorMessage)).toBeVisible();
    await expect(page.locator(locators.errorMessage)).toContainText(
      "Sorry, this user has been locked out"
    );
  });

  test("AUTH-04: empty submission → shows required field error", async ({ page }) => {
    await page.goto(DEMO.url, { waitUntil: "domcontentloaded" });
    await page.locator(locators.loginButton).click();
    await expect(page.locator(locators.errorMessage)).toBeVisible();
    await expect(page.locator(locators.errorMessage)).toContainText("Username is required");
    await expect(page).toHaveURL(DEMO.url + "/");
  });

  test("AUTH-05: logout → redirects back to login page", async ({ page }) => {
    await login(page, DEMO.credentials.valid.username, DEMO.credentials.valid.password);
    await expect(page).toHaveURL(/inventory/);
    await page.locator(locators.burgerMenu).click();
    await page.locator(locators.logoutLink).click();
    await expect(page).toHaveURL(DEMO.url + "/");
    await expect(page.locator(locators.loginButton)).toBeVisible();
  });
});

// ─── Shard 2: Navigation & Cart Tests ─────────────────────────────────────────

test.describe("@shard-2 @smoke — Navigation & Cart Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-authenticate before each test in this suite
    await login(page, DEMO.credentials.valid.username, DEMO.credentials.valid.password);
    await expect(page).toHaveURL(/inventory/);
  });

  test("NAV-01: inventory page renders product list", async ({ page }) => {
    await expect(page.locator(locators.pageTitle)).toContainText("Products");
    const products = page.locator(locators.productTitle);
    await expect(products).toHaveCount(6); // Sauce Demo always has 6 products
  });

  test("NAV-02: add product to cart → badge updates to 1", async ({ page }) => {
    await page.locator(locators.addToCartButton).click();
    await expect(page.locator(locators.cartBadge)).toHaveText("1");
  });

  test("NAV-03: remove product from cart → badge disappears", async ({ page }) => {
    await page.locator(locators.addToCartButton).click();
    await expect(page.locator(locators.cartBadge)).toHaveText("1");
    await page.locator(locators.removeButton).click();
    await expect(page.locator(locators.cartBadge)).toBeHidden();
  });

  test("NAV-04: cart icon navigates to cart page", async ({ page }) => {
    await page.locator(locators.cartIcon).click();
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator(locators.pageTitle)).toContainText("Your Cart");
  });
});
