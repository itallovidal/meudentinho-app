---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# CONCERNS — Known Issues, Tech Debt & Risks

Date: [2026-05-14]

Immediate findings
- No tests detected — risk for regressions when refactoring (see `TESTING.md`).
- Environment variables are strictly validated in `app/lib/env.ts` and will throw if `EXPO_PUBLIC_API_BASE_URL` is missing; ensure CI/dev envs provide this. File: `app/lib/env.ts`.
- TODO comments present indicating planned refactors:
  - `app/types/domain.ts` — "TODO: split this in multiple files"
  - `app/pages/home/index.tsx` — "TODO: create better modals"
  - `app/components/forms/articleForm.tsx` — "TODO: turn into a hook later?"

Security
- No direct secrets detected in repo scan. Client uses `ENV.BASE_API_URL` and `authToken` flow; ensure tokens are not committed and production secrets are injected via environment provider.

Performance
- App is mobile-first and uses Expo; no obvious performance anti-patterns found in quick scan, but pay attention to large images or unoptimized list rendering in article lists.

Maintainability
- Absolute import alias `@/` must be supported by tooling (tsconfig, metro).
- Consider extracting shared API client logic to centralize error handling and headers.

Action items
1. Add tests and CI to catch regressions.
2. Confirm environment provisioning for Expo (EXPO_PUBLIC_API_BASE_URL) for staging/production.
3. Add linting and commit hooks (prettier is present; ESLint recommended).
