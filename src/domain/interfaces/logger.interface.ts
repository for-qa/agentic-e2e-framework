/**
 * Logger Interface — Domain Layer
 *
 * Abstraction for all logging functionality.
 * Follows Interface Segregation Principle (ISP) — consumers depend only
 * on this minimal contract, not on console or any concrete logger.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

export type LogLevel = "INFO" | "STEP" | "SUCCESS" | "WARN" | "ERROR" | "DEBUG";
export type LogMode = "playwright" | "auto";

export interface ILogger {
  info(message: string, context?: string, force?: boolean): void;
  step(message: string, context?: string): void;
  success(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  setEnabled(enabled: boolean): void;
  setMode(mode: LogMode): void;
  getMode(): "playwright";
}
