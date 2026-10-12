---
last_mapped_commit: "03df835"
---

# ARCHITECTURE — System Architecture Overview

Date: [2026-05-19]

High-level
- Single mobile application built with Expo/React Native. The app is client-only (no server code in this repo) and interacts with a remote REST API.

Architectural Patterns
- Layered client architecture:
  - UI layer: `app/pages/*`, `app/components/*` (screens and presentational components)
  - Navigation: `app/navigation/*` (stacks and tab navigator)
  - Domain / types: `app/types/*` (DTOs, domain types, predicates, teeth types)
  - API layer: `app/api/*` (thin wrappers around `fetch`, error handling via `ApiError`)
  - Data fetching / caching: `app/hooks/useArticles.ts` — **React Query** used as the standard async state manager (migrated from manual state, as of commit `a34e3f0`)
  - Lib / utils: `app/lib/*` (env validation, async storage, apiClient, schemas, theme, utils)
  - Skeletons: `app/skeletons/*` — **NEW layer** — dedicated skeleton/loading-state components organized by `components/` and `pages/` sub-folders

Data flow
- Global user state is provided via `app/contexts/UserContext.tsx` and tokens are propagated to API calls.
- **React Query** (`@tanstack/react-query`) handles server-state caching and background refresh. `QueryClient` is configured in `App.tsx` with a global `staleTime: 5 min`. Queries are invalidated and refetched via `useQueryClient` in hooks (e.g. `app/hooks/useArticles.ts`).
- Most API calls are `fetch` wrappers that return a `ResponsePayload<T>` and throw `ApiError` on bad responses (see `app/types/domain.ts` and `app/api/*`).
- Article state was **lifted from `articleListSection.tsx` to page-level components** (`app/pages/home/index.tsx`, `app/pages/articles/index.tsx`), with the `useArticles` hook returning `articles.slice(1)` to automatically exclude the latest article from the list (banner stays separate).

Entry points
- `App.tsx` — root component; wraps tree in `GestureHandlerRootView`, `QueryClientProvider`, `SafeAreaProvider`, `IconContext.Provider`, `UserProvider`, and `PortalHost`.
- `app/pages/*` contain page-level components; navigation defined in `app/navigation/*` mounts them as screens.

Scalability & Boundaries
- The codebase is structured for a single-app client. If expanding to multiple platforms or micro-frontends, consider extracting API client and domain logic into a `packages/` or `libs/` folder.
- The Dialog-based modal pattern (`app/components/ui/dialog.tsx`) replaces ad-hoc modals; `ToothEventModal.tsx` was migrated to use it.

Notes / Actionable
- There is no backend code here — verify backend API stability and versioning strategy.
- Guest user flow is now handled at the navigation level in `app/navigation/ProfileStack.tsx` (improved in commit `05deefd`).
