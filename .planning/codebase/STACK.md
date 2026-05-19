---
last_mapped_commit: "03df835"
---

# STACK — Technology Stack (mapped)

Date: [2026-05-19]

Summary
- Primary platform: React Native (Expo) mobile application
- Language: TypeScript
- UI: React + React Native + Expo
- Styling: Tailwind (nativewind) + Tailwind plugins

Evidence
- `package.json` (root) — dependencies: `expo`, `react`, `react-native`, `nativewind`, `tailwindcss`.
  - Path: `package.json`
- App source under `app/` — TSX and TS files (e.g. `app/pages/home/index.tsx`, `app/navigation/TabNavigator.tsx`).

Runtime & Tooling
- TypeScript (~5.9.2)
- Expo SDK (~54.0.33) — scripts: `start`, `android`, `ios`, `web` in `package.json`.
- Prettier configured as devDependency; `prettier-plugin-tailwindcss` present.

Key Libraries
- **Data fetching & caching:** `@tanstack/react-query` ^5.100.10 — **NEW since last map**. `QueryClient` is instantiated in `App.tsx` and wraps the entire tree via `QueryClientProvider`. Default `staleTime: 5 min`.
- Navigation: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` — entry points in `app/navigation/*`.
- Forms & validation: `react-hook-form`, `@hookform/resolvers`, `zod` (schemas in `app/lib/schemas/*`).
- Async storage: `@react-native-async-storage/async-storage` 2.2.0 (used in `app/lib/asyncStorage.ts`).
- UI icons: `phosphor-react-native`.
- Primitives: `@rn-primitives/checkbox`, `@rn-primitives/dialog` (**NEW**), `@rn-primitives/popover`, `@rn-primitives/portal`, `@rn-primitives/progress` (**NEW**), `@rn-primitives/separator`, `@rn-primitives/slot`.
- Animations: `react-native-reanimated` ~4.1.1, `react-native-gesture-handler` ~2.28.0, `react-native-reanimated-carousel`.
- Graphics: `react-native-svg` 15.12.1, `expo-linear-gradient`.
- Calendar: `react-native-calendars`.
- Markdown rendering: `react-native-remark`.

Configuration
- Environment variables validated using `zod` in `app/lib/env.ts` — expects `EXPO_PUBLIC_API_BASE_URL` (mapped to `ENV.BASE_API_URL`).
- `LOCAL_STORAGE_KEY_PREFIX` also required (used in `app/lib/asyncStorage.ts`).

Notes / Actionable
- Mobile-first codebase (Expo). Build/release flows use Android Gradle scripts referenced in `package.json` scripts.
- Network requests now use `fetchWithTimeout` (5 s default) — see `app/lib/apiClient.ts`.
- React Query is now the standard data-fetching layer; raw `fetch` calls should be migrated to use this pattern.
