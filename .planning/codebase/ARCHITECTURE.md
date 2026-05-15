---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# ARCHITECTURE — System Architecture Overview

Date: [2026-05-14]

High-level
- Single mobile application built with Expo/React Native. The app is client-only (no server code in this repo) and interacts with a remote REST API.

Architectural Patterns
- Layered client architecture:
  - UI layer: `app/pages/*`, `app/components/*` (screens and presentational components)
  - Navigation: `app/navigation/*` (stacks and tab navigator)
  - Domain / types: `app/types/*` (DTOs, domain types, predicates)
  - API layer: `app/api/*` (thin wrappers around fetch, error handling via `ApiError`)
  - Lib / utils: `app/lib/*` (env validation, async storage, schemas)

Data flow
- Global user state is provided via `app/contexts/UserContext.tsx` and tokens are propagated to API calls.
- Most API calls are simple fetch wrappers that return a `ResponsePayload<T>` and throw `ApiError` on bad responses (see `app/types/domain.ts` and `app/api/*`).

Entry points
- `app/pages/*` contain page-level components; navigation defined in `app/navigation/*` mounts them as screens.

Scalability & Boundaries
- The codebase is structured for a single-app client. If expanding to multiple platforms or micro-frontends, consider extracting API client and domain logic into a `packages/` or `libs/` folder.

Notes / Actionable
- There is no backend code here — verify backend API stability and versioning strategy.
- Consider adding explicit API client layer (e.g., small wrapper around fetch with retries and common headers) to reduce duplication.
