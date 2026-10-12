---
id: AUTH-02-PLAN
wave: 1
depends_on: [AUTH-01-PLAN]
files_modified:
  - app/contexts/UserContext.tsx
  - app/lib/asyncStorage.ts
autonomous: true
---

# Plan: AUTH-02 — Session Persistence

Objective
- Ensure user sessions persist across app restarts and are invalidated on logout.

Requirements
- Satisfies: AUTH-02

Tasks

1) Task: Persist token in AsyncStorage upon login/signup

<read_first>
- `app/lib/asyncStorage.ts` — helper functions
- `app/contexts/UserContext.tsx` — where auth state is managed
</read_first>

<action>
- On successful authentication flows, call `setLocalStorageItem('authToken', token)` using the `ENV.LOCAL_STORAGE_KEY_PREFIX` helper to form the key (see `app/lib/asyncStorage.ts`).
- Implement `removeLocalStorageItem('authToken')` on logout.
</action>

<acceptance_criteria>
- After login, AsyncStorage contains a key starting with `@meudentinho` (default prefix from `app/lib/env.ts`) and the token value matches the returned token.
- After logout action, AsyncStorage no longer contains the auth token key.
</acceptance_criteria>

2) Task: Restore session on app boot

<read_first>
- `app/contexts/UserContext.tsx`
- `app/lib/env.ts`
</read_first>

<action>
- On app start (UserContext mount), read `getLocalStorageItem('authToken')`; if present, set `authToken` in context and attempt a `GET ${ENV.BASE_API_URL}/auth/validate` or a lightweight `healthcheck` to confirm validity. If invalid, clear token and prompt login.
</action>

<acceptance_criteria>
- When AsyncStorage contains a valid token, app initializes into authenticated state without navigating to login. If token is invalid, app clears token and shows login screen.
</acceptance_criteria>
