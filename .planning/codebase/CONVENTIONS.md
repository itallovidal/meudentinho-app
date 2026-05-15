---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# CONVENTIONS — Coding Conventions & Patterns

Date: [2026-05-14]

Style & Formatting
- Prettier is present as a devDependency (`prettier`, `prettier-plugin-tailwindcss`).
- Tailwind + nativewind for styling; `cn` helper (`app/lib/utils.ts`) and `twMerge` used for class merging.

TypeScript
- Strict typing used in many places: DTOs in `app/types/dtos/*`, zod schemas in `app/lib/schemas/*`.

Error handling
- API wrappers parse `ResponsePayload<T>` and throw `ApiError` when status codes indicate failure (see `app/types/domain.ts` and `app/api/*`).

Imports
- Project uses `@/` path alias (e.g., `import { ENV } from "@/lib/env"`). Ensure tooling supports the alias (`tsconfig.json`, Metro bundler).

Testing
- No test framework files detected (`jest`, `vitest`, etc.). See `TESTING.md` for details.

Notes / Actionable
- Add a `CONTRIBUTING.md` or lint config if you plan to onboard external contributors.
