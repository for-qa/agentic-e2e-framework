/**
 * Records Table Page Object — Pages Layer
 *
 * Encapsulates all interactions with the account records list table.
 * Supports both Grouped and Flat (ungrouped) view modes.
 *
 * Responsibilities:
 *  - Switching view modes.
 *  - Waiting for the table to become interactive.
 *  - Finding rows by status chip.
 *  - Clicking rows to open the detail drawer.
 *
 * Pattern: Page Object Model (POM)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { IPage, ILocator } from "@src/domain/interfaces/page.interface";
import { recordsTableLocators } from "@src/locators/records/records-table.locator";

export class RecordsTablePage {
  constructor(private readonly page: IPage) {}

  // ── Table readiness ───────────────────────────────────────────────────────

  /** Waits until the skeleton loader disappears and the table body is visible. */
  async waitForTable(timeout = 30_000): Promise<void> {
    // Wait for skeleton to detach first
    await this.page
      .locator(recordsTableLocators.skeletonLoader)
      .waitFor({ state: "detached", timeout })
      .catch(() => {
        // skeleton might already be gone — that's fine
      });
    await this.page.locator(recordsTableLocators.tableBody).waitFor({ state: "visible", timeout });
  }

  // ── View mode ─────────────────────────────────────────────────────────────

  async switchToFlatView(): Promise<void> {
    const toggle = this.page.locator(recordsTableLocators.flatViewToggle);
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    await this.waitForTable();
  }

  async switchToGroupedView(): Promise<void> {
    const toggle = this.page.locator(recordsTableLocators.groupedViewToggle);
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    await this.waitForTable();
  }

  // ── Row interaction ───────────────────────────────────────────────────────

  /** Returns all visible table rows. */
  getRows(): ILocator {
    return this.page.locator(recordsTableLocators.tableRow);
  }

  /**
   * Finds the first row with the given status chip.
   * Throws if no matching row is found within the timeout.
   */
  async findRowWithStatus(status: string, timeout = 15_000): Promise<ILocator> {
    const chip = this.page.locator(recordsTableLocators.statusChip(status));
    await chip.waitFor({ state: "visible", timeout });
    // Walk up to the row ancestor
    const rows = this.page.locator(recordsTableLocators.tableRow);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowChip = row.filter({ has: chip });
      if ((await rowChip.count()) > 0) return row;
    }
    throw new Error(`No table row found with status "${status}"`);
  }

  /** Clicks a row to open its detail drawer. */
  async clickRow(row: ILocator): Promise<void> {
    await row.click();
  }

  // ── Search & filter ───────────────────────────────────────────────────────

  async searchFor(query: string): Promise<void> {
    const input = this.page.locator(recordsTableLocators.searchInput);
    await input.fill(query);
    await input.press("Enter");
    await this.waitForTable();
  }

  async isEmptyState(): Promise<boolean> {
    return await this.page.locator(recordsTableLocators.emptyState).isVisible();
  }

  async getRowCount(): Promise<number> {
    await this.waitForTable();
    return await this.page.locator(recordsTableLocators.tableRow).count();
  }
}
