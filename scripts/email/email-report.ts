/**
 * email-report.ts
 *
 * CI email notification script for the Playwright test run.
 * Reads test results from the Playwright JSON report, generates an HTML
 * email using the template, and sends it via SMTP (Gmail App Password).
 *
 * Required GitHub Secrets:
 *   EMAIL_USER      — Gmail address (e.g., yourname@gmail.com)
 *   EMAIL_PASS      — Gmail App Password (not your main Google password)
 *   EMAIL_RECIPIENT — Destination address(es), comma-separated
 *
 * Optional GitHub Secrets / Env vars:
 *   SKIP_EMAIL_REPORT — Set to "true" to disable sending
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

/* eslint-disable no-console */
import fs from "node:fs";
import nodemailer from "nodemailer";
import { generateEmailHtml, type ReportStats, type TestEntry } from "./email-template.js";

// ─── Playwright JSON report types ─────────────────────────────────────────────

type PlaywrightResult = { duration?: number; status?: string };
type PlaywrightSpec = { title?: string; ok?: boolean; tests?: PlaywrightRawTest[] };
type PlaywrightRawTest = { status?: string; results?: PlaywrightResult[] };
type PlaywrightSuite = { title?: string; specs?: PlaywrightSpec[]; suites?: PlaywrightSuite[] };
type PlaywrightJson = {
  stats?: { expected?: number; unexpected?: number; skipped?: number; duration?: number };
  suites?: PlaywrightSuite[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTestStatus(rawStatus: string | undefined): TestEntry["status"] {
  if (rawStatus === "failed" || rawStatus === "timedOut") return "Failed";
  if (rawStatus === "skipped") return "Skipped";
  return "Passed";
}

function formatTestDuration(ms: number): string {
  if (ms >= 60_000) {
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  }
  return `${Math.round(ms / 1000)}s`;
}

function extractTests(suites: PlaywrightSuite[] = []): TestEntry[] {
  const results: TestEntry[] = [];
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      const test = spec.tests?.[0];
      if (!test) continue;
      const durationMs = test.results?.[0]?.duration ?? 0;
      results.push({
        name: spec.title ?? "Unknown",
        status: resolveTestStatus(test.status),
        duration: formatTestDuration(durationMs),
      });
    }
    results.push(...extractTests(suite.suites ?? []));
  }
  return results;
}

function parseReport(filePath: string): ReportStats {
  const stats: ReportStats = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0, tests: [] };

  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] ${filePath} not found — email will show empty results.`);
    return stats;
  }

  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PlaywrightJson;
    stats.passed = json.stats?.expected ?? 0;
    stats.failed = json.stats?.unexpected ?? 0;
    stats.skipped = json.stats?.skipped ?? 0;
    stats.total = stats.passed + stats.failed + stats.skipped;
    stats.duration = Math.round((json.stats?.duration ?? 0) / 1000);
    stats.tests = extractTests(json.suites ?? []);
    console.log(
      `[INFO] Parsed: ${stats.total} total | ${stats.passed} passed | ${stats.failed} failed`
    );
  } catch (err) {
    console.warn("[WARN] Failed to parse results JSON:", err);
  }

  return stats;
}

function resolveOverallFailed(stats: ReportStats): boolean {
  if (stats.failed > 0) return true;
  if (!fs.existsSync("overall_exit_code.txt")) return false;
  return fs.readFileSync("overall_exit_code.txt", "utf-8").trim() === "1";
}

function buildSubject(failed: boolean, branch: string, runId: string): string {
  const statusLabel = failed ? "❌ FAILED" : "✅ PASSED";
  return `[AUTOMATION] Run #${runId} [${branch}] — Playwright E2E — ${statusLabel}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Guard: skip if explicitly disabled
  if (process.env["SKIP_EMAIL_REPORT"] === "true") {
    console.log("[INFO] SKIP_EMAIL_REPORT=true — email notification skipped.");
    return;
  }

  const emailUser = process.env["EMAIL_USER"];
  const emailPass = process.env["EMAIL_PASS"];
  const emailRecipient = process.env["EMAIL_RECIPIENT"] ?? emailUser;

  if (!emailUser || !emailPass) {
    console.warn(
      "[WARN] EMAIL_USER or EMAIL_PASS not set. " +
        "Skipping email — report is available in GitHub Actions artifacts."
    );
    return;
  }

  // Parse results
  const stats = parseReport("merged-playwright-report/results.json");
  const overallFailed = resolveOverallFailed(stats);

  // Build report link (points to GitHub Actions run)
  const runId = process.env["GITHUB_RUN_ID"] ?? "local";
  const repo = process.env["GITHUB_REPOSITORY"];
  const branch = process.env["GITHUB_REF_NAME"] ?? "unknown";
  const reportLink = repo ? `https://github.com/${repo}/actions/runs/${runId}` : undefined;

  // Generate HTML
  const html = generateEmailHtml({
    report: stats,
    reportLink,
    meta: {
      runId,
      repository: repo,
      branch,
      actor: process.env["GITHUB_ACTOR"],
    },
  });

  const subject = buildSubject(overallFailed, branch, runId);

  // Send via nodemailer (Gmail SMTP)
  const transporter: nodemailer.Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });

  console.log(`[INFO] Sending report to: ${emailRecipient}`);

  await transporter.sendMail({
    from: `"Agentic E2E Framework" <${emailUser}>`,
    to: emailRecipient,
    subject,
    html,
  });

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
  console.log("[SUCCESS] Email report sent successfully!");
  console.log(`[INFO] ${stats.passed}/${stats.total} passed (${passRate}% pass rate)`);
}

main().catch((err: unknown) => {
  console.error("[ERROR] Email report failed:", err);
  process.exit(1);
});
