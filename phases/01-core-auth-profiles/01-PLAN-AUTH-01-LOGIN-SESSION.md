---
id: AUTH-01-PLAN
wave: 1
depends_on: []
files_modified:
  - app/api/user/loginUser.ts
  - app/contexts/UserContext.tsx
  - app/pages/profile/signup.tsx
autonomous: true
---

# Plan: AUTH-01 — Signup, Login, Session Persistence

Objective
- Enable users to create an account with email/password, log in, and keep sessions persistent across app restarts.

Requirements
- Satisfies: AUTH-01 (from .planning/REQUIREMENTS.md)

Tasks

1) Task: Implement signup endpoint client & UI

<read_first>
- `app/api/user/signupUser.ts` — existing API wrapper
- `app/pages/profile/signup.tsx` — signup screen
- `app/types/dtos/user.ts` — SignupRequest definition
</read_first>

<action>
- Add client-side validation using `zod` via existing schema patterns in `app/lib/schemas`.
- Ensure `signupUser` POSTs to `${ENV.BASE_API_URL}/auth/signup` with `SignupRequest` payload.
- On successful signup, call `updateAppUser(basicUser, data.token)` (see `app/pages/profile/signup.tsx`) to store user and token in `UserContext`.
</action>

<acceptance_criteria>
- Running the signup flow with a valid payload returns 201 from the mocked API and `updateAppUser` is called with a token value (simulate in unit test or mock server).
- `app/pages/profile/signup.tsx` navigation resets to `Index` after signup (see existing reset). Verify by unit-test that navigation.reset was invoked with route `Index`.
</acceptance_criteria>

2) Task: Implement login flow and token storage

<read_first>
- `app/api/user/loginUser.ts` — login wrapper
- `app/contexts/UserContext.tsx` — user auth provider
- `app/lib/asyncStorage.ts` — async storage helpers
</read_first>

<action>
- Implement `loginUser` call on the login screen (`app/pages/profile/login.tsx`) to POST to `${ENV.BASE_API_URL}/auth/login` and receive `UserAuthResponseDTO` (token, name, isAdmin).
- On successful login, call `updateAppUser` to set user and token in `UserContext` and persist token in AsyncStorage using `setLocalStorageItem('authToken', token)`.
- Ensure `UserContext` reads persisted token on startup and restores session by loading stored token from AsyncStorage in initialization code path.
</action>

<acceptance_criteria>
- After login with valid credentials, `ENV.BASE_API_URL` call returns 200 and UI navigates to the home screen; token is stored in AsyncStorage under key `${ENV.LOCAL_STORAGE_KEY_PREFIX}_authToken` (verify via test or debug run).
- App restart simulation restores session: when AsyncStorage contains the token, `UserContext` exposes `authToken` and authenticated screens are accessible without re-login.
</acceptance_criteria>

Verification Notes
- Provide unit tests for `loginUser`/`signupUser` wrappers with mocked fetch responses.
- Provide an integration smoke test that simulates signup → login → session restore (manual or automated).
