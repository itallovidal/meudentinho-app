<div align="center">

# Meu Dentinho

  <p>Aplicativo mobile para acompanhamento da saúde bucal infantil: odontograma,
  previsão de erupção dentária, artigos educativos e gestão de dependentes.</p>
  <div>
    <img src="https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 57"/>
    <img src="https://img.shields.io/badge/React%20Native-0.86.3-20232a.svg?style=flat-square&logo=react&logoColor=61dafb" alt="React Native 0.86.3"/>
    <img src="https://img.shields.io/badge/React-19.2.3-61dafb.svg?style=flat-square&logo=react&logoColor=white" alt="React 19.2.3"/>
    <img src="https://img.shields.io/badge/TypeScript-6.0.3-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6.0.3"/>
    <img src="https://img.shields.io/badge/Node-%3E%3D22-339933.svg?style=flat-square&logo=node.js&logoColor=white" alt="Node >= 22"/>
    <img src="https://img.shields.io/badge/Licen%C3%AAncia-indefinida-lightgrey.svg?style=flat-square" alt="Licença: indefinida"/>
  </div>
  <br>
</div>

# Quick Links

- [Descrição](#descrição)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)

## Descrição

O **Meu Dentinho** é o aplicativo mobile do projeto de acompanhamento da saúde bucal infantil. Ele permite que responsáveis cadastrem crianças dependentes, registrem a dentição em um odontograma interativo e recebam previsões de erupção e troca dos dentes calculadas a partir da idade e do sexo de cada criança.

O app existe para auxiliar o acompanhamento manual feito em consultório: o histórico de nascimento dos dentes fica organizado em um só lugar, e o responsável sabe com antecedência qual dente deve nascer ou cair em seguida. O conteúdo educativo (artigos) fica disponível no próprio aplicativo, com leitura em Markdown renderizada
nativamente.

As janelas de previsão são calculadas no frontend: as previsões são estimativas derivadas e recalculadas a cada renderização.

A Arquitetura separa a integração com a API REST (`app/api`, um arquivo por endpoint) do estado de tela: dados de servidor são gerenciados com React Query, formulários com React Hook Form + Zod, e a sessão do usuário com refresh token automático e tokens armazenados no Keychain/Keystore via `expo-secure-store`. A interface é organizada em quatro abas — Início, Sorriso, Artigos e Perfil.

## Tecnologias

- **Expo SDK 57 / React Native 0.86.3** — base do app, com build Android via `expo prebuild` + Gradle.
- **React 19.2.3** — camada de UI, com contexto para sessão do usuário.
- **TypeScript 6.0.3** — tipagem estrita em todo o código.
- **NativeWind 4.2.3 + Tailwind CSS 3.4.19** — estilização via `className` com tokens definidos em `app/lib/theme.ts`.
- **React Navigation 7** — navegação por stacks e abas, usando a API estática (`createStaticNavigation`).
- **TanStack React Query 5.100.10** — estado de servidor: queries e mutations com invalidação de cache.
- **React Hook Form 7.75 + Zod 4.4.3** — formulários e validação com schemas centralizados em `app/lib/schemas`.
- **react-native-reanimated 4.5.1** — animações e gestos.
- **phosphor-react-native** — biblioteca de ícones.
- **react-native-remark** — renderização de Markdown nos artigos.
- **react-native-calendars** — calendário de previsões e seleção de datas.
- **AsyncStorage + expo-secure-store** — persistência da sessão, com tokens em storage seguro.
- **Jest + jest-expo** — testes unitários; **Prettier** + **ESLint 9** — formatação e lint.

## Funcionalidades

### Autenticação e sessão

Login, cadastro e logout com tratamento de expiração de sessão. O acesso é protegido por *access token* + *refresh token*: quando uma requisição falha por token expirado, o app renova a sessão em background e repete a chamada; se o refresh também falhar, a sessão é encerrada e o usuário é avisado. Tokens são migrados automaticamente do AsyncStorage para o `expo-secure-store`.

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