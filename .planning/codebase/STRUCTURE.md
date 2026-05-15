---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# STRUCTURE — Directory Layout & Key Files

Date: [2026-05-14]

Top-level layout
- Root:
  - `package.json`, `package-lock.json` — project manifest and lock
  - `app/` — primary application source

Inside `app/`
- `app/pages/` — screen components (e.g. `app/pages/home/index.tsx`, `app/pages/profile/signup.tsx`)
- `app/components/` — reusable components and UI primitives (e.g. `app/components/forms/*`, `app/components/ui/*`)
- `app/navigation/` — navigation configuration and stacks (`TabNavigator.tsx`, `ArticlesStack.tsx`, `ProfileStack.tsx`)
- `app/api/` — fetch wrappers for backend endpoints (`app/api/article/*`, `app/api/user/*`)
- `app/lib/` — utilities, schemas, env validation (`env.ts`, `asyncStorage.ts`, `schemas/*`)
- `app/types/` — DTOs and domain type definitions (`app/types/dtos/*`, `app/types/domain.ts`)

Important files
- `app/lib/env.ts` — runtime environment validation using `zod` (BASE_API_URL required)
- `app/lib/asyncStorage.ts` — local storage helpers using AsyncStorage
- `app/lib/schemas/*` — validation schemas (zod) used by forms

Build / Scripts
- `package.json` scripts target Expo commands and Android/iOS builds (see `package.json` lines under `scripts`).

Notes / Actionable
- The codebase uses absolute imports with `@/` alias. Verify `tsconfig.json` / Metro config exists to support this (not scanned yet).
