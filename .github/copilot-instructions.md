# Padrões de desenvolvimento do app React Native

## Contexto do projeto

- Este projeto é um app React Native com Expo.
- O código da aplicação fica principalmente dentro da pasta `app/`.
- Fora de `app/`, ficam arquivos de configuração, assets e setup do projeto.

## Estrutura do projeto

- `app/api`: integração com APIs e chamadas remotas.
- `app/components`: componentes reutilizáveis de UI.
- `app/hooks`: hooks customizados.
- `app/lib`: utilitários, tema, env e funções compartilhadas.
- `app/navigation`: configuração de navegação.
- `app/pages`: telas da aplicação organizadas por domínio.

## Regras gerais

- Sempre use TypeScript em novos arquivos.
- Prefira código simples, explícito e fácil de manter.
- Evite abstrações desnecessárias.
- Mantenha cada arquivo com responsabilidade clara.
- Siga a organização já existente do projeto.

## Exportação

- Nunca exporte componentes, telas, hooks ou funções com `export default`.
- Sempre prefira exportações nomeadas.
- Ao criar um componente, prefira `export function NomeDoComponente()` em vez de `export default`.

## Funções

- Evite arrow functions como padrão.
- Prefira declaração de função com `function`.
- Use arrow function apenas quando houver necessidade técnica clara, como callbacks curtos, closures simples ou APIs que exigem função inline.
- Para componentes React Native, prefira `export function ComponentName()`.

## Componentes React Native

- Componentes devem usar PascalCase.
- Um componente por arquivo, salvo exceções pequenas e justificadas.
- Componentes de UI reutilizáveis devem ficar em `app/components`.
- Telas devem ficar em `app/pages`.
- Evite lógica pesada diretamente no JSX.
- Extraia lógica reutilizável para hooks ou utilitários.

## Navegação

- Arquivos de navegação devem ficar em `app/navigation`.
- Não misture definição de rotas com lógica de negócio.
- Quando uma aba tiver fluxo interno, prefira stack aninhada dentro da tab.

## Hooks

- Hooks customizados devem ficar em `app/hooks`.
- Hooks devem começar com `use`.
- Não crie hooks sem necessidade real de reutilização ou encapsulamento de estado/efeitos.

## Organização por domínio

- Telas relacionadas devem ficar agrupadas por domínio dentro de `app/pages`.
- Exemplo: `app/pages/articles`, `app/pages/profile`.
- Ao adicionar novas features, prefira manter arquivos próximos do domínio correspondente.

## Estilo de código

- Use nomes descritivos.
- Evite siglas pouco claras.
- Prefira retornos antecipados para reduzir aninhamento.
- Evite funções muito longas.
- Evite comentários óbvios; prefira código legível.

## Imports

- Organize imports de forma consistente.
- Remova imports não utilizados.
- Prefira importar apenas o necessário.
- Mantenha ordem estável e previsível nos imports.

## Side effects e dados

- Chamadas de API devem ficar em `app/api` ou em camada apropriada.
- Não coloque acesso remoto diretamente em componentes de UI reutilizáveis.
- Valores de ambiente devem ser centralizados em `app/lib/env.ts`.

## Tema e utilitários

- Regras visuais compartilhadas devem ficar em `app/lib/theme.ts`.
- Helpers genéricos devem ficar em `app/lib/utils.ts`.
- Não duplicar utilitários já existentes.

## O que evitar

- `export default`
- uso excessivo de arrow functions
- componentes muito grandes
- lógica de negócio espalhada em telas sem extração
- duplicação de código
- criação de abstrações antes da hora

## Ao gerar código

- Respeite a estrutura existente do projeto.
- Gere arquivos no diretório correto.
- Prefira exemplos compatíveis com React Native e Expo.
- Não assuma bibliotecas não instaladas sem avisar.
- Quando sugerir mudanças, explique trade-offs de forma objetiva.
