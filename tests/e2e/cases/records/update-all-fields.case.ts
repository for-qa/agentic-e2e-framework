/**
 * Account Record: Update All Fields — Test Case
 *
 * As a QA Automation Tester,
 * I want to validate the record update workflow end-to-end:
 *   open drawer → enter edit mode → update all editable fields → save
 *   → assert new values persist → revert to original values → save
 *   → assert original values are restored.
 *
 * Acceptance Criteria:
 * - AC1: Open a record drawer from the flat list view.
 * - AC2: Click "Edit Record" to enter edit mode.
 * - AC3: Capture original values of all editable mandatory fields.
 * - AC4: Update each field to a different value, save; drawer shows updated values.
 * - AC5: Re-open edit mode, revert all fields to ACs captured original values, save.
 * - AC6: Drawer shows reverted (original) values correctly.
 *
 * Environment Variables Required (see .env.example):
 *   BASE_URL        — Base URL of the application under test
 *   ADMIN_USER      — Admin user email
 *   ADMIN_PASS      — Admin user password
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { Page } from "@playwright/test";
import { test } from "@playwright/test";
import { validateUpdateAllFields } from "@src/helpers/records/controllers/update-all-fields.controller";

// ─── Test Registration ────────────────────────────────────────────────────────

// Assertions are encapsulated in the controller function (architectural pattern).
/* eslint-disable playwright/expect-expect */
test.describe("@shard-3 @records-update — Account Record Update Suite", () => {
  test("record-update-all-fields: update all editable fields and verify persistence", async ({
    page,
  }: {
    page: Page;
  }) => {
    await validateUpdateAllFields(page);
  });
});
/* eslint-enable playwright/expect-expect */
