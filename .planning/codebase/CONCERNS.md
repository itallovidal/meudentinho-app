---
last_mapped_commit: "03df835"
---

# CONCERNS — Known Issues, Tech Debt & Risks

Date: [2026-05-19]

Immediate findings
- **No tests detected** — risk for regressions when refactoring (see `TESTING.md`). This remains unresolved.
- Environment variables are strictly validated in `app/lib/env.ts` and will throw if `EXPO_PUBLIC_API_BASE_URL` is missing; ensure CI/dev envs provide this.
- TODO comments present indicating planned/pending work:
  - `app/types/domain.ts` — "TODO: split this in multiple files: one for user, one for articles" (unresolved since last map)
  - `app/components/forms/articleForm.tsx:33` — "TODO: turn into a hook later?" (unresolved since last map)
  - `app/pages/profile/responsible.tsx:14` — "TODO: Criar algum helper para identificar qual método usar PATCH ou PUT conforme as alterações feitas." (**NEW** — PATCH vs PUT decision for user updates is unresolved)

Architecture / Design Debt
- **`patchUser` vs `updateUser` ambiguity:** Two API wrappers (`app/api/user/patchUser.ts`, `app/api/user/updateUser.ts`) exist with the same interface but different HTTP methods. There is no helper yet to decide which to use. Risk of inconsistent mutations. **NEW concern.**
- **React Query retry logic uses `any` cast:** In `app/hooks/useArticles.ts`, the error inside `retry` is cast as `any` to access `.response.status`. This defeats TypeScript strictness. Should use a typed `ApiError` guard.
- **Raw `fetch` still present in some API files:** The migration to `fetch` was done incrementally — verify all `app/api/*` files use `fetch` and no plain `fetch` remains.

Security
- No direct secrets detected in repo scan. Client uses `ENV.BASE_API_URL` and `authToken` flow; ensure tokens are not committed and production secrets are injected via environment provider.
- Auth token is stored in-memory (React Context) — it is lost on app restart (no persistence). If persistence is desired, use `asyncStorage` with appropriate encryption/security measures.

Performance
- App is mobile-first and uses Expo; React Query's `staleTime: 5 min` prevents excessive refetching.
- The `articleListRender.tsx` handles flat lists — monitor performance with large article sets (FlatList virtualization already expected from RN).
- Reanimated carousel (`react-native-reanimated-carousel`) may have performance implications on low-end devices — monitor frame drops.

Maintainability
- Absolute import alias `@/` is confirmed working.
- `app/types/domain.ts` should be split per the existing TODO — it mixes user, article, and generic API types.
- The skeletons layer (`app/skeletons/`) is a good addition but currently has limited coverage — only article-related skeletons exist.

Action items
1. Add tests and CI to catch regressions.
2. Confirm environment provisioning for Expo (EXPO_PUBLIC_API_BASE_URL) for staging/production.
3. Add linting and commit hooks (prettier is present; ESLint recommended).
4. Resolve PATCH vs PUT ambiguity in profile update flow — implement the helper noted in the TODO.
5. Type `ApiError` properly in React Query retry callbacks — remove `any` cast.
6. Audit all `app/api/*` files to confirm `fetch` usage (no plain `fetch` left).
