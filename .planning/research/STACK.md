# Research: STACK

Date: [2026-05-14]

Summary (brief)
- Mobile client: Expo (React Native) — matches current repo (package.json shows Expo ~54)
- Language: TypeScript
- Navigation: React Navigation (`@react-navigation/native`, stacks/tabs)
- Forms: `react-hook-form` + `zod` for validation
- Storage: AsyncStorage for local cache/state

Rationale
- Expo accelerates development, supports iOS/Android and web, and aligns with an existing codebase structure.

Recommendations (v1 stack)
- Expo + React Native (continue)
- TypeScript for safety
- React Navigation for routing
- `react-hook-form` + `zod` for form handling and validation
- AsyncStorage for local persistence; consider optional sync to backend

Files referenced
- `package.json`
- `app/lib/env.ts`
