/**
 * Account Record Update — Test Suite Configuration
 *
 * As a QA Automation Tester,
 * I want to validate account record update workflows and field-level validations,
 * so that record changes behave correctly for mandatory-only and full-update scenarios.
 *
 * Acceptance Criteria covered by this suite:
 * - Validation errors are shown when all editable fields are cleared
 * - Mandatory field validation messages display correctly
 * - A record can be saved using only mandatory fields
 * - Updated values persist correctly after save and page refresh
 *
 * PORTFOLIO DEMO — Sanitized template.
 * Domain: "Account Records" replaces the real company domain.
 */

import type { TestSuiteConfiguration } from "../../models/test-suite.type";
import { DEFAULT_TIMEOUTS, TestExecutionPriority } from "../../models/test-suite.type";

// ============================================================
// View Mode Constants
// ============================================================

/** Update-record validation tests always run in "flat" (ungrouped) view. */
export const RECORD_UPDATE_VIEW_MODE = "flat" as const;

/** Returns the supported view modes for update-record tests. */
export function getRecordUpdateViewModes(): ["flat"] {
  return ["flat"];
}

// ============================================================
// Suite Configuration
// ============================================================

/**
 * Full test suite configuration for Account Record Update scenarios.
 *
 * Execution Strategy:
 * - Serial mode: tests share page state (drawer open/close cycle).
 * - 4 workers: optimised for a typical CI runner with 4 CPUs.
 * - Performance monitoring: enabled to capture timing regressions.
 */
export const RECORD_UPDATE_SUITE_CONFIG: TestSuiteConfiguration = {
  suiteId: "@records-update",
  suiteName: "Account Record Update Suite",
  suiteDescription:
    "Validates record update workflows including mandatory-field updates and full field updates with persistence checks.",

  defaultTimeout: DEFAULT_TIMEOUTS.HEAVY,
  executionMode: "serial",
  workerCount: 4,
  optimizeExecutionOrder: true,
  enablePerformanceMonitoring: true,

  testCases: [
    {
      id: "records-update-01",
      name: "record-mandatory-fields-update",
      estimatedDuration: 60_000,
      priority: TestExecutionPriority.MEDIUM,
      timeout: DEFAULT_TIMEOUTS.HEAVY,
      tags: ["@shard-1-validation", "@records-update", "@mandatory-fields"],
    },
    {
      id: "records-update-02",
      name: "record-update-all-fields",
      estimatedDuration: 90_000,
      priority: TestExecutionPriority.MEDIUM,
      timeout: DEFAULT_TIMEOUTS.HEAVY,
      tags: ["@shard-1-update", "@records-update", "@full-update", "@persistence"],
    },
  ],
};

/** Alias — used when importing from drawer/validation suites. */
export const RECORD_UPDATE_VALIDATION_SUITE_CONFIG = RECORD_UPDATE_SUITE_CONFIG;
