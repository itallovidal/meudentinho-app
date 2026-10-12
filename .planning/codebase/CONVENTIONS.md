---
last_mapped_commit: "03df835"
---

# CONVENTIONS — Coding Conventions & Patterns

Date: [2026-05-19]

Style & Formatting
- Prettier is present as a devDependency (`prettier`, `prettier-plugin-tailwindcss`).
- Tailwind + nativewind for styling; `cn` helper (`app/lib/utils.ts`) and `twMerge` used for class merging.
- `class-variance-authority` (CVA) used in UI primitives (e.g. `app/components/ui/button.tsx`) for variant management.

TypeScript
- Strict typing used in many places: DTOs in `app/types/dtos/*`, zod schemas in `app/lib/schemas/*`.
- **DTO naming convention changed:** suffix migrated from `DTO` → **`Request`** (e.g. `LoginUserRequest`). File: `app/types/dtos/user.ts`.

Data Fetching Pattern (updated)
- **Standard pattern is now React Query** via `@tanstack/react-query`.
  - Queries use `queryKey` arrays (`["articles-preview"]`, `["article-categories"]`).
  - `staleTime: 1000 * 60 * 5` (5 min) set globally in `App.tsx` and overridable per query.
  - Refreshing done by `queryClient.invalidateQueries` + `queryClient.refetchQueries` (see `app/hooks/useArticles.ts`).
  - Retry logic per query: 404 → no retry; other errors → retry up to `MAX_ATTEMPTS`.
- **HTTP client:** All API calls must use `fetch` from `app/lib/apiClient.ts` (5 s timeout, AbortController). Raw `fetch` is deprecated internally.

Error Handling
- API wrappers parse `ResponsePayload<T>` and throw `ApiError` when status codes indicate failure (see `app/types/domain.ts` and `app/api/*`).
- Timeout errors surface a user-facing Portuguese message: "A requisição demorou muito e foi cancelada."

Component Patterns
- **Modal pattern:** Dialogs use `app/components/ui/dialog.tsx` (backed by `@rn-primitives/dialog` + `PortalHost`). Ad-hoc modals should be migrated to this pattern. `ToothEventModal` already migrated.
- **Skeleton pattern:** Loading states have dedicated skeleton components in `app/skeletons/` (separated from production components). E.g. `app/skeletons/components/skeletonArticleBanner.tsx`.
- **State lifting:** Data fetching state is lifted to page-level components; presentational components receive data as props. `articleListSection.tsx` is now a pure presentational component (no hook calls).
- **Latest article exclusion:** `useArticles` returns `articles.slice(1)` to exclude the banner article from the list. `latestArticle` is exposed separately as `articles.at(0)`.

Imports
- Project uses `@/` path alias (e.g., `import { ENV } from "@/lib/env"`). Confirmed working via `tsconfig.json` + Metro config.

Notes / Actionable
- Add a `CONTRIBUTING.md` or ESLint config if you plan to onboard external contributors.
- A TODO exists in `app/pages/profile/responsible.tsx` for a helper to decide PATCH vs PUT method.
