---
id: PROF-01-PLAN
wave: 1
depends_on: [AUTH-01-PLAN, AUTH-02-PLAN]
files_modified:
  - app/pages/profile/dependents.tsx
  - app/api/dependents/*
  - app/contexts/UserContext.tsx
autonomous: true
---

# Plan: PROF-01 — Manage Dependents (Profiles)

Objective
- Allow authenticated users to create, read, update, and delete dependent profiles (children, relatives) associated with their account.

Requirements
- Satisfies: PROF-01

Tasks

1) Task: API client for dependents

<read_first>
- `app/api/dependents` — folder (search for existing wrappers)
- `app/types/models/dependent.ts` — dependent DTOs
</read_first>

<action>
- Implement standard CRUD wrappers: `listDependents()`, `createDependent(dto)`, `updateDependent(id, dto)`, `deleteDependent(id)` that call `${ENV.BASE_API_URL}/users/dependents` endpoints.
- Ensure Authorization header includes `Bearer ${authToken}` via existing API client helper.
</action>

<acceptance_criteria>
- Each wrapper returns parsed JSON matching expected DTO shapes; network errors are surfaced as thrown exceptions.
</acceptance_criteria>

2) Task: UI for listing & editing dependents

<read_first>
- `app/pages/profile/dependents.tsx` — existing or new page
- `app/components/DependentForm.tsx` — pattern for small forms (if exists)
</read_first>

<action>
- Implement `Dependents` screen with list, add button, edit modal/form, and delete action.
- Use existing form and validation patterns (zod) and reuse shared `Button` and `Modal` components from `app/components`.
- After any create/update/delete, refresh list and show toast/snackbar on success or error.
</action>

<acceptance_criteria>
- Authenticated user can add a dependent and immediately see it in the list. Editing persists changes and delete removes it from list.
- On network error, a user-friendly message is shown.
</acceptance_criteria>

3) Task: Authorization & traceability

<action>
- Ensure only authorized users can access the Dependents screen (guarded by `UserContext.isAuthenticated`).
- Track events via existing analytics helper (if present) on create/delete actions.
</action>

Verification Notes
- Unit tests for API wrappers using mocked fetch. Basic UI smoke test for add/edit/delete (manual or cypress/expo-e2e later).
