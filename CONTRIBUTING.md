# Contributing

Thanks for your interest! This is a public portfolio project — contributions that improve the architecture demonstrations or documentation are welcome.

## Getting Started

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in your values
```

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm test`          | Run all tests                   |
| `npm run typecheck` | TypeScript type check           |
| `npm run lint`      | ESLint check                    |
| `npm run format`    | Prettier format                 |
| `npm run validate`  | Typecheck + lint + format check |

## Code Style

- **TypeScript strict mode** — no `any`, no unchecked index access
- **ESLint + Prettier** configured — run `npm run validate` before committing
- **EditorConfig** — ensure your editor respects `.editorconfig` settings

## Branch & PR Conventions

- Branch from `main`
- Name branches: `feat/`, `fix/`, `docs/`
- Keep PRs focused on a single concern

## Architecture Principles

This project follows **Clean Architecture**. When adding new code:

- **Domain layer** (`src/domain/`) — no external imports, only TypeScript primitives
- **Infrastructure layer** — implements domain interfaces; only place Playwright is imported
- **Locators** — CSS/role selectors only, no interaction logic
- **Pages (POM)** — interaction logic only, no assertions
- **Helpers/Controllers** — orchestration only, calls POM methods
- **Tests** — call one controller function; no direct page interaction
