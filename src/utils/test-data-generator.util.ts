/**
 * Test Data Generator — Utils Layer
 *
 * Factory functions for generating randomised, collision-free test data.
 * Use these instead of hardcoded strings to keep tests isolated and
 * independent from each other's side-effects.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

// ─── Strings ──────────────────────────────────────────────────────────────────

/**
 * Generates a random alphanumeric string.
 * @param length - Number of characters (default: 10)
 * @param includeNumbers - Include digits (default: true)
 */
export function generateRandomString(length = 10, includeNumbers = true): string {
  const chars = includeNumbers
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Generates a random email address.
 * @param domain - Email domain (default: "test.example.com")
 */
export function generateRandomEmail(domain = "test.example.com"): string {
  return `${generateRandomString(8, true).toLowerCase()}@${domain}`;
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/** Generates a random integer between min and max (inclusive). */
export function generateRandomNumber(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random amount from a candidate list, excluding the provided value.
 * Useful for ensuring an "updated" amount is visually distinct from the current one.
 */
export function pickAmountDifferentFrom(
  current: number,
  candidates = [100, 250, 500, 750, 1_000, 1_500, 2_000]
): number {
  const filtered = candidates.filter((v) => v !== current);
  if (filtered.length === 0) throw new Error("No alternative amount available");
  return filtered[Math.floor(Math.random() * filtered.length)] as number;
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** Generates a random Date between startDate and endDate. */
export function generateRandomDate(
  startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1_000),
  endDate = new Date()
): Date {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

/** Generates a random date string in YYYY-MM-DD format. */
export function generateRandomDateString(startDate?: Date, endDate?: Date): string {
  const date = generateRandomDate(startDate, endDate);
  const parts = date.toISOString().split("T");
  if (!parts[0]) throw new Error("Failed to generate date string");
  return parts[0];
}

// ─── Reference IDs ────────────────────────────────────────────────────────────

/** Generates a random reference ID in "REF-XXXXX" format. */
export function generateReferenceId(prefix = "REF"): string {
  return `${prefix}-${generateRandomNumber(10_000, 99_999)}`;
}

// ─── Arrays ───────────────────────────────────────────────────────────────────

/** Picks a random element from a non-empty array. Throws on empty input. */
export function pickRandom<T>(array: T[]): T {
  if (array.length === 0) throw new Error("Cannot pick from an empty array");
  const el = array[Math.floor(Math.random() * array.length)];
  if (el === undefined) throw new Error("Unexpected undefined element");
  return el;
}
