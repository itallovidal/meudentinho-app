---
last_mapped_commit: "$(git rev-parse --short HEAD)"
---

# STACK — Technology Stack (mapped)

Date: [2026-05-14]

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
- TypeScript (devDependency `typescript`)
- Expo SDK (~54.0.33) — scripts: `start`, `android`, `ios`, `web` in `package.json`.
- Prettier configured as devDependency; `prettier-plugin-tailwindcss` present.

Key Libraries
- Navigation: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` — entry points in `app/navigation/*` (e.g. `app/navigation/TabNavigator.tsx`).
- Forms & validation: `react-hook-form`, `@hookform/resolvers`, `zod` (schemas in `app/lib/schemas/*`).
- Async storage: `@react-native-async-storage/async-storage` (used in `app/lib/asyncStorage.ts`).
- UI icons: `phosphor-react-native`.

Configuration
- Environment variables validated using `zod` in `app/lib/env.ts` — expects `EXPO_PUBLIC_API_BASE_URL` (mapped to `ENV.BASE_API_URL`).

Notes / Actionable
- Mobile-first codebase (Expo). Build/release flows use Android Gradle scripts referenced in `package.json` scripts.
- Network requests target a backend via `ENV.BASE_API_URL` — check CI / secrets management for API base URL injection.
