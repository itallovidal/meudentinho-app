# Arquitetura — Janelinha App

## 1. Visão geral

Janelinha é um aplicativo Expo (React Native + Web) para acompanhamento da saúde
bucal infantil. Ele permite que responsáveis cadastrem crianças dependentes,
registrem eventos dentários (erupção, queda, observações) em um odontograma
interativo e consultem previsões dentais calculadas localmente no dispositivo.
Também publica uma landing page e uma política de privacidade estáticas no build web.

- Plataformas: Android, iOS e Web (SPA com PWA offline).
- Backend externo: API Go (`janelinha-api`), consumida via `EXPO_PUBLIC_API_BASE_URL`.
- Persistência: Firebase Firestore no backend; no cliente, AsyncStorage/SecureStore.
- Estado de dados no cliente: TanStack React Query.
- Idioma predominante da interface: português (pt-BR).
- Nome do produto: **Janelinha**. A pasta do repositório pode variar conforme o ambiente de cada desenvolvedor.

## 2. Stack principal

| Categoria | Biblioteca |
|---|---|
| Framework | Expo SDK 58, React Native 0.88, React 19 |
| Linguagem | TypeScript |
| Navegação | `@react-navigation/native` + native stack + bottom tabs |
| Estado de servidor | `@tanstack/react-query` |
| Formulários | `react-hook-form` + `zod` |
| Estilos | NativeWind (Tailwind) + CSS tokens em `app/lib/themeTokens.json` |
| Animações | `react-native-reanimated` |
| Storage seguro | `expo-secure-store` (com fallback AsyncStorage) |
| PDF/relatório | `expo-print`, `expo-sharing` |
| Markdown/dicas | `react-markdown`, `remark-gfm` |
| Ícones | `phosphor-react-native` |
| Testes | Jest + `jest-expo` (config web separada) |

## 3. Estrutura de diretórios

```text
.
├── App.tsx                    # bootstrap, providers, tema, QueryClient
├── app.json                   # nome/slug/bundle identifiers do app
├── package.json               # scripts e dependências
├── global.css                 # estilos Tailwind/NativeWind
├── assets/                    # ícones, splash, imagens
├── app/
│   ├── api/                   # clientes da API agrupados por domínio
│   ├── components/            # UI reutilizável e componentes de domínio
│   ├── contexts/              # UserProvider (sessão/auth)
│   ├── hooks/                 # React Query hooks e mutations
│   ├── lib/                   # lógica de negócio, schemas, storage, temas
│   ├── navigation/            # navigators, params, linking, document title
│   ├── pages/                 # telas montadas por navigator
│   ├── skeletons/             # loading states nativos
│   └── types/                 # tipos de domínio/DTOs
├── web/                       # PWA, landing, política de privacidade, testes web
├── scripts/                   # validate-env, finalize-web, preview-web
└── ARCHITECTURE.md            # este documento
```

Diretórios gerados (`android/`, `ios/`, `dist/`, `.expo/`, `node_modules/`) são ignorados
pelo Git e não documentam arquitetura.

## 4. Bootstrap da aplicação (`App.tsx`)

1. Carrega `global.css` e habilita `react-native-screens`.
2. Valida variáveis de ambiente (`envIssues`); se houver falha exibe `InvalidEnvScreen`.
3. Monta providers:
   - `GestureHandlerRootView`
   - `QueryClientProvider` (`staleTime` = 5 minutos)
   - `SafeAreaProvider` + `IconContext`
   - `UserProvider`
   - `ToastProvider`, `ErrorBoundary`, `PortalHost`
4. Inicializa tema claro (`colorScheme.set("light")`).
5. Só renderiza `Navigation` depois que `UserProvider` foi hidratado (`hydrated`).

## 5. Navegação

- `RootNavigator`: stack raiz com `Main` (abas) e `NotFound`.
- `TabNavigator`: abas principais do app.
- Stacks específicos:
  - `HomeStack`
  - `SmileStack` (odontograma, histórico, previsões)
  - `ArticlesStack`
  - `ProfileStack`
- Ligação web:
  - `app/navigation/linking.ts` define URL base/origem e rotas.
  - `app/pages/notFound.tsx` trata rotas inválidas.
  - Document title por rota em `app/navigation/documentTitle.ts`.
- A navegação é remontada seletivamente em `App.tsx` (`sessionBoundary`) para evitar
  estado residual ao trocar de conta.

## 6. Estado, sessão e autenticação

### UserProvider
- Mantém `user`, `authToken`, `refreshToken`, `userId`, `hydrated`, `sessionExpired`.
- Restaura sessão do storage seguro no mount.
- Listener de `AppState` tenta reprocessar revogações pendentes quando o app volta ao foreground.
- Limpa React Query (`queryClient.clear()`) quando a conta muda ou a sessão expira.

