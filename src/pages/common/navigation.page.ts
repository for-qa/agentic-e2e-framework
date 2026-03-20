/**
 * Navigation Page Object — Pages Layer
 *
 * Encapsulates all interactions with the application's left sidebar
 * and top header navigation elements.
 *
 * How it works:
 *  - Depends only on IPage (domain interface), never on Playwright directly.
 *  - Locators are imported from the locators layer and resolved via the
 *    page's locator() method — Page Objects own no raw selectors.
 *
 * Pattern: Page Object Model (POM)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { IPage } from "@src/domain/interfaces/page.interface";
import { navigationLocators } from "@src/locators/common/navigation.locator";

export class NavigationPage {
  constructor(private readonly page: IPage) {}

  // ── Navigation ────────────────────────────────────────────────────────────

  async goToRecords(): Promise<void> {
    await this.page.locator(navigationLocators.records).click();
    await this.page.waitForLoadState("networkidle");
  }

  async goToDashboard(): Promise<void> {
    await this.page.locator(navigationLocators.dashboard).click();
    await this.page.waitForLoadState("networkidle");
  }

  async goToReports(): Promise<void> {
    await this.page.locator(navigationLocators.reports).click();
    await this.page.waitForLoadState("networkidle");
  }

  // ── Visibility checks ─────────────────────────────────────────────────────

  async isNavItemVisible(
    itemKey: keyof typeof navigationLocators,
    timeout = 5_000
  ): Promise<boolean> {
    try {
      await this.page
        .locator(navigationLocators[itemKey] as string)
        .waitFor({ state: "visible", timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getVisibleNavItems(): Promise<(keyof typeof navigationLocators)[]> {
    const keys = Object.keys(navigationLocators) as (keyof typeof navigationLocators)[];
    const results = await Promise.all(
      keys.map(async (key) => ({ key, visible: await this.isNavItemVisible(key) }))
    );
    return results.filter((r) => r.visible).map((r) => r.key);
  }

  // ── User actions ──────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this.page.locator(navigationLocators.userAvatar).click();
    await this.page.locator(navigationLocators.logoutButton).waitFor({ state: "visible" });
    await this.page.locator(navigationLocators.logoutButton).click();
  }
}
