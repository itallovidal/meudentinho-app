<div align="center">

# Janelinha

  <p>Aplicativo para Android, iOS e Web para acompanhamento da saúde bucal infantil: odontograma,
  previsão de erupção dentária, artigos educativos e gestão de dependentes.</p>
  <div>
    <img src="https://img.shields.io/badge/Expo-SDK%2058-000020.svg?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 58"/>
    <img src="https://img.shields.io/badge/React%20Native-0.88.0-20232a.svg?style=flat-square&logo=react&logoColor=61dafb" alt="React Native 0.88.0"/>
    <img src="https://img.shields.io/badge/React-19.3.0-61dafb.svg?style=flat-square&logo=react&logoColor=white" alt="React 19.3.0"/>
    <img src="https://img.shields.io/badge/TypeScript-6.0.3-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6.0.3"/>
    <img src="https://img.shields.io/badge/Node-24-339933.svg?style=flat-square&logo=node.js&logoColor=white" alt="Node 24"/>
    <img src="https://img.shields.io/badge/Licen%C3%AAncia-indefinida-lightgrey.svg?style=flat-square" alt="Licença: indefinida"/>
  </div>
  <br>
</div>

# Quick Links

- [Descrição](#descrição)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Build e release](#build-e-release)

## Descrição

O **Janelinha** é o aplicativo para dispositivos móveis e navegador do projeto de acompanhamento da saúde bucal infantil. Ele permite que responsáveis cadastrem crianças dependentes, registrem a dentição em um odontograma interativo e recebam previsões de erupção e troca dos dentes calculadas a partir da idade e do sexo de cada criança.

O app existe para auxiliar o acompanhamento manual feito em consultório: o histórico de nascimento dos dentes fica organizado em um só lugar, e o responsável sabe com antecedência qual dente deve nascer ou cair em seguida. O conteúdo educativo (artigos) fica disponível no próprio aplicativo, com leitura em Markdown renderizada
nativamente.

As janelas de previsão são calculadas no frontend: as previsões são estimativas derivadas e recalculadas a cada renderização.

A Arquitetura separa a integração com a API REST (`app/api`, um arquivo por endpoint) do estado de tela: dados de servidor são gerenciados com React Query, formulários com React Hook Form + Zod, e a sessão do usuário com refresh token automático e tokens armazenados no Keychain/Keystore via `expo-secure-store`. A interface é organizada em quatro abas — Início, Sorriso, Artigos e Perfil.

## Tecnologias

- **Expo SDK 58 / React Native 0.88.0** — base do app, com build Android via `expo prebuild` + Gradle.
- **React 19.3.0** — camada de UI, com contexto para sessão do usuário.
- **TypeScript 6.0.3** — tipagem estrita em todo o código.
- **NativeWind 4.2.3 + Tailwind CSS 3.4.19** — estilização via `className` com tokens definidos em `app/lib/theme.ts`.
- **React Navigation 7** — navegação por stacks e abas, usando a API estática (`createStaticNavigation`).
- **TanStack React Query 5.100.10** — estado de servidor: queries e mutations com invalidação de cache.
- **React Hook Form 7.75 + Zod 4.4.3** — formulários e validação com schemas centralizados em `app/lib/schemas`.
- **react-native-reanimated 4.7.1** — animações e gestos.
- **phosphor-react-native** — biblioteca de ícones.
- **react-native-remark** — renderização de Markdown nos artigos.
- **react-native-calendars** — calendário de previsões e seleção de datas.
- **AsyncStorage + expo-secure-store** — persistência da sessão, com tokens em storage seguro.
- **Jest + jest-expo** — testes unitários; **Prettier** + **ESLint 9** — formatação e lint.

## Funcionalidades

### Autenticação e sessão

Login, cadastro e logout com tratamento de expiração de sessão. O acesso é protegido por _access token_ + _refresh token_: quando uma requisição falha por token expirado, o app renova a sessão em background e repete a chamada; se o refresh também falhar, a sessão é encerrada e o usuário é avisado. Tokens são migrados automaticamente do AsyncStorage para o `expo-secure-store`.

### Dependentes

Cadastro de crianças com data de nascimento, sexo, semanas de prematuridade e consentimento de uso, além de listagem, edição e seletor rápido de qual dependente está ativo. O consentimento pode ser revogado a qualquer momento.

### Odontograma (aba Sorriso)

Mapa dental interativo com os arcos superior e inferior, registro de eventos de erupção e esfoliação por quadrante, tipo de dente e dentição (decídua/permanente). A exclusão de um evento remove em cascata os eventos posteriores do mesmo dente, e um gráfico de progresso acompanha o total de dentes decíduos já registrados.

### Previsões de erupção

Cálculo das janelas de erupção/troca a partir da data de nascimento e do sexo do dependente, com marcação em calendário dos períodos previstos e dos eventos já registrados. As previsões são agrupadas por arco e tipo de dente e exibidas em ordem cronológica.

### Artigos

Lista de artigos com categorias, busca, destaque do mais recente e leitura completa com conteúdo em Markdown. Usuários administradores têm acesso à criação de artigos.

### Perfil

Edição de nome e e-mail com confirmação por senha em bottom sheet, troca de senha e exclusão de conta.

### Screenshots

<!-- TODO: adicionar capturas de tela das abas Início, Sorriso, Artigos e Perfil. -->

## Build e release

### Pré-requisitos

- Node 24.3 ou superior dentro da linha 24 (ver `.nvmrc` e `engines` no `package.json`).
- JDK 21 e Android SDK (platform + build-tools) para build nativo local.
- `.env` a partir do `.env.example`; builds de release passam antes por `npm run env:check -- --release`.

### Comandos

| Comando                                          | O que faz                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run web`                                    | servidor de desenvolvimento web (Metro)                                                                                               |
| `npm start`                                      | servidor Expo (dev)                                                                                                                   |
| `npm run android`                                | build/dev no device Android                                                                                                           |
| `npm run android:apk:preview`                    | APK de release local: valida o env, roda `prebuild` + `gradlew assembleRelease` — hoje assinado com a chave de debug do template Expo |
| `npm run android:apk:preview:debug`              | APK de debug local                                                                                                                    |
| `npm run android:apk:install:preview` / `:debug` | instala o APK no device via `adb`                                                                                                     |
| `npm run typecheck` / `lint` / `test`            | verificação do código                                                                                                                 |

### Versão web

A versão web mantém React Navigation e compartilha telas, formulários, regras e integração com a API com o app nativo. Em desenvolvimento, `npm run web` inicia o Expo; a aplicação usa caminhos sob `/app`.

Para gerar e conferir a saída publicada:

```bash
nvm use
npm ci
npm run build:web
npm run preview:web
```

O preview abre em `http://localhost:4173/`, com uma página de apresentação em `/` e o aplicativo em `/app`. `npm run build:web` valida as variáveis, exporta o Expo e reúne o shell do app, a página pública, o CSS e os assets em `dist/`. A pasta é gerada e não deve ser versionada.

Para conferir a landing e o aplicativo com uma API local HTTP configurada em `EXPO_PUBLIC_API_BASE_URL`, use:

```bash
npm run build:web:preview
npm run preview:web
```

Esse build usa o modo de desenvolvimento e aceita HTTP; a publicação continua usando `npm run build:web`, que exige HTTPS. O preview serve os arquivos de `dist/`: após alterar o `.env` do frontend, gere o build novamente. Na API, autorize a origem exata do navegador em `CORS_ALLOWED_ORIGINS`, por exemplo `http://localhost:4173`, sem `/app` nem barra final. Após alterar o `.env` da API, reinicie o processo; com Docker Compose, recrie o serviço para atualizar as variáveis do container.

No navegador, a sessão usa `sessionStorage`, é separada por origem/aba e sobrevive ao recarregamento da página. Esse armazenamento é acessível a JavaScript da mesma origem e não equivale ao SecureStore; Android/iOS continuam usando o armazenamento seguro nativo. Abas duplicadas podem compartilhar a sessão inicial e devem refazer login se a rotação do refresh token a invalidar.

O histórico web é aberto em um documento próprio de impressão, permitindo escolher salvar como PDF.

Após gerar o build, executar `npm run test:web` para verificar o bundle de produção em DOM simulado, com API de teste. Esses testes verificam inicialização, login, sessão, links profundos e tratamento de falhas; não substituem a validação visual e a integração com CORS em navegadores reais. `npm test` mantém a suíte unitária. O CI executa os dois conjuntos e o build web usando Node 24.

### Versão

- `version`, `versionCode` (Android) e `buildNumber` (iOS) vivem no `app.json` — fonte única: o Perfil exibe `version` via `expo-constants` e o gradle nativo recebe `versionCode`/`versionName` no `prebuild`.
- Política: `versionCode` e `buildNumber` sobem **+1 a cada release**, manualmente, e o bump entra no PR do release.

### Release nativo

Keystore própria e AAB para loja estão **adiados** até existir um alvo de distribuição nativo definido — o roadmap atual é web-first. Quando voltar: `*.keystore` e `keystore.properties` já estão no `.gitignore`; a chave e suas senhas nunca devem ser versionadas.
