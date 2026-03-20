/**
 * Config Service Interface — Domain Layer
 *
 * Abstraction for all configuration and environment variable access.
 * Follows Interface Segregation Principle (ISP).
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

export interface IConfigService {
  /** Returns a required env variable or throws if missing. */
  getEnv(key: string, defaultValue?: string): string;
  /** Returns an optional env variable (undefined if not set). */
  getEnvOptional(key: string): string | undefined;
  /** Returns credentials for a named user key or undefined. */
  getUserData(key: string): { username: string; password: string } | undefined;
  /** Returns credentials for a named user key or throws. */
  requireUserData(key: string): { username: string; password: string };
  /** Lists all registered user keys. */
  getAvailableUserKeys(): string[];
  /**
   * Returns a timeout value (ms) from env var TEST_TIMEOUT_<TYPE>
   * or the provided default.
   */
  getTestTimeout(timeoutType: string, defaultValue: number): number;
  /**
   * Returns a retry count from env var TEST_RETRY_<TYPE>
   * or the provided default.
   */
  getTestRetry(retryType: string, defaultValue: number): number;
}
