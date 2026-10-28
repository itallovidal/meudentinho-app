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
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License: MIT"/>
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

A publicação web inclui um PWA instalável: manifest, ícones de 192 e 512 px, ícone para iOS e abertura em janela própria na rota `/app`. A página inicial oferece instalação; no aplicativo, a aba Perfil contém o botão de instalação ou as instruções específicas do navegador. No iPhone/iPad, use o Safari e a opção Compartilhar → Adicionar à Tela de Início. A instalação depende do suporte do navegador e de HTTPS na publicação; `localhost` também permite testar service workers.

O service worker mantém somente os arquivos estáticos da interface, permitindo reabri-la sem conexão depois que o primeiro carregamento e a preparação do cache terminarem. Dados da API, sessões e respostas autenticadas não são armazenados nesse cache. Consultar e alterar registros exige internet; não há fila de alterações offline. O armazenamento da sessão web mantém o comportamento atual, por aba.

Cada publicação gera uma versão do cache a partir do conteúdo exportado. Atualizações aguardam o fechamento das instâncias abertas ou a ação Atualizar aplicativo no Perfil; essa ação pede que o usuário salve suas alterações antes de recarregar. O registro verifica novas versões quando a página volta a ficar visível. A landing e a política pública continuam usando a rede, sem fallback para o aplicativo.

Os arquivos-fonte ficam em `web/pwa`, e `scripts/finalize-web.mts` integra o PWA à saída exportada. O servidor do Expo não executa essa etapa; para validar instalação, rotas offline e atualização, use a saída de um build autorizado com `npm run preview:web`. Na Vercel, `vercel.json` configura o tipo do manifest e a revalidação do service worker.

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

A Política de Privacidade fica em `/politica-de-privacidade`, fora do aplicativo, e pode ser lida sem login ou JavaScript. Seu HTML-fonte está em `web/public-site/politica-de-privacidade.html` e é copiado pelo build. O preview e a Vercel entregam o documento na URL sem extensão; o endereço `.html` redireciona para ela.

Na web, os links do perfil e dos formulários usam a origem atual, inclusive `http://localhost:4173`. No aplicativo instalado, usam `EXPO_PUBLIC_PRIVACY_POLICY_URL`, que deve continuar sendo uma URL HTTPS válida para a página publicada. Alterar essa variável exige gerar um novo bundle; a validação HTTPS permanece ativa também no preview.

A política inicial é a versão `1.0`, com data de vigência em 24 de outubro de 2026. Ela identifica os autores e desenvolvedores pelo projeto Janelinha, de iniciação científica da Universidade Veiga de Almeida (UVA), e informa `suporte.janelinha@gmail.com` como canal de atendimento. Os dados dos usuários não são usados em pesquisa; Analytics é uma possibilidade futura e não está integrado na versão atual. Alterações relevantes devem ser acompanhadas de aviso no aplicativo antes de entrarem em vigor.

A exclusão de conta preserva registros técnicos de auditoria, substituindo o identificador do responsável e removendo identificadores de entidades pessoais nas categorias previstas. O backend grava expiração de 180 dias, mas a limpeza depende de uma política TTL ativa no Firestore. Como essa configuração não foi confirmada, o texto não promete exclusão automática nesse prazo. Antes de disponibilizar dados reais, conferir o TTL de `auditLogs.ExpiresAt` no projeto correto e as configurações de logs e backups dos prestadores. A API também limpa tokens de renovação vencidos na inicialização e a cada 24 horas. Ao definir o subdomínio público definitivo, configurar a URL HTTPS de privacidade e, se adotado, o canonical correspondente.

No navegador, a sessão usa `sessionStorage`, é separada por origem/aba e sobrevive ao recarregamento da página. Esse armazenamento é acessível a JavaScript da mesma origem e não equivale ao SecureStore; Android/iOS continuam usando o armazenamento seguro nativo. Abas duplicadas podem compartilhar a sessão inicial e devem refazer login se a rotação do refresh token a invalidar.

O histórico web é aberto em um documento próprio de impressão, permitindo escolher salvar como PDF.

Após gerar o build, executar `npm run test:web` para verificar o bundle de produção em DOM simulado, com API de teste. Esses testes verificam inicialização, login, sessão, links profundos e tratamento de falhas; não substituem a validação visual e a integração com CORS em navegadores reais. `npm test` mantém a suíte unitária. O CI executa os dois conjuntos e o build web usando Node 24.

### Versão

- `version`, `versionCode` (Android) e `buildNumber` (iOS) vivem no `app.json` — fonte única: o Perfil exibe `version` via `expo-constants` e o gradle nativo recebe `versionCode`/`versionName` no `prebuild`.
- Política: `versionCode` e `buildNumber` sobem **+1 a cada release**, manualmente, e o bump entra no PR do release.

### Aparência nativa e dispositivos

O app usa apenas tema claro, incluindo a configuração nativa de aparência e os ícones escuros da status bar. O suporte a iPad permanece habilitado; a web e os tablets Android continuam disponíveis. Os layouts nativos em tablets devem ser conferidos em aparelho ou simulador, além dos testes de responsividade web.

O ícone do app e o ícone adaptativo usam `assets/tooth-icon.png`, sem texto. A splash nativa usa `assets/splash-tooth-wordmark.png`, com o mascote e “Janelinha” logo abaixo, sobre fundo branco do tema. O Expo Go usa o ícone do app na abertura; a splash nativa completa é verificada em build próprio. O favicon web é gerado pelo Expo a partir de `assets/tooth.png`; o mesmo `/favicon.ico` atende o aplicativo, a landing e a política de privacidade. As permissões de sobreposição, vibração, armazenamento externo e biometria são bloqueadas; a exportação de PDF usa o cache do app e a sessão não exige autenticação biométrica. A permissão privada de assinatura do AndroidX para receivers internos é preservada. Após mudar plugins, permissões ou imagens, execute `npx expo prebuild --platform android` antes de um build debug. O comando de release já regenera o projeto nativo.

### Release nativo

Keystore própria e AAB para loja estão **adiados** até existir um alvo de distribuição nativo definido — o roadmap atual é web-first. Quando voltar: `*.keystore` e `keystore.properties` já estão no `.gitignore`; a chave e suas senhas nunca devem ser versionadas.
