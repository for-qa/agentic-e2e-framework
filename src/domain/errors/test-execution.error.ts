/**
 * Domain-Specific Error Types — Domain Layer
 *
 * Typed, context-rich error classes for every failure scenario in the
 * test framework. Using typed errors instead of plain Error objects
 * enables precise catch blocks, structured logging, and retry logic.
 *
 * Hierarchy:
 *   TestExecutionError (abstract base)
 *     ├── NavigationError
 *     ├── ElementInteractionError
 *     ├── LoginError
 *     ├── MissingTestDataError
 *     ├── TestValidationError
 *     ├── TestTimeoutError
 *     ├── ConfigurationError
 *     ├── StorageStateError
 *     └── PageClosedError
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

// ─── Abstract Base ────────────────────────────────────────────────────────────

export abstract class TestExecutionError extends Error {
  abstract readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;

    // Preserves proper stack trace in V8 engines.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** Structured representation useful for logging and CI reporters. */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

// ─── Concrete Error Types ─────────────────────────────────────────────────────

/** Thrown when page navigation or routing fails. */
export class NavigationError extends TestExecutionError {
  readonly code = "NAVIGATION_ERROR";
}

/** Thrown when a UI element interaction (click, fill, etc.) fails. */
export class ElementInteractionError extends TestExecutionError {
  readonly code = "ELEMENT_INTERACTION_ERROR";
}

/** Thrown when authentication / login flow fails. */
export class LoginError extends TestExecutionError {
  readonly code = "LOGIN_FAILED";
}

/** Thrown when required test data is missing from fixtures or environment. */
export class MissingTestDataError extends TestExecutionError {
  readonly code = "MISSING_TEST_DATA";
}

/** Thrown when an assertion in a test step fails the expected value check. */
export class TestValidationError extends TestExecutionError {
  readonly code = "TEST_VALIDATION_FAILED";
}

/** Thrown when a test step exceeds its configured timeout. */
export class TestTimeoutError extends TestExecutionError {
  readonly code = "TEST_TIMEOUT";
}

/** Thrown when a required environment variable or config key is absent. */
export class ConfigurationError extends TestExecutionError {
  readonly code = "CONFIGURATION_ERROR";
}

/** Thrown when session storage state save/load/clear fails. */
export class StorageStateError extends TestExecutionError {
  readonly code = "STORAGE_STATE_ERROR";
}

/** Thrown when an operation is attempted on an already-closed page/context. */
export class PageClosedError extends TestExecutionError {
  readonly code = "PAGE_CLOSED";
}
