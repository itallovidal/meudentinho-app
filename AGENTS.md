# AGENTS.md — meudentinho-app

App **React Native (Expo SDK 57 / RN 0.86 / React 19 / TypeScript)** do Janelinha, com NativeWind (Tailwind), React Navigation (API estática), React Query, React Hook Form + Zod.

## Comandos

- **Nunca executar builds sem autorização explícita do usuário.** Antes de qualquer build web ou nativo, exportação/bundling do Expo, prebuild ou tarefa Gradle de build, avisar qual comando será executado e aguardar a permissão. Pedidos genéricos para implementar, corrigir ou validar não autorizam builds.
- **Verificar o uso total de RAM e CPU do computador antes de iniciar tarefas pesadas, e monitorar durante a execução. Nunca ultrapassar 90% de uso total de RAM ou CPU sem autorização explícita do usuário.** Ajustar workers, paralelismo, heap e afinidade de CPU conforme a capacidade disponível; manter margem abaixo do teto e reduzir ou pausar os próprios processos antes de atingi-lo. No Linux, considerar a RAM efetivamente ocupada a partir de `MemAvailable`, sem contar cache recuperável como memória indisponível.

```bash
npm run start                        # dev (expo start)
npm run android                      # build dev no Android
npx tsc --noEmit                     # typecheck
npm run lint                         # eslint (expo lint)
npm test                             # jest (TZ=America/Sao_Paulo)
```

Build local de APK (sem EAS/cloud build — requer JDK, Android SDK, `adb` e depuração USB):

```bash
npm run android:apk:preview          # APK release local
npm run android:apk:preview:debug    # APK debug local
npm run android:apk:install:preview # instala release no aparelho via adb
npm run android:apk:install:debug    # instala debug no aparelho via adb
```

- APKs gerados em `android/app/build/outputs/apk/{release,debug}/`.
- O `buildTypes.release` usa **debug keystore** — serve para preview/teste interno; distribuição oficial exige keystore de produção.

## Env

- `.env` (gitignored) com `EXPO_PUBLIC_API_BASE_URL` — usar IP de LAN para device físico; `.env.example` é versionado.
- Variáveis são validadas com zod em `app/lib/env.ts` — novas variáveis `EXPO_PUBLIC_*` devem ser registradas lá.

## Estrutura

- `app/api` — integração com a API: um arquivo por endpoint, wrappers `fetch` sem lógica de UI.
- `app/components` — UI reutilizável (`ui/` = primitivos estilo shadcn; `skeletons/` separado).
- `app/contexts` — `UserContext` (sessão: `user` + `authToken`, persistidos em AsyncStorage).
- `app/hooks` — hooks customizados (dados via React Query).
- `app/lib` — `env.ts`, `theme.ts`, `asyncStorage.ts`, `utils.ts`, `schemas/` (zod).
- `app/navigation` — navegadores e tipos de rota (API estática do React Navigation).
- `app/pages` — telas organizadas por domínio (`home`, `articles`, `profile`, `smile`).
- `app/types` — `dtos/` (contratos da API), `domain`, `teeth`.

## Regras de código

- TypeScript sempre; **exports nomeados** — nunca `export default`.
- Prefira `function nome()`; arrow function apenas em callbacks curtos/closures.
- Componentes em PascalCase, um por arquivo; telas em `app/pages`, UI reutilizável em `app/components`.
- Sempre preferir reaproveitar componentes existentes em `app/components` em vez de criar novos duplicados — verificar antes de criar.
- Caso não exista o componente para um determinado elemento que será usado em mais de um local (agora ou futuramente), extraí-lo para um componente modular em `app/components`: props explícitas e tipadas, sem lógica de negócio, sem fetch e sem hardcode de contexto específico.
- Chamadas remotas **somente** em `app/api` — nunca dentro de componentes de UI reutilizáveis.
- Valores de ambiente sempre via `app/lib/env.ts`.
- Formulários: react-hook-form + `zodResolver`, com schemas em `app/lib/schemas`.
- Estado de servidor: React Query (queries **e** mutations com invalidação de cache) — não criar fetch manual em telas.
- Estilo: NativeWind (`className`) com tokens de `app/lib/theme.ts` + `global.css` — sem cores hex hardcoded.
- Erros da API: `ApiError` + `isApiError` (`app/types/predicates.ts`); toda falha precisa de feedback visível ao usuário.
- Navegação em `app/navigation`; não misturar definição de rotas com lógica de negócio.
- Navegação cross-tab (ex.: `navigation.navigate("Smile", { screen: "SmileHistory" })` a partir de outra tab): passar **sempre** `initial: false`. Sem ele, se a stack de destino ainda não foi montada, o React Navigation a cria contendo apenas a tela de destino (`getStateFromParams` em `useNavigationBuilder`), sem a rota raiz — o usuário fica preso sem poder voltar. Só é dispensável quando o destino **é** a própria rota raiz da stack (ex.: `screen: "ArticlesList"`).
- Overlays: **nunca** utilizar pop-up/dialog central; preferir e optar **SEMPRE** por popover de baixo para cima (bottom sheet).
- Loading e erro: **nunca** substituir os skeletons pela mensagem de erro; exibir o erro junto dos skeletons (padrão do ArticleList).
- **Nunca** adicionar comentários no código (`//`, `/* */`, `{/* */}`, JSDoc, etc.) — o código deve ser autoexplicativo.

## Git / commits

- Conventional commits **em inglês**, título curto (≤50 chars), lowercase:
  `feat|fix|chore|docs|refactor|test|style|perf: <título>` + bullets explicando o que mudou.
- **Nunca** rodar `git add .` nem commitar automaticamente — apenas sugerir os comandos ao usuário.
- **Nunca** commitar relatórios, diagnósticos ou documentos de análise (ex.: `docs/relatorio-*.md`) sem permissão explícita do usuário — gerar apenas localmente.
- Commits pequenos e coesos, agrupados por propósito; se um arquivo misturar naturezas diferentes, sugerir commits separados.

## Estado conhecido

- `docs/auditoria-etapa-1-front.md` — diagnóstico completo da auditoria Etapa 1 (2026-10-11): defeitos, integração com a API e lista priorizada. **Consultar antes de investigar problemas** para não redescobrir o que já está mapeado.
- A API consumida está em `/home/leonardo/Documentos/Leonardo/UVA/Outros/PIC UVA/Projeto/meudentinho-api`; o relatório de auditoria do backend (`docs/auditoria-etapa-1-backend.md`) será gerado na sequência.
- Ainda sem testes, CI e ESLint — `tsc --noEmit` deve continuar passando após qualquer mudança.
