---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# TESTING — Test Strategy and Current State

Date: [2026-05-14]

Current state
- No automated test framework (unit or e2e) detected in repository files scanned (no `jest.config`, `vitest`, or `__tests__` folders found).

CI
- No `.github/workflows` detected in quick scan — CI integration appears absent or defined elsewhere.

Recommendations
- Add a lightweight unit test setup for React Native with `vitest` or `jest` + `@testing-library/react-native`.
- Add simple smoke tests for major screens (e.g., Home, Profile Signup) and a couple of API mocking tests for `app/api/*`.

Notes / Actionable
- If mobile e2e testing is needed, consider `detox` or `playwright` for web targets; start with unit tests to protect refactors.
