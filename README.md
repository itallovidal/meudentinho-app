# Meu Dentinho

App React Native (Expo SDK 57) para acompanhar a saúde bucal infantil: mapa dental com registro de
eventos por dente, previsões de erupção calculadas no app, histórico e artigos.

## Requisitos

- Node 22 (`.nvmrc`)
- Para rodar no dispositivo: Android SDK + `adb` (APK local) ou Expo Go/dev build

## Comandos

```bash
npm start          # dev server (expo start)
npm run android    # build dev no Android
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm test           # jest (TZ fixo America/Sao_Paulo)
npm run android:apk:preview          # APK release local
npm run android:apk:preview:debug    # APK debug local
```

Builds de APK usam keystore de debug — servem para preview/teste interno; distribuição oficial exige
keystore de produção.

## Ambiente

`.env` (gitignored) com `EXPO_PUBLIC_API_BASE_URL` (IP de LAN para device físico) e
`EXPO_PUBLIC_PRIVACY_POLICY_URL`; `.env.example` é versionado. As variáveis são validadas com zod em
`app/lib/env.ts`.

## Estrutura

- `app/api` — integração com a API (um arquivo por endpoint)
- `app/components` — UI reutilizável (`ui/` primitivos, `skeletons/` separado)
- `app/hooks` — dados via React Query
- `app/lib` — utilidades, cronologia dental, previsões, schemas
- `app/pages` — telas por domínio (`home`, `smile`, `articles`, `profile`)
- `app/types` — DTOs e tipos de domínio
- `docs/decisions` — ADRs

## CI

`.github/workflows/ci.yml`: em PRs e pushes para `develop`/`main` — `npm ci`, typecheck, testes,
expo-doctor e lint (não bloqueante enquanto o débito pré-existente não é limpo).

## Contexto

- Regras de contribuição e convenções: `AGENTS.md`
- Backend consumido: `meudentinho-api` (Go, em `../meudentinho-api`)
