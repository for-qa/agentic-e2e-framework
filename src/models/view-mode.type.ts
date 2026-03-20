/**
 * View Mode Type — Models Layer
 *
 * Shared type definitions for table/list view modes used across
 * all page objects and test helpers.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

/** Controls whether the records table groups rows by a parent entity. */
export enum ViewMode {
  Grouped = "Grouped",
  Ungrouped = "Ungrouped",
  Both = "Both",
}

/** Row shape when the table is in Grouped view. */
export interface GroupedSummaryRow {
  page: number | string;
  checkNumber: string;
  recordCount: number;
  credits: number;
  incomplete: number;
}

/** Row shape when the table is in Ungrouped (flat) view. */
export interface UngroupedSummaryRow {
  page: number | string;
  checkNumber: string;
  referenceId: string;
  splitCount: number;
}

/** Complete view-mode summary for a records table page. */
export interface RecordSummary {
  grouped?: GroupedSummaryRow[];
  ungrouped?: {
    totalRecords: number;
    recordCount: number;
    extraAccordions: number;
    numberOfChecks: number;
    records: (UngroupedSummaryRow | object)[];
  };
}
