#!/usr/bin/env bash
# =============================================================================
# run-shard.sh — Universal shard runner for all Playwright suite shards.
#
# Usage:
#   SHARD_NUMBER="1" SHARD_TAG="@shard-1" \
#     bash scripts/ci/run-shard.sh
#
# Required env vars (set by the caller CI step):
#   SHARD_NUMBER  - Human label used in report folder name, e.g. "1", "2"
#   SHARD_TAG     - Playwright --grep pattern, e.g. "@shard-1"
#
# Optional env vars:
#   SUITE_FILE    - Path to a specific suite file to scope the run.
#                   If omitted, all tests matching SHARD_TAG are run.
#   PLAYWRIGHT_WORKERS - Number of parallel workers (default: 100%)
#
# Sanitized for public portfolio — see CASE_STUDY.md for context.
# =============================================================================

set -euo pipefail

SHARD_NUMBER="${SHARD_NUMBER:?'SHARD_NUMBER is required'}"
SHARD_TAG="${SHARD_TAG:?'SHARD_TAG is required'}"
SUITE_FILE="${SUITE_FILE:-}"
PLAYWRIGHT_WORKERS="${PLAYWRIGHT_WORKERS:-100%}"

echo "[INFO] ──────────────────────────────────────────────────────────────────"
echo "[INFO] Shard ${SHARD_NUMBER} — Tag: ${SHARD_TAG}"
echo "[INFO] Workers: ${PLAYWRIGHT_WORKERS}"
[ -n "${SUITE_FILE}" ] && echo "[INFO] Suite file: ${SUITE_FILE}"
echo "[INFO] ──────────────────────────────────────────────────────────────────"

# ── Run Playwright (non-fatal: capture exit code, continue pipeline) ──────────
set +e
if [ -n "${SUITE_FILE}" ]; then
  npx playwright test "${SUITE_FILE}" \
    --grep "${SHARD_TAG}" \
    --workers="${PLAYWRIGHT_WORKERS}"
else
  npx playwright test \
    --grep "${SHARD_TAG}" \
    --workers="${PLAYWRIGHT_WORKERS}"
fi
SHARD_EXIT_CODE=$?
set -e

# ── Move report to shard-labelled folder ─────────────────────────────────────
if [ -d playwright-report ]; then
  # Wait briefly for report files to flush before moving
  for i in {1..5}; do
    [ -f playwright-report/index.html ] && break
    sleep 1
  done
  mv playwright-report "playwright-report-shard-${SHARD_NUMBER}"
  echo "[INFO] Report moved → playwright-report-shard-${SHARD_NUMBER}/"
fi

# ── Persist exit code for the merge/notify step ───────────────────────────────
echo "${SHARD_EXIT_CODE}" > "playwright_exit_code_shard_${SHARD_NUMBER}.txt"

if [ "${SHARD_EXIT_CODE}" -ne 0 ]; then
  echo "[WARN] Shard ${SHARD_NUMBER} had failures (exit: ${SHARD_EXIT_CODE}), continuing pipeline"
else
  echo "[SUCCESS] Shard ${SHARD_NUMBER} passed"
fi

# Always exit 0 so the pipeline continues to the merge/notify step
exit 0
