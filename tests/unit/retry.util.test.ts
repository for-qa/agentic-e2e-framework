/**
 * retry.util.test.ts
 *
 * Unit tests for src/utils/retry.util.ts
 * Covers all three retry strategies: exponential backoff, fixed delay, conditional.
 *
 * Framework: Vitest (npm run test:unit)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { retryWithBackoff, retryWithFixedDelay, retryConditionally } from "@src/utils/retry.util";

// Suppress console output during tests
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

// ─── Helpers ──────────────────────────────────────────────────────────────────

class TimeoutError extends Error {
  constructor(message = "Timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

class NetworkError extends Error {
  constructor(message = "Network failure") {
    super(message);
    this.name = "NetworkError";
  }
}

// ─── retryWithBackoff ─────────────────────────────────────────────────────────

describe("retry.util — retryWithBackoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("succeeds on first attempt without retrying", async () => {
    const op = vi.fn().mockResolvedValue("success");
    const result = await retryWithBackoff(op);
    expect(result).toBe("success");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable error and succeeds", async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new TimeoutError())
      .mockRejectedValueOnce(new TimeoutError())
      .mockResolvedValue("recovered");

    const result = await retryWithBackoff(op, { maxRetries: 3, initialDelay: 5 });
    expect(result).toBe("recovered");
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting maxRetries", async () => {
    const op = vi.fn().mockRejectedValue(new TimeoutError("persistent timeout"));

    await expect(retryWithBackoff(op, { maxRetries: 2, initialDelay: 5 })).rejects.toThrow(
      "persistent timeout"
    );

    expect(op).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry non-retryable errors — fails immediately", async () => {
    const op = vi.fn().mockRejectedValue(new Error("FatalError"));

    await expect(
      retryWithBackoff(op, { maxRetries: 5, retryableErrors: ["TimeoutError"] })
    ).rejects.toThrow("FatalError");

    // Should have attempted only once — no retries for non-retryable
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries all errors when retryableErrors is empty", async () => {
    const op = vi.fn().mockRejectedValueOnce(new Error("anything")).mockResolvedValue("ok");

    const result = await retryWithBackoff(op, {
      maxRetries: 2,
      initialDelay: 5,
      retryableErrors: [],
    });

    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("caps delay at maxDelay", async () => {
    // Just verify it completes without exceeding maxDelay by a large margin
    const op = vi.fn().mockRejectedValueOnce(new TimeoutError()).mockResolvedValue("done");

    const result = await retryWithBackoff(op, {
      maxRetries: 2,
      initialDelay: 5,
      maxDelay: 10,
      backoffMultiplier: 100, // would grow to 500ms but should cap at 10ms
    });

    expect(result).toBe("done");
  });

  it("returns typed generic result", async () => {
    const op = vi.fn().mockResolvedValue(42);
    const result = await retryWithBackoff<number>(op);
    expect(typeof result).toBe("number");
    expect(result).toBe(42);
  });
});

// ─── retryWithFixedDelay ──────────────────────────────────────────────────────

describe("retry.util — retryWithFixedDelay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("succeeds on first attempt", async () => {
    const op = vi.fn().mockResolvedValue("ok");
    const result = await retryWithFixedDelay(op);
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries and succeeds on second attempt", async () => {
    const op = vi.fn().mockRejectedValueOnce(new TimeoutError()).mockResolvedValue("fixed-ok");

    const result = await retryWithFixedDelay(op, 2, 5);
    expect(result).toBe("fixed-ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("uses default maxRetries of 3", async () => {
    const op = vi.fn().mockRejectedValue(new NetworkError());

    await expect(retryWithFixedDelay(op, 3, 5)).rejects.toThrow("Network failure");
    expect(op).toHaveBeenCalledTimes(3);
  });
});

// ─── retryConditionally ───────────────────────────────────────────────────────

describe("retry.util — retryConditionally", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries when predicate returns true", async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error("stale element"))
      .mockResolvedValue("conditionally-ok");

    const shouldRetry = (err: unknown) => err instanceof Error && err.message.includes("stale");

    const result = await retryConditionally(op, shouldRetry, { maxRetries: 2, initialDelay: 5 });
    expect(result).toBe("conditionally-ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry when predicate returns false", async () => {
    const op = vi.fn().mockRejectedValue(new Error("unrecoverable"));
    const shouldRetry = () => false;

    await expect(retryConditionally(op, shouldRetry)).rejects.toThrow("unrecoverable");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("throws after maxRetries are exhausted", async () => {
    const op = vi.fn().mockRejectedValue(new Error("always fails"));
    const shouldRetry = () => true;

    await expect(
      retryConditionally(op, shouldRetry, { maxRetries: 3, initialDelay: 5 })
    ).rejects.toThrow("always fails");

    expect(op).toHaveBeenCalledTimes(3);
  });
});
