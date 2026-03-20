/**
 * error.util.test.ts
 *
 * Unit tests for src/utils/error.util.ts
 * Covers getErrorMessage and ensureError across all input types.
 *
 * Framework: Vitest (npm run test:unit)
 */

import { describe, it, expect } from "vitest";
import { getErrorMessage, ensureError } from "@src/utils/error.util";

// ─── getErrorMessage ──────────────────────────────────────────────────────────

describe("error.util — getErrorMessage", () => {
  it("returns the message from an Error instance", () => {
    expect(getErrorMessage(new Error("something went wrong"))).toBe("something went wrong");
  });

  it("returns as-is when given a plain string", () => {
    expect(getErrorMessage("plain string error")).toBe("plain string error");
  });

  it("serialises a plain object to JSON", () => {
    const result = getErrorMessage({ code: 404, reason: "not found" });
    expect(result).toContain("404");
    expect(result).toContain("not found");
  });

  it("falls back to String() for non-serialisable values (e.g. undefined)", () => {
    expect(getErrorMessage(undefined)).toBe("undefined");
  });

  it("falls back to String() for numeric thrown values", () => {
    expect(getErrorMessage(42)).toBe("42");
  });

  it("handles null gracefully", () => {
    expect(getErrorMessage(null)).toBe("null");
  });

  it("returns empty string for an Error with an empty message", () => {
    // Error with empty message — falls through to String(error)
    const result = getErrorMessage(new Error(""));
    expect(typeof result).toBe("string");
  });
});

// ─── ensureError ──────────────────────────────────────────────────────────────

describe("error.util — ensureError", () => {
  it("returns the same Error instance unchanged", () => {
    const original = new Error("original");
    const result = ensureError(original);
    expect(result).toBe(original);
  });

  it("wraps a plain string in a new Error", () => {
    const result = ensureError("raw string error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("raw string error");
  });

  it("wraps an object in a new Error with a JSON message", () => {
    const result = ensureError({ code: 500 });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain("500");
  });

  it("wraps undefined in a new Error", () => {
    const result = ensureError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("undefined");
  });

  it("wraps a number in a new Error", () => {
    const result = ensureError(404);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("404");
  });
});
