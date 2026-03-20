/**
 * retry.util.ts
 *
 * Advanced retry utilities for resilient test execution.
 * Provides intelligent retry mechanisms with exponential backoff, fixed delay,
 * and conditional retry — essential for handling transient failures in E2E tests.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

/* eslint-disable no-console */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before the first retry (default: 1000) */
  initialDelay?: number;
  /** Maximum delay cap in ms (default: 10000) */
  maxDelay?: number;
  /** Multiplier applied to delay after each attempt (default: 2) */
  backoffMultiplier?: number;
  /** Error class names that should trigger a retry. Empty = retry all. */
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10_000,
  backoffMultiplier: 2,
  retryableErrors: ["TimeoutError", "NetworkError", "ElementNotFoundError"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isErrorRetryable(error: unknown, retryableErrors: string[]): boolean {
  if (retryableErrors.length === 0) return true;
  const name = error instanceof Error ? error.constructor.name : String(error);
  return retryableErrors.some((retryable) => name.includes(retryable));
}

function assertRetryable(error: unknown, retryableErrors: string[]): void {
  if (!isErrorRetryable(error, retryableErrors)) {
    throw error;
  }
}

function calculateNextDelay(current: number, multiplier: number, max: number): number {
  return Math.min(current * multiplier, max);
}

async function sleepMs(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Retries an async operation with exponential backoff.
 *
 * @example
 * const data = await retryWithBackoff(() => fetchDashboard(page), {
 *   maxRetries: 3,
 *   initialDelay: 500,
 *   retryableErrors: ["TimeoutError"],
 * });
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let delay = config.initialDelay;
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      assertRetryable(error, config.retryableErrors);

      if (attempt === config.maxRetries) break;

      console.warn(
        `[retry] Attempt ${attempt}/${config.maxRetries} failed — retrying in ${delay}ms...`
      );
      await sleepMs(delay);
      delay = calculateNextDelay(delay, config.backoffMultiplier, config.maxDelay);
    }
  }

  console.error(`[retry] Operation failed after ${config.maxRetries} attempts`);
  throw lastError;
}

/**
 * Retries an async operation with a fixed (non-growing) delay between attempts.
 *
 * @example
 * const result = await retryWithFixedDelay(() => clickElement(page), 3, 500);
 */
export async function retryWithFixedDelay<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  return retryWithBackoff(operation, {
    maxRetries,
    initialDelay: delay,
    maxDelay: delay,
    backoffMultiplier: 1, // fixed — no growth
  });
}

/**
 * Retries an async operation when a caller-provided predicate returns true.
 * Gives full control over which errors deserve a retry.
 *
 * @example
 * const result = await retryConditionally(
 *   () => submitForm(page),
 *   (err) => err instanceof Error && err.message.includes("stale"),
 *   { maxRetries: 2 }
 * );
 */
export async function retryConditionally<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let delay = config.initialDelay;
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error)) throw error;
      if (attempt === config.maxRetries) break;

      console.warn(
        `[retry] Attempt ${attempt}/${config.maxRetries} failed — retrying in ${delay}ms...`
      );
      await sleepMs(delay);
      delay = calculateNextDelay(delay, config.backoffMultiplier, config.maxDelay);
    }
  }

  throw lastError;
}