### SessionManager (`app/lib/sessionManager.ts`)
- Centraliza leitura/escrita de sessão e refresh token rotation.
- `configureAuthFetch` conecta o fetch autenticado às funções de refresh/expiry.
- Revogações de consentimento podem ficar pendentes e ser tentadas depois (`retryPendingRevocations`).

### Armazenamento
- `app/lib/secureStorage.ts`: SecureStore com prefixo configurável (`@janelinha`) e
  normalização de chave (`@janelinha_token`, etc.).
- `app/lib/asyncStorage.ts` e `sessionStorage*`: implementações nativa/web.
- `app/lib/sessionStorageState.ts`: estado derivado de sessão.

### Fetch autenticado
- `app/lib/authFetch.ts`: injeta `Authorization`, tenta refresh automático e propagada
  expiração.
- `app/api/*`: funções por recurso, sem lógica de estado, apenas endpoints.

## 7. Comunicação com a API

- Base URL vem de `EXPO_PUBLIC_API_BASE_URL` (`app/lib/env.ts`), validada com Zod.
  - DEV permite `http://`/`https://`.
  - Produção exige `https://`.
- Endpoints (backend `janelinha-api`):
  - `/auth/login`, `/auth/signup`, `/auth/refresh`, `/auth/logout`
  - `/users/:id`, `/users/:id/password`, `/users/:id/export`, `/users/kids...`
  - `/articles/...`, `/tooth-events/...`
- Tratamento de erro: `parseResponse`, `ApiError`, mensagens em `errorMessage.ts`.
- CORS do backend deve incluir origem do Expo web (`:8081/:4173`).

## 8. Dados locais, cache e queries

- TanStack Query keys centralizadas em `app/lib/queryKeys.ts`.
- Hooks em `app/hooks/*` encapsulam queries (artigos, categorias, kids, eventos dentários,
  previsões).
- Mutações em `useKidMutations`, `useArticleMutations`, etc. invalidam caches relevantes.
- Lista de dependentes é ordenada em pt-BR por nome, ignorando acentos/caixa, com desempate por id.

## 9. Domínio central: dentes de leite e permanentes

Este é o coração do aplicativo.

### Identidade e taxonomia
- `app/lib/toothIdentity.ts`: IDs FDI, dente primário/permanente, quadrante, arco, labels.
- `app/components/smile/teeth/fdiTeeth.ts`: representação SVG/visual por dente.
- `app/lib/toothMilestones.ts`: estados (`eruption`, `shedding`, `current`, `overdue`,
  `predicted`, `completed`).
- `app/lib/smileSummary.ts` + `useKidsSmileSummaries`: resumo por criança.

### Cronologia dental
- `app/lib/toothChronology.ts`: tabelas `CHRONOLOGY`, `MEN_PERMANENT`, `WOMEN_PERMANENT`,
  chaves exaustivas por `Arch/Side/ToothType`.
- `app/lib/toothPredictions.ts`: calcula janelas/sugestões a partir de data de nascimento,
  sexo, eventos registrados e cronologia.
- Versão de tabelas (`CHRONOLOGY_VERSION`) e cálculo de janelas estão cobertas por testes
  (`toothChronology.test.ts`, `toothPredictions.test.ts`, etc.).

### Eventos dentários e dependências
- `app/lib/toothEventDependents.ts`: regras de dependência/cascata no odontograma
  (ex.: queda de dente de leite bloqueia/precondiciona erupção permanente).
- `app/api/smile/*`: CRUD de eventos e alerta/snooze.
- `app/components/smile/ToothEventModal.tsx`: entrada e validação de datas.
- Regra cronológica entre eventos é validada no cliente
  (`validateEventDateKey`/`validateToothEventDateOrder`) e tratada como 422
  `TOOTH_EVENT_OUT_OF_ORDER` quando vindo da API.

### Dentes mistos
- Fluxo de pré-molares preserva histórico por posição: dente de leite nasce → cai →
  permanente nasce → cai, com mesmo `toothType` e diferenciação por `dentition/eventType`.
- `PRIMARY_PREDECESSOR` relaciona molares decíduos às posições de pré-molares.

### Predição e prematuridade
- A data real de nascimento **nunca é alterada**.
- Se semanas de gestação forem informadas (20–36) e idade cronológica < 24 meses, o cálculo
  aplica **idade corrigida**:
  - use `prematureWeeks` como idade gestacional ao nascer (string ou número);
  - se finito, `> 0` e `< 40`, calcule `(40 - semanas) * 7` dias e some à data real de nascimento
    para obter uma `correctedBirthDate`;
  - use essa data corrigida apenas nas estimativas de erupção/troca;
  - se a idade cronológica já for `>= 24` meses, **não aplique** nenhuma correção.
- `prematureWeeks` permanece string e a API aceita `"0"` ou `"20"..."36"`.
- O uso de idade corrigida até 24 meses é sustentado por referência odontopediátrica.
- A leitura do odontograma/histórico usa as datas reais dos eventos.

