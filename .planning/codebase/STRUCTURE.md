---
last_mapped_commit: "03df835"
---

# STRUCTURE — Directory Layout & Key Files

Date: [2026-05-19]

Top-level layout
- Root:
  - `package.json`, `package-lock.json` — project manifest and lock
  - `App.tsx` — application root; mounts providers and navigation
  - `app/` — primary application source
  - `assets/` — static assets (images, fonts)
  - `global.css` — NativeWind global CSS entry point

Inside `app/`
```
app/
├── api/
│   ├── article/          — getAllArticles.ts, getAllCategories.ts, getArticleById.ts, createNewArticle.ts
│   ├── smile/            — index.ts  [NEW]
│   ├── user/             — loginUser.ts, signupUser.ts, kids.ts, patchUser.ts [NEW], updateUser.ts [NEW]
│   └── healthcheck.ts
├── components/
│   ├── article/          — articleBanner.tsx, articleCard.tsx, articleListRender.tsx, articleListSection.tsx  [reorganized]
│   ├── forms/            — loginForm.tsx, profileForm.tsx, articleForm.tsx, updateResponsibleForm.tsx [NEW]
│   ├── smile/            — DentalMap.tsx, DentalTipCard.tsx [NEW], PredictionsCard.tsx [NEW], RecentEventsList.tsx [NEW], TeethExchangeCard.tsx, ToothEventModal.tsx
│   │   └── teeth/        — tooth-level SVG/components
│   ├── ui/               — badge, button, dialog.tsx [NEW], input, popover, progress.tsx [NEW], separator, skeleton, text, textarea, native-only-animated-view
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── formInput.tsx
│   ├── header.tsx
│   └── wrapper.tsx
├── contexts/
│   └── UserContext.tsx
├── hooks/
│   └── useArticles.ts    — React Query-based hook (migrated from useState)
├── lib/
│   ├── apiClient.ts      — fetch utility  [NEW]
│   ├── asyncStorage.ts
│   ├── env.ts
│   ├── schemas/          — zod schemas for forms
│   ├── theme.ts
│   └── utils.ts
├── navigation/
│   ├── ArticlesStack.tsx
│   ├── ProfileStack.tsx  — guest flow handling improved
│   ├── SmileStack.tsx
│   ├── TabNavigator.tsx
│   └── types.ts
├── pages/
│   ├── articles/         — index.tsx
│   ├── home/             — index.tsx
│   ├── profile/          — index.tsx, login.tsx, signup.tsx, responsible.tsx [NEW]
│   └── smile/            — index.tsx
├── skeletons/            — [NEW top-level layer]
│   ├── components/       — skeletonArticleBanner.tsx, skeletonArticleListRender.tsx
│   └── pages/            — skeletonArticleListPage.tsx
└── types/
    ├── domain.ts         — ResponsePayload<T>, ApiError, shared domain types
    ├── dtos/             — article.ts, user.ts (renamed to *Request convention), api.ts
    ├── predicates.ts
    ├── teeth.ts          — teeth domain types
    └── global.d.ts
```

Important files
- `App.tsx` — root providers: GestureHandlerRootView → QueryClientProvider → SafeAreaProvider → IconContext → UserProvider → PortalHost
- `app/lib/env.ts` — runtime environment validation using `zod`
- `app/lib/apiClient.ts` — `fetch` with 5 s AbortController timeout  [NEW]
- `app/lib/asyncStorage.ts` — local storage helpers
- `app/lib/theme.ts` — centralized theme tokens
- `app/lib/schemas/*` — zod validation schemas used by forms

Build / Scripts
- `package.json` scripts target Expo commands and Android/iOS builds.
- APK build: `npm run android:apk:preview` (prebuild + Gradle assembleRelease).

Notes / Actionable
- The `@/` absolute import alias is confirmed working via `tsconfig.json` + Metro config.
- DTOs in `app/types/dtos/user.ts` were renamed from DTO suffix to **Request** naming convention (e.g. `LoginUserRequest`).
