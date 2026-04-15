# Contributing to Vellor

Thank you for your interest in contributing to **Vellor**! Contributions of all kinds are welcome — whether it's a bug fix, a new feature, improved documentation, or additional test coverage.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Fork & Clone](#fork--clone)
- [Branch Naming](#branch-naming)
- [Making Changes](#making-changes)
- [Running Tests](#running-tests)
- [Commit Style](#commit-style)
- [Pull Request Checklist](#pull-request-checklist)
- [Code of Conduct](#code-of-conduct)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | `≥ 18.x` (LTS) | JavaScript runtime |
| [npm](https://www.npmjs.com/) | `≥ 9.x` | Package manager (bundled with Node.js) |

---

## Fork & Clone

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

```bash
git clone https://github.com/<your-username>/vellor.git
cd vellor
```

3. **Add the upstream remote** so you can keep your fork in sync:

```bash
git remote add upstream https://github.com/dhaatrik/vellor.git
```

4. **Install dependencies:**

```bash
npm install
```

5. **Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Branch Naming

Create a new branch for every contribution. Use the following naming conventions:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-description>` | `feature/bulk-export` |
| Bug Fix | `fix/<short-description>` | `fix/calendar-drag-drop` |
| Documentation | `docs/<short-description>` | `docs/update-readme` |
| Tests | `test/<short-description>` | `test/pdf-generation` |
| Refactor | `refactor/<short-description>` | `refactor/store-slices` |

```bash
git checkout -b feature/your-feature-name
```

---

## Making Changes

- Follow the existing **TypeScript** conventions and code style.
- Keep components **focused and reusable**.
- Avoid introducing new external dependencies without prior discussion in an issue.
- All user-facing strings should be sanitized via the existing `sanitizeString` utility.
- Run `npm run lint` to verify type correctness before committing:

```bash
npm run lint
```

---

## Running Tests

All test files live in `store/tests/`. Run the full test suite:

```bash
npm run test
```

To run tests in watch mode during development:

```bash
npx vitest
```

To verify the production build compiles successfully:

```bash
npm run build
```

---

## Commit Style

Vellor follows the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

**Format:**

```
<type>(<optional scope>): <short summary>
```

**Types:**

| Type | Use When |
|------|----------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `refactor` | Code refactoring (no feature change, no bug fix) |
| `chore` | Build process, tooling, dependency updates |
| `style` | Formatting, whitespace (no logic change) |

**Examples:**

```bash
git commit -m "feat(pdf): add progress report template"
git commit -m "fix(store): correct overpaid status calculation"
git commit -m "docs: update project structure in README"
git commit -m "test(helpers): add edge cases for formatCurrency"
```

---

## Pull Request Checklist

Before opening a PR, confirm that:

- [ ] Your branch is up to date with `upstream/main`
- [ ] `npm run lint` passes with **zero errors**
- [ ] `npm run test` passes with **all tests green**
- [ ] `npm run build` completes successfully
- [ ] Your PR description explains **what** changed and **why**
- [ ] Each PR addresses **one feature or fix** (keep PRs small and focused)
- [ ] New functionality is accompanied by relevant tests

---

## Code of Conduct

This project adheres to a standard [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold a respectful and inclusive environment for all contributors.

---

**Thank you for contributing to Vellor! 🎓**
