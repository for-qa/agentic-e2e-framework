/**
 * email-template.ts
 *
 * Generates the HTML email body for the Playwright test run report.
 * Sanitized for public portfolio — no proprietary branding or CDN assets.
 *
 * See CASE_STUDY.md for context on the original implementation.
 */

export type TestEntry = {
  name: string;
  status: "Passed" | "Failed" | "Skipped";
  duration: string;
};

export type ReportStats = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Total run duration in seconds */
  duration: number;
  tests: TestEntry[];
};

export type EmailTemplateInput = {
  report: ReportStats;
  /** Link to the published report artifact (if available) */
  reportLink?: string;
  /** GitHub run metadata for context */
  meta?: {
    runId?: string;
    repository?: string;
    branch?: string;
    actor?: string;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  if (status === "Passed") return "#216869";
  if (status === "Skipped") return "#888888";
  return "#d93025";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function resolveOverallStatus(failed: number, passed: number): string {
  if (failed > 0) return "Failed";
  if (passed > 0) return "Passed";
  return "No Tests";
}

function buildTestRows(tests: TestEntry[]): string {
  if (tests.length === 0) {
    return `<tr>
      <td colspan="3" style="padding: 12px; text-align: center; color: #888;">
        No test results available.
      </td>
    </tr>`;
  }

  return tests
    .map(
      ({ name, status, duration }) => `
        <tr style="border-bottom: 1px solid #e4e4e7;">
          <td style="padding: 8px 12px;">${name}</td>
          <td style="padding: 8px 12px; color: ${statusColor(status)}; font-weight: 600;">${status}</td>
          <td style="padding: 8px 12px; color: #555;">${duration}</td>
        </tr>`
    )
    .join("");
}

function buildMetaSection(meta: EmailTemplateInput["meta"]): string {
  if (!meta) return "";
  const { branch, actor, runId, repository } = meta;
  if (!branch && !actor && !runId) return "";

  const runLink =
    runId && repository
      ? `<div><strong>Run:</strong> <a href="https://github.com/${repository}/actions/runs/${runId}" style="color: #216869;">#${runId}</a></div>`
      : "";

  return `<div style="padding: 12px 16px; margin-bottom: 20px; background: #f8f9fa;
                 border: 1px solid #e4e4e7; border-radius: 8px; font-size: 13px;">
    <strong style="display: block; margin-bottom: 8px; color: #333;">Pipeline Details</strong>
    ${branch ? `<div><strong>Branch:</strong> ${branch}</div>` : ""}
    ${actor ? `<div><strong>Triggered by:</strong> ${actor}</div>` : ""}
    ${runLink}
  </div>`;
}

function buildCtaButton(reportLink: string | undefined): string {
  if (!reportLink) return "";
  return `<tr>
    <td align="center" style="padding: 0 30px 24px 30px;">
      <a href="${reportLink}"
        style="display: inline-block; background-color: #216869; color: #ffffff;
               padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600;
               text-decoration: none;">
        📊 View Full Report
      </a>
    </td>
  </tr>`;
}

function buildTestTable(tests: TestEntry[]): string {
  if (tests.length === 0) return "";
  return `<tr>
    <td style="padding: 0 30px 20px 30px;">
      <h3 style="margin: 0 0 12px; color: #333; font-size: 16px;">Test Results</h3>
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border-collapse: collapse; font-size: 13px;
               border: 1px solid #e4e4e7; border-radius: 6px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f4f4f5;">
            <th style="padding: 10px 12px; text-align: left; color: #555; font-weight: 600;">Test Name</th>
            <th style="padding: 10px 12px; text-align: left; color: #555; font-weight: 600;">Status</th>
            <th style="padding: 10px 12px; text-align: left; color: #555; font-weight: 600;">Duration</th>
          </tr>
        </thead>
        <tbody>${buildTestRows(tests)}</tbody>
      </table>
    </td>
  </tr>`;
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function generateEmailHtml(input: EmailTemplateInput): string {
  const { report, reportLink, meta } = input;
  const year = new Date().getFullYear();

  const overallStatus = resolveOverallStatus(report.failed, report.passed);
  const overallColor = report.failed > 0 ? "#d93025" : "#216869";
  const passRate = report.total > 0 ? Math.round((report.passed / report.total) * 100) : 0;

  const metaSection = buildMetaSection(meta);
  const metaRow = metaSection
    ? `<tr><td style="padding: 0 30px 0 30px;">${metaSection}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;
             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="background-color: #f4f4f5; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="680"
            style="background-color: #ffffff; border-radius: 12px; overflow: hidden;
                   box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
            <tbody>

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                           padding: 28px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;
                             letter-spacing: 0.5px;">
                    🤖 Playwright Test Report
                  </h1>
                  <p style="margin: 6px 0 0; color: #a0aec0; font-size: 13px;">
                    Agentic E2E Framework — GitHub Actions
                  </p>
                </td>
              </tr>

              <!-- Summary Card -->
              <tr>
                <td style="padding: 24px 30px 0 30px;">
                  <div style="background: linear-gradient(135deg, ${overallColor}18 0%, ${overallColor}05 100%);
                              border-left: 4px solid ${overallColor};
                              padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 14px; color: #333; font-size: 17px;">Test Summary</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                      <tr>
                        <td style="padding: 4px 0; color: #555; width: 120px;"><strong>Status</strong></td>
                        <td style="padding: 4px 0; color: ${overallColor}; font-weight: 700; font-size: 16px;">
                          ${overallStatus}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Total Tests</strong></td>
                        <td style="padding: 4px 0;">${report.total}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Passed</strong></td>
                        <td style="padding: 4px 0; color: #216869; font-weight: 600;">${report.passed}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Failed</strong></td>
                        <td style="padding: 4px 0; color: #d93025; font-weight: 600;">${report.failed}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Skipped</strong></td>
                        <td style="padding: 4px 0; color: #888; font-weight: 600;">${report.skipped}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Pass Rate</strong></td>
                        <td style="padding: 4px 0; font-weight: 600;">${passRate}%</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #555;"><strong>Duration</strong></td>
                        <td style="padding: 4px 0;">${formatDuration(report.duration)}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Pipeline Meta -->
              ${metaRow}

              <!-- Test Results Table -->
              ${buildTestTable(report.tests)}

              <!-- CTA Button -->
              ${buildCtaButton(reportLink)}

              <!-- Footer -->
              <tr>
                <td align="center"
                  style="padding: 16px 30px 28px; font-size: 12px; color: #999;
                         border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  Automated message from the Agentic E2E Framework CI Pipeline.<br>
                  © ${year} — Built 100% with AI Agent Orchestration.
                </td>
              </tr>

            </tbody>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
