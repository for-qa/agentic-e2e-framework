/**
 * Record Drawer Page Object — Pages Layer
 *
 * Encapsulates all interactions with the record detail drawer.
 * Handles both READ (view) mode and EDIT mode state transitions.
 *
 * Responsibilities:
 *  - Waiting for the drawer to be fully loaded.
 *  - Entering and exiting edit mode.
 *  - Reading and writing individual field values.
 *  - Saving / cancelling changes.
 *  - Closing the drawer.
 *
 * Pattern: Page Object Model (POM)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { IPage, ILocator } from "@src/domain/interfaces/page.interface";
import { recordDrawerLocators } from "@src/locators/records/record-drawer.locator";

// ─── Field value snapshot (read from the form in view/edit mode) ──────────────

export interface RecordFieldSnapshot {
  totalAmount: string;
  status: string;
  referenceId: string;
  assignedDate: string;
}

// ─── Page Object ──────────────────────────────────────────────────────────────

export class RecordDrawerPage {
  private readonly drawer: ILocator;

  constructor(private readonly page: IPage) {
    this.drawer = page.locator(recordDrawerLocators.drawerRoot);
  }

  // ── Readiness ─────────────────────────────────────────────────────────────

  /** Waits for the drawer to appear and its skeleton to dismiss. */
  async waitForDrawerReady(timeout = 30_000): Promise<void> {
    await this.drawer.waitFor({ state: "visible", timeout });
    await this.page
      .locator(recordDrawerLocators.skeletonLoader)
      .waitFor({ state: "detached", timeout: 10_000 })
      .catch(() => {
        /* skeleton might not render at all */
      });
  }

  /** Returns true if the drawer is currently visible. */
  async isOpen(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  // ── Mode transitions ──────────────────────────────────────────────────────

  /** Clicks "Edit Record" and waits for the Save button to appear. */
  async enterEditMode(timeout = 15_000): Promise<void> {
    await this.page.locator(recordDrawerLocators.editButton).click();
    await this.page.locator(recordDrawerLocators.saveButton).waitFor({ state: "visible", timeout });
  }

  /** Clicks Save and waits for the drawer to return to view mode. */
  async saveChanges(timeout = 15_000): Promise<void> {
    await this.page.locator(recordDrawerLocators.saveButton).click();
    await this.page.locator(recordDrawerLocators.saveButton).waitFor({ state: "hidden", timeout });
    await this.page.locator(recordDrawerLocators.editButton).waitFor({ state: "visible", timeout });
  }

  /** Clicks Cancel and waits for the drawer to return to view mode. */
  async cancelEdit(timeout = 10_000): Promise<void> {
    await this.page.locator(recordDrawerLocators.cancelButton).click();
    await this.page.locator(recordDrawerLocators.editButton).waitFor({ state: "visible", timeout });
  }

  // ── Field reads ───────────────────────────────────────────────────────────

  async getTotalAmountDisplay(): Promise<string> {
    return (await this.page.locator(recordDrawerLocators.totalAmountDisplay).textContent()) ?? "";
  }

  async getStatusDisplay(): Promise<string> {
    return (await this.page.locator(recordDrawerLocators.statusDisplay).textContent()) ?? "";
  }

  async getReferenceIdDisplay(): Promise<string> {
    return (await this.page.locator(recordDrawerLocators.referenceIdDisplay).textContent()) ?? "";
  }

  async getAssignedDateDisplay(): Promise<string> {
    return (await this.page.locator(recordDrawerLocators.assignedDateDisplay).textContent()) ?? "";
  }

  /** Reads all display-mode field values into a snapshot object. */
  async captureViewSnapshot(): Promise<RecordFieldSnapshot> {
    return {
      totalAmount: await this.getTotalAmountDisplay(),
      status: await this.getStatusDisplay(),
      referenceId: await this.getReferenceIdDisplay(),
      assignedDate: await this.getAssignedDateDisplay(),
    };
  }

  // ── Field writes (edit mode only) ─────────────────────────────────────────

  async setTotalAmount(value: string): Promise<void> {
    const input = this.page.locator(recordDrawerLocators.totalAmountInput);
    await input.fill(value);
  }

  async setReferenceId(value: string): Promise<void> {
    const input = this.page.locator(recordDrawerLocators.referenceIdInput);
    await input.fill(value);
  }

  async setAssignedDate(value: string): Promise<void> {
    const input = this.page.locator(recordDrawerLocators.assignedDateInput);
    await input.fill(value);
  }

  /** Applies a full snapshot of values to all editable fields. */
  async applySnapshot(snapshot: RecordFieldSnapshot): Promise<void> {
    await this.setTotalAmount(snapshot.totalAmount);
    await this.setReferenceId(snapshot.referenceId);
    await this.setAssignedDate(snapshot.assignedDate);
  }

  // ── Close ─────────────────────────────────────────────────────────────────

  /** Closes the drawer via the close button, falling back to Escape. */
  async close(): Promise<void> {
    const isVisible = await this.page
      .locator(recordDrawerLocators.closeButton)
      .isVisible()
      .catch(() => false);

    if (isVisible) {
      await this.page.locator(recordDrawerLocators.closeButton).click();
    } else {
      await this.page.keyboard.press("Escape");
    }

    await this.drawer.waitFor({ state: "hidden", timeout: 10_000 });
  }
}
