/**
 * test-data-generator.util.test.ts
 *
 * Unit tests for src/utils/test-data-generator.util.ts
 * Tests only the functions that are actually exported from the module.
 *
 * Framework: Vitest (npm run test:unit)
 */

import { describe, it, expect } from "vitest";
import {
  generateRandomString,
  generateRandomEmail,
  generateRandomNumber,
  generateRandomDate,
  generateRandomDateString,
  generateReferenceId,
  pickRandom,
  pickAmountDifferentFrom,
} from "@src/utils/test-data-generator.util";

// ─── generateRandomString ─────────────────────────────────────────────────────

describe("test-data-generator.util — generateRandomString", () => {
  it("generates a string of the exact requested length", () => {
    expect(generateRandomString(10)).toHaveLength(10);
    expect(generateRandomString(50)).toHaveLength(50);
  });

  it("includes digits by default", () => {
    // With 100 chars, statistically near-certain to contain at least one digit
    const result = generateRandomString(100);
    expect(result).toMatch(/\d/);
  });

  it("excludes digits when includeNumbers is false", () => {
    const result = generateRandomString(100, false);
    expect(result).not.toMatch(/\d/);
    expect(result).toMatch(/[A-Za-z]/);
  });

  it("generates statistically unique values on repeated calls", () => {
    // Extremely unlikely to collide at length 20
    expect(generateRandomString(20)).not.toBe(generateRandomString(20));
  });
});

// ─── generateRandomEmail ──────────────────────────────────────────────────────

describe("test-data-generator.util — generateRandomEmail", () => {
  it("generates a valid email shape", () => {
    const email = generateRandomEmail();
    expect(email).toContain("@");
    const parts = email.split("@");
    expect(parts).toHaveLength(2);
    expect(parts[0]).not.toBe("");
    expect(parts[1]).not.toBe("");
  });

  it("uses a custom domain when provided", () => {
    const email = generateRandomEmail("portfolio.dev");
    expect(email).toMatch(/@portfolio\.dev$/);
  });

  it("username part is lowercase", () => {
    const [username = ""] = generateRandomEmail().split("@");
    expect(username).toBe(username.toLowerCase());
  });
});

// ─── generateRandomNumber ─────────────────────────────────────────────────────

describe("test-data-generator.util — generateRandomNumber", () => {
  it("returns an integer within the inclusive range", () => {
    const result = generateRandomNumber(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("handles a single-value range (min === max)", () => {
    expect(generateRandomNumber(7, 7)).toBe(7);
  });

  it("uses defaults (0–100) when called with no arguments", () => {
    const result = generateRandomNumber();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ─── generateRandomDate ───────────────────────────────────────────────────────

describe("test-data-generator.util — generateRandomDate", () => {
  it("returns a Date within the provided range", () => {
    const start = new Date("2020-01-01");
    const end = new Date("2021-01-01");
    const result = generateRandomDate(start, end);
    expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
  });

  it("returns a Date instance", () => {
    expect(generateRandomDate()).toBeInstanceOf(Date);
  });

  it("defaults to within the last calendar year", () => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const result = generateRandomDate();
    expect(result.getTime()).toBeGreaterThanOrEqual(oneYearAgo.getTime());
    expect(result.getTime()).toBeLessThanOrEqual(now.getTime());
  });
});

// ─── generateRandomDateString ─────────────────────────────────────────────────

describe("test-data-generator.util — generateRandomDateString", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    expect(generateRandomDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a parseable, valid date", () => {
    const result = generateRandomDateString();
    const date = new Date(result);
    expect(date.toString()).not.toBe("Invalid Date");
  });
});

// ─── generateReferenceId ─────────────────────────────────────────────────────

describe("test-data-generator.util — generateReferenceId", () => {
  it("uses REF as the default prefix", () => {
    expect(generateReferenceId()).toMatch(/^REF-\d{5}$/);
  });

  it("uses a custom prefix", () => {
    expect(generateReferenceId("QUOTE")).toMatch(/^QUOTE-\d{5}$/);
  });

  it("numeric part is always a 5-digit number", () => {
    const [, num = ""] = generateReferenceId().split("-");
    const n = Number.parseInt(num, 10);
    expect(n).toBeGreaterThanOrEqual(10_000);
    expect(n).toBeLessThanOrEqual(99_999);
  });
});

// ─── pickRandom ───────────────────────────────────────────────────────────────

describe("test-data-generator.util — pickRandom", () => {
  it("returns an element contained in the array", () => {
    const arr = ["alpha", "beta", "gamma", "delta"];
    expect(arr).toContain(pickRandom(arr));
  });

  it("returns the only element for a single-item array", () => {
    expect(pickRandom([99])).toBe(99);
  });

  it("throws for an empty array", () => {
    expect(() => pickRandom([] as never[])).toThrow();
  });
});

// ─── pickAmountDifferentFrom ─────────────────────────────────────────────────

describe("test-data-generator.util — pickAmountDifferentFrom", () => {
  it("never returns the excluded value", () => {
    const candidates = [100, 250, 500];
    const result = pickAmountDifferentFrom(100, candidates);
    expect(result).not.toBe(100);
    expect(candidates).toContain(result);
  });

  it("works with the default candidates list", () => {
    const result = pickAmountDifferentFrom(999); // 999 is not in defaults
    expect(typeof result).toBe("number");
  });

  it("throws when all candidates match the excluded value", () => {
    expect(() => pickAmountDifferentFrom(100, [100])).toThrow();
  });
});
