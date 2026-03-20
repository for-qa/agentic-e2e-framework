/**
 * performance.util.ts
 *
 * Performance benchmarking utilities for test instrumentation.
 * Measures and records page load timings (FCP, LCP, DOM), API response times,
 * and custom operation durations. Saves results as JSON for analysis.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

/* eslint-disable no-console */

import { type Page, type APIResponse } from "@playwright/test";

import * as fs from "node:fs/promises";
import * as path from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OperationMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  load: number;
  networkIdle?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  totalDuration: number;
}

export interface ApiMetric {
  url: string;
  method: string;
  status: number;
  duration: number;
  responseSize?: number;
}

// ─── Class ────────────────────────────────────────────────────────────────────

/**
 * PerformanceBenchmark
 *
 * Collects and reports performance metrics across a test run.
 *
 * @example
 * const bench = new PerformanceBenchmark();
 * await bench.recordPageLoadMetrics(page, "dashboard");
 * bench.recordMetric("drawer-open", 320);
 * await bench.saveReport("test-results/perf.json");
 */
export class PerformanceBenchmark {
  private readonly operations: OperationMetric[] = [];
  private readonly apiMetrics: ApiMetric[] = [];
  private readonly pageMetrics = new Map<string, PageLoadMetrics>();

  // ── Recording ───────────────────────────────────────────────────────────────

  recordMetric(name: string, duration: number, metadata?: Record<string, unknown>): void {
    this.operations.push({ name, duration, timestamp: new Date().toISOString(), metadata });
    console.info(`[perf] ${name}: ${duration}ms`);
  }

  recordApiMetric(response: APIResponse, startTime: number, url: string, method: string): void {
    const duration = Date.now() - startTime;
    const headers = response.headers();
    const contentLength = headers["content-length"] ?? headers["Content-Length"];
    const responseSize = contentLength ? Number.parseInt(contentLength, 10) : undefined;

    this.apiMetrics.push({ url, method, status: response.status(), duration, responseSize });
    console.info(`[perf] API ${method} ${url}: ${duration}ms (${response.status()})`);
  }

  async recordPageLoadMetrics(page: Page, pageName: string): Promise<PageLoadMetrics | undefined> {
    const startTime = Date.now();

    try {
      await page.waitForLoadState("domcontentloaded", { timeout: 10_000 }).catch(() => {});
      const domContentLoaded = Date.now() - startTime;

      await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
      const load = Date.now() - startTime;

      let networkIdle: number | undefined;
      try {
        const idleStart = Date.now();
        // eslint-disable-next-line playwright/no-networkidle
        await page.waitForLoadState("networkidle", { timeout: 5_000 });
        networkIdle = Date.now() - idleStart;
      } catch {
        // Network idle may not settle — safe to skip
      }

      // Collect Web Vitals from the browser context
      const vitals = await page
        .evaluate(() => {
          return new Promise<{ fcp?: number; lcp?: number }>((resolve) => {
            const nav = performance.getEntriesByType("navigation")[0] as
              | PerformanceNavigationTiming
              | undefined;
            if (!nav) {
              resolve({});
              return;
            }

            const paintEntries = performance.getEntriesByType("paint");
            const fcp = paintEntries.find((e) => e.name === "first-contentful-paint");

            if (!("PerformanceObserver" in globalThis)) {
              resolve({ fcp: fcp?.startTime });
              return;
            }

            try {
              let lcp: number | undefined;
              const observer = new PerformanceObserver((list) => {
                const last = list.getEntries().at(-1);
                if (last) lcp = last.startTime;
              });
              observer.observe({ entryTypes: ["largest-contentful-paint"] });
              setTimeout(() => {
                observer.disconnect();
                resolve({ fcp: fcp?.startTime, lcp });
              }, 1500);
            } catch {
              resolve({ fcp: fcp?.startTime });
            }
          });
        })
        .catch(() => ({}) as { fcp?: number; lcp?: number });

      const metrics: PageLoadMetrics = {
        domContentLoaded,
        load,
        networkIdle,
        firstContentfulPaint: vitals.fcp,
        largestContentfulPaint: vitals.lcp,
        totalDuration: Date.now() - startTime,
      };

      this.pageMetrics.set(pageName, metrics);
      console.info(
        `[perf] Page "${pageName}": DOM=${domContentLoaded}ms, Load=${load}ms, Total=${metrics.totalDuration}ms`
      );
      return metrics;
    } catch (error) {
      const msg = String(error);
      if (!msg.includes("Target page") && !msg.includes("Execution context")) {
        console.debug(`[perf] Skipped page metrics for "${pageName}": ${msg}`);
      }
      return undefined;
    }
  }

  // ── Reporting ───────────────────────────────────────────────────────────────

  generateReport() {
    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      summary: {
        totalOperations: this.operations.length,
        totalApiCalls: this.apiMetrics.length,
        totalPages: this.pageMetrics.size,
        averageOperationDuration: Math.round(avg(this.operations.map((m) => m.duration))),
        averageApiDuration: Math.round(avg(this.apiMetrics.map((m) => m.duration))),
      },
      operations: this.operations,
      apiMetrics: this.apiMetrics,
      pageMetrics: Object.fromEntries(this.pageMetrics),
    };
  }

  async saveReport(outputPath = "test-results/performance.json"): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(this.generateReport(), null, 2), "utf-8");
    console.info(`[perf] Report saved → ${outputPath}`);
  }

  clear(): void {
    this.operations.length = 0;
    this.apiMetrics.length = 0;
    this.pageMetrics.clear();
  }
}

// ─── Singleton + Functional API ───────────────────────────────────────────────

let _globalBenchmark: PerformanceBenchmark | null = null;

/** Returns the shared global benchmark instance (created on first call). */
export function getPerformanceBenchmark(): PerformanceBenchmark {
  _globalBenchmark ??= new PerformanceBenchmark();
  return _globalBenchmark;
}

/**
 * Wraps an async function to measure and record its execution time.
 *
 * @example
 * const rows = await measurePerformance("load-records-table", () =>
 *   recordsTablePage.getAllRows()
 * );
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const bench = getPerformanceBenchmark();
  const start = Date.now();

  try {
    const result = await fn();
    bench.recordMetric(name, Date.now() - start, metadata);
    return result;
  } catch (error) {
    bench.recordMetric(`${name} (failed)`, Date.now() - start, {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
