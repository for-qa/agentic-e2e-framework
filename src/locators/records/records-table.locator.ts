/**
 * Records Table Locators — Locators Layer
 *
 * All selectors for the account records list table and its controls.
 * Using data-testid attributes keeps selectors resilient to CSS refactors.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

export const recordsTableLocators = {
  // ── Table container ──────────────────────────────────────────────────────
  tableRoot: "[data-testid='records-table']",
  tableBody: "[data-testid='records-table-body']",
  tableRow: "[data-testid='records-table-row']",

  // ── Toolbar controls ─────────────────────────────────────────────────────
  groupedViewToggle: "[data-testid='view-toggle-grouped']",
  flatViewToggle: "[data-testid='view-toggle-flat']",
  searchInput: "[data-testid='records-search-input']",
  filterButton: "[data-testid='records-filter-btn']",

  // ── Status chips (used to find rows by status) ───────────────────────────
  statusChip: (status: string) => `[data-testid='status-chip'][data-status='${status}']`,

  // ── Pagination ────────────────────────────────────────────────────────────
  nextPageButton: "[data-testid='pagination-next']",
  prevPageButton: "[data-testid='pagination-prev']",
  pageIndicator: "[data-testid='pagination-indicator']",

  // ── Loading states ────────────────────────────────────────────────────────
  skeletonLoader: "[data-testid='table-skeleton']",
  emptyState: "[data-testid='table-empty-state']",
} as const;

export type RecordsTableLocatorKey = keyof typeof recordsTableLocators;
