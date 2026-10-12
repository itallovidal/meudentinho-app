---
last_mapped_commit: "03df835"
---

# TESTING — Test Strategy and Current State

Date: [2026-05-19]

Current state
- No automated test framework (unit or e2e) detected in repository files (no `jest.config`, `vitest`, or `__tests__` folders).
- No test files found alongside source files (`*.test.ts`, `*.spec.tsx`).

CI
- `.github/` exists but contains only `copilot-instructions.md` and an `instructions/` folder — no `workflows/` CI pipelines found. CI is effectively absent.

Skeletons as a Testability Signal
- The new `app/skeletons/` layer shows intentional separation of loading states from production UI — this is a positive sign for future component-level testing (easier to test components without network state).

Recommendations
- Add a lightweight unit test setup for React Native with `vitest` or `jest` + `@testing-library/react-native`.
- With React Query now in place, consider mocking the query layer for component tests using `@tanstack/react-query`'s `QueryClientProvider` test helpers.
- Priority test targets:
  1. `app/hooks/useArticles.ts` — test query keys, stale time, retry logic, and `latestArticle` slicing.
  2. `app/lib/apiClient.ts` — test `fetch` abort behavior.
  3. `app/components/article/*` — snapshot + interaction tests for `articleCard` and `articleBanner`.
  4. Auth forms: `loginForm`, `signupForm` — zod schema validation paths.

Notes / Actionable
- If mobile e2e testing is needed, consider `detox` for native or `playwright` for web targets.
- React Query integration greatly simplifies async testing — queries can be pre-populated with `initialData` in tests without real network calls.
