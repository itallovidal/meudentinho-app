---
last_mapped_commit: "03df835"
---

# INTEGRATIONS — External Services & APIs

Date: [2026-05-19]

Overview
- The app communicates with a backend API using `ENV.BASE_API_URL` (see `app/lib/env.ts`).
- All HTTP calls go through `fetchWithTimeout` (5 s abort timeout) defined in `app/lib/apiClient.ts`.

API Endpoints (client-side calls)
- Articles endpoints:
  - `GET ${ENV.BASE_API_URL}/articles/preview` — used in `app/api/article/getAllArticles.ts`.
  - `GET ${ENV.BASE_API_URL}/articles/:id` — used in `app/api/article/getArticleById.ts`.
  - `GET ${ENV.BASE_API_URL}/articles/categories` — used in `app/api/article/getAllCategories.ts` (**NEW**).
  - `POST ${ENV.BASE_API_URL}/articles` — used in `app/api/article/createNewArticle.ts`.
- User endpoints:
  - `POST ${ENV.BASE_API_URL}/auth/login` — `app/api/user/loginUser.ts`.
  - `POST ${ENV.BASE_API_URL}/auth/signup` — `app/api/user/signupUser.ts`.
  - `GET/POST ${ENV.BASE_API_URL}/users/kids` — `app/api/user/kids.ts`.
  - `PATCH ${ENV.BASE_API_URL}/users/:id` — `app/api/user/patchUser.ts` (**NEW**).
  - `PUT ${ENV.BASE_API_URL}/users/:id` — `app/api/user/updateUser.ts` (**NEW**).
- Smile/Dental endpoints:
  - Defined in `app/api/smile/index.ts` (**NEW**).

Auth
- The client stores an `authToken` in memory/context (`UserContext`) and sends it as `Authorization: Bearer <token>` in API calls (see `app/api/*` usages).

Storage
- Uses device local storage via `@react-native-async-storage/async-storage`. Keys are prefixed with `ENV.LOCAL_STORAGE_KEY_PREFIX` from `app/lib/env.ts` (used in `app/lib/asyncStorage.ts`).

Third-party services
- No explicit payment providers, push-notification providers, or analytics libraries detected in the repo scan.

Notes / Actionable
- Confirm backend contract for the `ResponsePayload<T>` shape used throughout `app/api/*` (see `app/types/domain.ts`).
- Ensure API base URL is provided in the Expo environment (EXPO_PUBLIC_API_BASE_URL) for both dev and production.
- New `patchUser` vs `updateUser` have the same signature — a TODO in `app/pages/profile/responsible.tsx` flags the need for a helper to decide which method to use (PATCH vs PUT).
