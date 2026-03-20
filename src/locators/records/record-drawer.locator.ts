/**
 * Record Drawer Locators — Locators Layer
 *
 * All selectors for the record detail drawer (side panel that opens
 * when a row is clicked). Covers both view-mode and edit-mode states.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

export const recordDrawerLocators = {
  // ── Drawer container ──────────────────────────────────────────────────────
  drawerRoot: "[data-testid='detail-drawer']",
  drawerHeader: "[data-testid='drawer-header']",
  drawerTitle: "[data-testid='drawer-title']",
  skeletonLoader: "[data-testid='drawer-skeleton']",

  // ── View-mode actions ─────────────────────────────────────────────────────
  editButton: "[data-testid='edit-record-btn']",
  closeButton: "[data-testid='close-drawer-btn']",

  // ── Edit-mode actions ─────────────────────────────────────────────────────
  saveButton: "[data-testid='save-record-btn']",
  cancelButton: "[data-testid='cancel-edit-btn']",

  // ── Editable fields ───────────────────────────────────────────────────────
  totalAmountInput: "[data-testid='field-total-amount']",
  statusSelect: "[data-testid='field-status']",
  referenceIdInput: "[data-testid='field-reference-id']",
  assignedDateInput: "[data-testid='field-assigned-date']",
  notesTextarea: "[data-testid='field-notes']",

  // ── View-mode display values ──────────────────────────────────────────────
  totalAmountDisplay: "[data-testid='display-total-amount']",
  statusDisplay: "[data-testid='display-status']",
  referenceIdDisplay: "[data-testid='display-reference-id']",
  assignedDateDisplay: "[data-testid='display-assigned-date']",

  // ── Feedback elements ─────────────────────────────────────────────────────
  successToast: "[data-testid='toast-success']",
  errorToast: "[data-testid='toast-error']",
  validationMessage: "[data-testid='field-validation-msg']",
} as const;

export type RecordDrawerLocatorKey = keyof typeof recordDrawerLocators;