### Decisões clínicas relevantes
- A cronologia dental é derivada de tabelas locais (backend não exibe cronologia).
- A validação dos limites por sexo/lado depende de revisão clínica.
- A prematuridade é tratada como idade gestacional ao nascer (0, 20–36) e aplicada
  apenas até 24 meses de idade corrigida, com fórmula `(40 - semanas) × 7` dias.
- A data real de nascimento não é alterada; apenas estimativas usam idade corrigida.
- Cadastro exige sexo explícito e aceite de política quando aplicável.
- Edição preserva consentimento e usa PUT; revogar consentimento limpa histórico.

## 10. Cadastro e edição de dependentes

Regras arquiteturais (antigo ADR de cadastro, consolidado neste documento):
- Aceite da política de privacidade só na criação; edição preserva consentimento existente.
- Sem sexo pré-selecionado; escolha explícita obrigatória.
- Data de nascimento é dia de calendário; datas inválidas/futuras bloqueiam salvamento.
- `isPremature` é derivado de `prematureWeeks !== "0"` e validado no formulário.
- Edição identificada por `kid.id`; cadastro usa identidade `new`.
- Mutations compartilhadas por Home, Perfil e Sorriso.
- Edição completa usa `PUT`; revogar consentimento cancela/remova queries, inclusive
  paginação infinita.
- Ordenação pt-BR estável e local (Home/Perfil/Sorriso).

## 11. Web e PWA

- `web/public-site/`: landing page (`index.html`, `404.html`), política de privacidade
  publicada (`politica-de-privacidade.html`).
- `web/pwa/service-worker.ts`: cache offline com padrão `janelinha-shell-*`, navegação
  app shell e precache de assets.
- `web/pwa/register.ts`: ciclo de vida do SW, instalação/atualização, eventos `janelinha:pwa`.
- `web/pwa/manifest.webmanifest`: metadata PWA (“Janelinha”).
- `scripts/finalize-web.mts`: pós-processamento de export Expo (site + app shell).
- `scripts/preview-web.mts`: servidor local de preview.
- O Tailwind compila `global.css` para `dist/site.css` durante o build web.
- `EXPO_NO_DOTENV` em CI para builds determinísticos.

## 12. Segurança, privacidade e LGPD

- Armazenamento de sessão usa SecureStore nativo (web com fallback).
- Escopo de app é multiusuário por conta e limpa cache ao trocar.
- Política de privacidade tem versão (`PRIVACY_POLICY_VERSION = "1.0"`) validada no signup e
  no cadastro de dependente.
- Revogação de consentimento de dependente remove histórico de eventos da conta.
- Exportação de histórico inclui marcação de prematuridade.

## 13. Testes

- App: `npm test` (Jest + jest-expo), 44 suites na última validação.
- Web: `npm run test:web` (3 suites; 5 falhas pré-existentes de parser CSS, não regressão).
- Typecheck: `npm run typecheck`.
- Lint: `npm run lint` (não bloqueante em CI).
- Backend Go é mantido em repositório/aplicação separada e contém testes em
  `tests/unit`, `tests/integration` e `tests/e2e`.
- Testes cobrem schema, storage, session manager, tooth chronology/predictions, eventos,
  web/PWA e finalização.

## 14. Build e ambiente

Comandos principais:
- `npm start`: Expo dev.
- `npm run android` / `npm run ios` / `npm run web`
- `npm run build:web`: env check + export + finalize + Tailwind.
- `npm run env:check`: valida `.env`.
- `npx expo prebuild`: regenera nativos a partir de `app.json`.

Variáveis obrigatórias:
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
Opcional:
- `EXPO_PUBLIC_LOCAL_STORAGE_KEY` (padrão `@janelinha`).

CI (`.github/workflows/ci.yml`): checkout → node → npm ci → typecheck → unit → expo-doctor →
web production build + web smoke tests → lint.

## 15. Decisões e histórico consolidado

As ADRs técnicas antigas foram removidas em favor desta documentação.
Informações essenciais (regras de cadastro, previsões dentais, cronologia e prematuridade)
estão consolidadas neste arquivo.

A documentação externa foi intencionalmente reduzida. A única referência acadêmica em
texto refere-se a artigos sobre erupção dentária em prematuros, sem arquivos binários
armazenados no repositório.
## 16. Impacto da reorganização documental e remoção de `patches/`

- `patches/` continha um patch de `react-native-css-interop` que desabilitava `ImageBackground`
  no remapeamento CSS. O app não usa `ImageBackground` diretamente, então o impacto funcional
  esperado é baixo. Se `postinstall` permanecer, `patch-package` não terá patches a aplicar.
- Os ADRs técnicos antigos foram removidos, sem alterar runtime.
- A narrativa clínica/cronológica permanece em `ARCHITECTURE.md`.
