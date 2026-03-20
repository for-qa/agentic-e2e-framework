/**
 * Logger Implementation — Infrastructure Layer
 *
 * Concrete implementation of ILogger.
 * Outputs timestamped, ANSI-coloured log lines to stdout/stderr.
 * Timestamp uses IST (UTC+5:30) to match the team's local timezone.
 *
 * Singleton — call Logger.getInstance() everywhere.
 *
 * Pattern: Singleton + Dependency Inversion Principle
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { ILogger, LogLevel, LogMode } from "@src/domain/interfaces/logger.interface";

// ─── ANSI colour palette ──────────────────────────────────────────────────────

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
} as const;

type ColorKey = keyof typeof COLORS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats a timestamp in IST (Asia/Kolkata, UTC+5:30) with AM/PM. */
function formatTimestampIST(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod").toUpperCase()} IST`;
}

/** Wraps a message with timestamp, level badge, context tag, and ANSI colour. */
function formatMessage(
  message: string,
  level: LogLevel,
  color: ColorKey,
  context?: string
): string {
  const ts = formatTimestampIST();
  const ctx = context ? `[${context}]` : "";
  return `${COLORS[color]}${ts} [${level}]${ctx} ${message}${COLORS.reset}`;
}

// ─── Logger Implementation ────────────────────────────────────────────────────

export class Logger implements ILogger {
  private static instance: Logger;
  private enabled = true;
  private mode: LogMode = "playwright";

  // Singleton — prevents multiple Logger instances.
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setMode(mode: LogMode): void {
    this.mode = mode;
  }

  getMode(): "playwright" {
    return "playwright";
  }

  info(message: string, context?: string, force = false): void {
    if (!force && !this.enabled) return;
    process.stdout.write(formatMessage(message, "INFO", "cyan", context) + "\n");
  }

  step(message: string, context?: string): void {
    process.stdout.write(formatMessage(message, "STEP", "magenta", context) + "\n");
  }

  success(message: string, context?: string): void {
    process.stdout.write(formatMessage(message, "SUCCESS", "green", context) + "\n");
  }

  warn(message: string, context?: string): void {
    console.warn(formatMessage(message, "WARN", "yellow", context));
  }

  error(message: string, context?: string): void {
    console.error(formatMessage(message, "ERROR", "red", context));
  }

  debug(message: string, context?: string): void {
    if (!this.enabled || !process.env["DEBUG"]) return;
    process.stdout.write(formatMessage(message, "DEBUG", "blue", context) + "\n");
  }
}
