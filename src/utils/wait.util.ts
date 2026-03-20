/**
 * Wait Utilities — Utils Layer
 *
 * Reusable async wait helpers that reduce copy-paste across test helpers.
 * All functions accept a Playwright Page directly (not IPage) for
 * compatibility with raw test fixtures.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { Page } from "@playwright/test";
import { getErrorMessage } from "@src/utils/error.util";

export interface WaitForPageReadyOptions {
  /** Timeout for domcontentloaded (ms). Default: 30 000 */
  domContentLoadedTimeout?: number;
  /** Timeout for networkidle (ms). Default: 10 000 */
  networkIdleTimeout?: number;
  /** Additional stabilisation delay after page is ready (ms). Default: 500 */
  additionalDelay?: number;
}

/**
 * Waits for the page to be fully interactive:
 *  1. DOMContentLoaded
 *  2. networkidle (best-effort — errors are swallowed)
 *  3. optional extra delay
 */
export async function waitForPageReady(
  page: Page,
  options?: WaitForPageReadyOptions
): Promise<void> {
  const {
    domContentLoadedTimeout = 30_000,
    networkIdleTimeout = 10_000,
    additionalDelay = 500,
  } = options ?? {};

  await page.waitForLoadState("domcontentloaded", { timeout: domContentLoadedTimeout });
  await page.waitForLoadState("networkidle", { timeout: networkIdleTimeout }).catch(() => {});
  await page.waitForTimeout(additionalDelay);
}

/**
 * Waits for network activity to settle.
 * Silently ignores timeout — network may never become fully idle.
 */
export async function waitForNetworkIdle(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
}

/**
 * Minimal delay between sequential operations.
 * Prefer structural waits (waitFor, waitForLoadState) over this where possible.
 */
export async function waitWithDelay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for the page to stabilise after a user action.
 * Swallows "page closed" style errors that occur during teardown.
 */
export async function waitForPageStabilization(
  page: Page,
  useNetworkIdle = false,
  additionalDelay = 200
): Promise<void> {
  if (useNetworkIdle) {
    await waitForNetworkIdle(page);
  }

  try {
    await page.waitForTimeout(useNetworkIdle ? 2_000 : additionalDelay);
  } catch (error) {
    const msg = getErrorMessage(error);
    const isPageClosed =
      msg.includes("closed") || msg.includes("Target page") || msg.includes("browser context");
    if (!isPageClosed) throw error;
  }
}
