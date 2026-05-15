# Research: ARCHITECTURE

Date: [2026-05-14]

Typical architecture for a mobile-first dental tracking app

- Mobile client (Expo/React Native)
  - Screens: home, child profile, timeline, record event, articles, admin
  - Local cache & offline support (AsyncStorage)
- Backend (external REST API)
  - Auth endpoints (login/signup/token)
  - CRUD for children and events
  - Content management endpoints for articles
  - Webhook or export endpoints for clinic integration (future)

Data flow
- Client authenticates → fetches user/children data → displays timeline → records events locally and POSTs to API.

Component boundaries (client)
- UI / Presentation: `app/pages/*`, `app/components/*`
- Navigation: `app/navigation/*`
- API layer: `app/api/*` (thin fetch wrappers)
- Domain types & validation: `app/types/*`, `app/lib/schemas/*`

Suggested build order for v1
1. Auth + basic user flows (AUTH-01)
2. Child profiles CRUD (PROF-01)
3. Event model & record UI (TEETH-01)
4. Timeline/history view (HIST-01)
5. Alerts & simple predictions (ALRT-01, PRED-01)
6. Articles/content and admin panel (CONTENT-01, ADMIN-01)
