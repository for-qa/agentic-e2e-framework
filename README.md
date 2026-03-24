# 🚀 Agentic E2E Framework

> **Enterprise-grade Playwright + TypeScript automation framework built 100% through AI Agent Orchestration.**
> Sanitized for public portfolio — all domain data replaced with generic examples. See [CASE_STUDY.md](./CASE_STUDY.md) for full context.

![CI](https://github.com/for-qa/agentic-e2e-framework/actions/workflows/playwright.yml/badge.svg)
[![Live Report](https://img.shields.io/badge/Playwright_Report-Live-2EAD33?style=flat&logo=playwright&logoColor=white)](https://for-qa.github.io/agentic-e2e-framework/)


---

## 🤖 How It Was Built

This entire framework — architecture, interfaces, controllers, page objects, and CI pipeline — was **designed and implemented using AI Agents**. The developer acted as a **Principal AI Orchestrator**: writing structured prompts, reviewing agent output, and correcting hallucinations.

> See [CASE_STUDY.md](./CASE_STUDY.md) for the full agentic development process and ISTQB CT-GenAI competency mapping.

---

## 🏗️ Architecture

Clean Architecture with strict layer separation. Each layer depends only on the one below it — never upward.

```
agentic-e2e-framework/
│
├── src/
│   ├── domain/                          # 🔵 Core contracts (no external deps)
│   │   ├── interfaces/
│   │   │   ├── page.interface.ts        # IPage, ILocator — browser abstraction
│   │   │   ├── logger.interface.ts      # ILogger — logging contract
│   │   │   ├── config-service.interface.ts
│   │   │   └── locator-resolver.interface.ts
│   │   └── errors/
│   │       └── test-execution.error.ts  # 9 typed domain error classes
│   │
│   ├── infrastructure/                  # 🟡 Concrete implementations
│   │   ├── adapters/
│   │   │   └── playwright-page.adapter.ts  # Wraps Playwright → IPage/ILocator
│   │   ├── implementations/
│   │   │   ├── logger.implementation.ts
│   │   │   ├── config.implementation.ts
│   │   │   └── locator-resolver.implementation.ts
│   │   └── di/
│   │       ├── service.container.ts     # Lightweight DI container
│   │       └── di.bootstrap.ts          # Wires all services at startup
│   │
│   ├── models/                          # 🟢 Shared TypeScript types
│   │   ├── test-suite.type.ts           # TestSuiteConfiguration, metadata
│   │   ├── aria-role.type.ts            # Exhaustive ARIA role union
│   │   └── view-mode.type.ts
│   │
│   ├── locators/                        # 🟠 CSS/role selector maps
│   │   ├── common/navigation.locator.ts
│   │   └── records/
│   │       ├── records-table.locator.ts
│   │       └── record-drawer.locator.ts
│   │
│   ├── pages/                           # 🔴 Page Object Models (POM)
│   │   ├── common/navigation.page.ts
│   │   └── records/
│   │       ├── records-table.page.ts
│   │       └── record-drawer.page.ts
│   │
│   ├── helpers/                         # 🟣 Test controllers (orchestration)
│   │   └── records/controllers/
│   │       └── update-all-fields.controller.ts
│   │
│   ├── config/                          # ⚙️  Suite & test configurations
│   │   └── records/suites/
│   │       └── record-update-suites.config.ts
│   │
│   └── utils/                           # 🔧 Shared utilities
│       ├── error.util.ts
│       ├── wait.util.ts
│       └── test-data-generator.util.ts
│
├── tests/
│   ├── e2e/
│   │   └── cases/
│   │       ├── smoke-demo.case.ts           # @shard-1 / @shard-2 — runs in CI against public demo app
│   │       └── records/
│   │           ├── update-all-fields.case.ts   # Full CRUD field update (@shard-3)
│   │           └── login-validation.case.ts     # Auth boundary tests
│   └── unit/                            # Vitest unit tests — framework utilities
│       ├── retry.util.test.ts           # 13 tests: backoff, fixed-delay, conditional
│       ├── test-data-generator.util.test.ts  # 24 tests: strings, dates, emails, refs
│       └── error.util.test.ts           # 12 tests: getErrorMessage, ensureError
│
├── scripts/
│   ├── ci/
│   │   └── run-shard.sh                 # Universal shard runner for CI
│   └── email/
│       ├── email-report.ts              # Sends HTML report via Gmail SMTP
│       └── email-template.ts            # Responsive HTML email template
│
├── global-setup.ts                      # Auth state bootstrap (runs once)
├── playwright.config.ts
├── .env.example
├── CASE_STUDY.md
└── .github/workflows/playwright.yml     # CI/CD pipeline (parallel sharding + email)
```

---

## ⚙️ Key Technical Highlights

| Feature                   | Implementation                                                                  |
| ------------------------- | ------------------------------------------------------------------------------- |
| **Clean Architecture**    | 8 strict layers — domain → infra → pages → tests                                |
| **Dependency Inversion**  | All page objects depend on `IPage`, never Playwright directly                   |
| **Typed Error Hierarchy** | 9 domain error classes for precise catch blocks                                 |
| **DI Container**          | Lightweight service container wired at startup                                  |
| **Auth State Caching**    | `global-setup.ts` saves session per user — tests skip login                     |
| **Suite Configuration**   | Declarative `TestSuiteConfiguration` drives execution order, retries, sharding  |
| **Snapshot Testing**      | Capture → Update → Assert → Revert → Assert pattern                             |
| **Test Data Factory**     | Randomised, collision-free test data generators                                 |
| **Retry Strategies**      | `retryWithBackoff`, `retryWithFixedDelay`, `retryConditionally` utilities       |
| **Performance Benchmark** | `PerformanceBenchmark` class measures FCP, LCP, API timing, saves JSON reports  |
| **Unit Tests (Vitest)**   | 49 unit tests for framework utilities — CI-verified with 80% coverage threshold |
| **Agent-Built**           | 100% AI Agent Orchestration                                                     |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in BASE_URL and user credentials
```

### 3. Run tests

```bash
# E2E tests (requires .env with BASE_URL + credentials)
npm test                  # All E2E tests (Chromium)
npm run test:records      # Records domain only
npm run test:smoke        # Demo smoke suite (no credentials needed)

# Unit tests (no dependencies needed)
npm run test:unit         # Run all 49 Vitest unit tests
npm run test:unit:watch   # Watch mode during development
npm run test:unit:coverage  # Coverage report (80% thresholds)
```

### 4. View report

```bash
npm run report
```

---

## 📋 ISTQB CT-GenAI Competency Mapping

| Syllabus Topic                  | Evidence                                          |
| ------------------------------- | ------------------------------------------------- |
| Agent/Tool-Use Orchestration    | All files generated through AI agent workflows    |
| Prompt Engineering for Testing  | AC-to-code prompt patterns used throughout        |
| LLM-Powered Test Infrastructure | AI-architected modular config + controller system |
| Hallucination Risk Mitigation   | Human review and correction on all AI output      |
| GenAI Integration into Test Org | Significantly reduced time to implementation      |

---

## 🔒 Security Note

- All real URLs, credentials, and company identifiers have been removed.
- Copy `.env.example` → `.env` and fill in your values. **Never commit a real `.env` file.**

---

## Support & Recognition

If you find this project helpful and want to support its continued development, the best way is through **recognition**:

1. **Attribution:** Please keep the original copyright notices intact in the code. If you use this tool or its code in a public project, a shoutout or a link back to this repository is highly appreciated!
2. **Contribute Code:** We welcome pull requests! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help build this tool.
3. **Star the Repo:** Giving the project a ⭐️ on GitHub helps others find it and gives the author recognition.

## License

This project is licensed under the [MIT License](LICENSE). 

Under the MIT License, anyone who uses, copies, or modifies this code must include your original copyright notice, ensuring you always receive credit for your work.

---

_For professional inquiries, connect on [LinkedIn](https://www.linkedin.com/in/gairik-singha/)._
