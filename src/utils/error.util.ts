/**
 * Error Utilities — Utils Layer
 *
 * Centralized helpers for converting unknown catch-block values
 * into strings or Error instances. Eliminates the boilerplate
 * `error instanceof Error ? error.message : String(error)` pattern.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

/**
 * Extracts a human-readable message from any thrown value.
 *
 * @example
 * try { ... } catch (e) {
 *   logger.error(getErrorMessage(e));
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;

  try {
    const json = JSON.stringify(error);
    if (json !== undefined) return json;
  } catch {
    // fall through
  }
  return String(error);
}

/**
 * Guarantees the return value is always an Error instance.
 * Use in catch blocks when you need to rethrow a typed Error.
 */
export function ensureError(error: unknown): Error {
  return error instanceof Error ? error : new Error(getErrorMessage(error));
}
