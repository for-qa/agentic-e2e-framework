# Technical Case Study: Agentic E2E Automation Framework

**Author Role:** Principal QA Architect (AI Orchestration)  
**Domain:** Enterprise SaaS — Account Records Management (sanitized)  
**Stack:** Playwright · TypeScript · Agentic AI Orchestration

---

## 1. Executive Summary

This project demonstrates the complete lifecycle of an enterprise-grade E2E Automation Framework where **100% of the architecture and implementation were driven by AI Agents.**

By acting as an **AI Orchestrator** rather than a traditional coder, the developer directed autonomous agents to convert complex business Acceptance Criteria into production-quality Playwright/TypeScript code — validating that AI-native development can produce frameworks that are modular, maintainable, and enterprise-ready.

---

## 2. The Problem

The target application had complex, state-dependent UI workflows including:

| Challenge                     | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| **Dynamic Data Persistence**  | Field updates must survive page refreshes — assertions need pre/post snapshot comparison |
| **Async UI States**           | Detail drawers load progressively; naive selectors fail on skeleton-loading screens      |
| **Role-Based Access (RBAC)**  | Different users (Admin, Analyst, Approver, Reviewer) see different field availability    |
| **Serial Execution Required** | Tests share application state — parallelism must be controlled per-suite                 |

---

## 3. Agentic Development Process

### Step 1 — Requirement Ingestion

Business Acceptance Criteria (AC) were fed as structured prompts to AI agents.  
_Example AC → Code mapping:_

> **AC:** "Capture original values → update each editable field → save → assert updated values persist after refresh"  
> **Generated:** `captureFormSnapshot()` → `applyUpdatesAndSave()` → `waitForDrawerViewAfterSave()` → `assertDrawerMatchesSnapshot()`

### Step 2 — Architecture Generation

Agents produced the modular folder structure, TypeScript interfaces (`TestSuiteConfiguration`, `TestCaseMetadata`), and all configuration schemas.

### Step 3 — Controller Implementation

Agents wrote the full E2E controller, mapping each AC step to a Playwright action chain with proper wait strategies and error handling.

### Step 4 — Automated Quality Refactoring

When cognitive complexity exceeded the allowed threshold (15), AI agents automatically refactored the code by extracting sub-functions — reducing complexity without changing behaviour.

### Step 5 — Human Risk Mitigation

The developer reviewed all AI output for hallucinations, incorrect selectors, and edge cases — demonstrating the **Human-in-the-Loop** principle from ISTQB CT-GenAI.

---

## 4. Key Design Decisions

### Modular Suite Configuration

Instead of hard-coding test metadata inside test files, all scheduling parameters are declared in a central `TestSuiteConfiguration` object. This allows CI/CD pipelines to re-order, shard, and prioritize tests without touching test logic.

```typescript
{
  executionMode: "serial",  // safe for shared-state environments
  workerCount: 4,           // matches CI runner CPU count
  optimizeExecutionOrder: true, // sorts HIGH → MEDIUM → LOW priority
  enablePerformanceMonitoring: true,
}
```

### Snapshot-Based Assertion Pattern

Rather than asserting fixed expected values, the framework:

1. **Captures** the current state into a `snapshot` object.
2. **Applies** changes.
3. **Asserts** the new state matches the applied changes.
4. **Reverts** to snapshot values.
5. **Asserts** the reverted state matches the original snapshot.

This makes tests data-independent and resilient to changes in test data.

### Shard-Ready Tagging

Every test carries structurally meaningful tags:

```
@shard-1   →  auth boundary tests (parallel shard 1)
@shard-2   →  navigation & cart tests (parallel shard 2)
@smoke     →  fast critical-path validation
@records-update  →  domain filter for record update suite
```

### Parallel Sharding Pipeline (GitHub Actions)

The CI pipeline mirrors the production Bitbucket architecture:

```
quality-gate ──────────────────────────────────┐
                                               │  all parallel
setup ──┬──> shard-1 (auth boundary tests)     │
        ├──> shard-2 (navigation & cart tests) │
        └──> shard-3 (private app suite)        │
                    ↓                          │
         merge-reports (merges all shards) ────┘
                    ↓
         notify (sends HTML email report)
```

Each shard runs in an isolated Ubuntu container, restoring the shared authentication state cache from the setup job. This achieves maximum parallelism while avoiding repeated login overhead.

### HTML Email Report Notification

After every pipeline run (pass or fail), an HTML email is automatically sent containing:

- Overall pass/fail status with colour coding
- Total / passed / failed / skipped counts
- Pass rate percentage and total duration
- Per-test table with individual statuses and durations
- Direct link to the GitHub Actions run for full report access

The email service uses `nodemailer` with Gmail SMTP, configured via GitHub Secrets — no proprietary email infrastructure required.

### Unit Testing the Framework Itself

Unlike most QA automation portfolios that only test _applications_, this project also unit-tests its **own framework utilities** using Vitest:

| Test File                          | Coverage                                      |
| ---------------------------------- | --------------------------------------------- |
| `retry.util.test.ts`               | 13 tests — all 3 retry strategies, edge cases |
| `test-data-generator.util.test.ts` | 24 tests — all generator functions            |
| `error.util.test.ts`               | 12 tests — all error handling paths           |

This demonstrates that the automation framework is treated as **production-quality software**, not just a collection of test scripts. Unit tests run inside the CI quality-gate before any E2E shards start, providing fast feedback on regressions.

---

## 5. ISTQB CT-GenAI Competency Mapping

| Syllabus Topic                  | Evidence from This Project                         |
| ------------------------------- | -------------------------------------------------- |
| Agent/Tool-Use Orchestration    | All files generated through AI agent workflows     |
| Prompt Engineering for Testing  | AC-to-code prompt patterns used throughout         |
| LLM-Powered Test Infrastructure | Modular, AI-architected config + controller system |
| Hallucination Risk Mitigation   | Human review and correction pass on all AI output  |
| GenAI Integration into Test Org | Significantly reduced time to test implementation  |

---

## 6. Results

- ✅ 100% of framework code generated by AI agents
- ✅ All AC scenarios automated and E2E-verified
- ✅ Cognitive complexity maintained below threshold (≤15)
- ✅ Parallel sharding pipeline — 3 concurrent GitHub Actions shards
- ✅ HTML email report sent automatically on every CI run
- ✅ Live CI badge on README — pipeline is publicly verifiable
- ✅ 49 unit tests covering framework utilities (retry, data generation, error handling)
- ✅ Zero proprietary data in the public portfolio version

---

_This case study represents a sanitized version of a real-world implementation._  
_For professional inquiries and live demonstrations, please connect on [LinkedIn](https://www.linkedin.com/in/gairik-singha/)._
