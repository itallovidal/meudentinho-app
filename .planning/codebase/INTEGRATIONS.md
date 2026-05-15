---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# INTEGRATIONS — External Services & APIs

Date: [2026-05-14]

Overview
- The app communicates with a backend API using `ENV.BASE_API_URL` (see `app/lib/env.ts`).

API Endpoints (client-side calls)
- Articles endpoints:
  - `GET ${ENV.BASE_API_URL}/articles/preview` — used in `app/api/article/getArticles.ts`.
  - `GET ${ENV.BASE_API_URL}/articles/:id` — used in `app/api/article/getArticleById.ts`.
  - `POST ${ENV.BASE_API_URL}/articles` — used in `app/api/article/createNewArticle.ts`.
- User endpoints:
  - `POST ${ENV.BASE_API_URL}/auth/login` — `app/api/user/loginUser.ts`.
  - `POST ${ENV.BASE_API_URL}/auth/signup` — `app/api/user/signupUser.ts`.
  - `GET/POST ${ENV.BASE_API_URL}/users/kids` — `app/api/user/kids.ts`.

Auth
- The client stores an `authToken` in memory/context (`UserContext`) and sends it as `Authorization: Bearer <token>` in API calls (see `app/api/*` usages).

Storage
- Uses device local storage via `@react-native-async-storage/async-storage`. Keys are prefixed with `ENV.LOCAL_STORAGE_KEY_PREFIX` from `app/lib/env.ts` (used in `app/lib/asyncStorage.ts`).

Third-party services
- No explicit payment providers, push-notification providers, or analytics libraries detected in the repo scan.

Notes / Actionable
- Confirm backend contract for the `ResponsePayload<T>` shape used throughout `app/api/*` (see `app/types/domain.ts`).
- Ensure API base URL is provided in the Expo environment (EXPO_PUBLIC_API_BASE_URL) for both dev and production.
