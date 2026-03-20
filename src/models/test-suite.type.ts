/**
 * Test Suite Type Definitions
 * Common types, enums, constants, and utilities used across all test suites.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 * No proprietary company data included.
 */

// ============================================================
// Enums
// ============================================================

/**
 * Test execution priority for parallel worker optimization.
 * HIGH = long-running tests (start first to keep workers busy).
 * MEDIUM = average-duration tests.
 * LOW = short tests (fill remaining worker gaps).
 */
export enum TestExecutionPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// ============================================================
// Default Timeout Constants (milliseconds)
// ============================================================

export const DEFAULT_TIMEOUTS = {
  /** Standard test timeout: 2 minutes */
  DEFAULT: 120_000,
  /** Auth / OAuth flow timeout: 3 minutes */
  OAUTH: 180_000,
  /** Multi-user coordination timeout: 4 minutes */
  MULTI_USER: 240_000,
  /** Heavy data-processing test timeout: 10 minutes */
  HEAVY: 600_000,
  /** Very heavy / bulk-processing timeout: 30 minutes */
  VERY_HEAVY: 1_800_000,
} as const;

// ============================================================
// Interfaces
// ============================================================

/**
 * Metadata for a single test case inside a suite.
 * Used by the automated runner to schedule, shard, and prioritize execution.
 */
export interface TestCaseMetadata {
  /** Unique identifier for this test case (e.g., "records-01") */
  id: string;
  /** Human-readable display name shown in the test report */
  name: string;
  /** Expected runtime in ms — used for parallel scheduling optimisation */
  estimatedDuration?: number;
  /** Execution priority (affects parallel worker scheduling) */
  priority?: TestExecutionPriority;
  /** Custom timeout that overrides the suite default */
  timeout?: number;
  /** Tags for shard filtering (e.g., "@shard-1", "@smoke", "@regression") */
  tags?: string[];
  /** Skip this test case at runtime */
  skip?: boolean;
  /** Run only this test case (use sparingly — for debugging) */
  only?: boolean;
  /** Mark as broken/fixme — test is skipped with a descriptive label */
  fixme?: string;
  /** Triple the test timeout (Playwright test.slow() equivalent) */
  slow?: boolean;
  /** Optional roles/user-types this test should execute for */
  roles?: string[];
}

/**
 * Full configuration for a test suite.
 * A suite groups related test cases under a shared execution strategy.
 */
export interface TestSuiteConfiguration {
  /** Suite identifier used in the describe block (e.g., "@records-update") */
  suiteId: string;
  /** Suite display name shown in the report */
  suiteName: string;
  /** Short description of what this suite validates */
  suiteDescription: string;
  /** Default timeout for all tests (can be overridden per test) */
  defaultTimeout: number;
  /** Ordered list of test cases in this suite */
  testCases: TestCaseMetadata[];
  /** Sort tests by priority+duration before execution for optimal parallelism */
  optimizeExecutionOrder?: boolean;
  /** Number of parallel workers available (used for optimisation math) */
  workerCount?: number;
  /**
   * Playwright execution mode:
   * - "serial"   → tests run one-after-another (safe for shared state)
   * - "parallel" → tests run simultaneously on separate workers
   * - "default"  → Playwright decides
   */
  executionMode?: "default" | "serial" | "parallel";
  /** Default roles to test — can be overridden per test case */
  defaultRoles?: string[];
  /** Enable performance monitoring metrics for this suite */
  enablePerformanceMonitoring?: boolean;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Sorts test cases by priority (HIGH → MEDIUM → LOW),
 * then by estimated duration (longest first) within the same priority bucket.
 * This maximises parallel worker utilisation by starting the longest tests earliest.
 */
export function sortTestsByExecutionOrder(testCases: TestCaseMetadata[]): TestCaseMetadata[] {
  const priorityOrder: Record<TestExecutionPriority, number> = {
    [TestExecutionPriority.HIGH]: 0,
    [TestExecutionPriority.MEDIUM]: 1,
    [TestExecutionPriority.LOW]: 2,
  };

  return [...testCases].sort((a, b) => {
    const aPriority = priorityOrder[a.priority ?? TestExecutionPriority.MEDIUM];
    const bPriority = priorityOrder[b.priority ?? TestExecutionPriority.MEDIUM];

    if (aPriority !== bPriority) return aPriority - bPriority;

    // Within the same priority bucket: longest test first
    return (b.estimatedDuration ?? 0) - (a.estimatedDuration ?? 0);
  });
}
