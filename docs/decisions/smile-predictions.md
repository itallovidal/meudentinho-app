# Previsões dentais calculadas no frontend

## Decisão

As janelas de previsão de erupção/troca (`app/lib/toothPredictions.ts`) são calculadas no app, a partir
da data de nascimento, do sexo do dependente, dos eventos registrados e das tabelas de cronologia em
`app/lib/toothChronology.ts`.

## Motivo

- Não há cliente web planejado; o app é o único consumidor.
- As previsões não são persistidas como marcos. São estimativas derivadas e recalculadas a cada
  renderização.

## Contrato com o backend

- `GET /tooth-events/kid/{id}/odontogram` devolve **apenas** `events`
  (`OdontogramResponse.Events`). O backend não expõe mais nenhuma tabela de cronologia.
- O app é a **fonte** da cronologia: `CHRONOLOGY` (base), `MEN_PERMANENT` e `WOMEN_PERMANENT`
  (tabelas permanentes por quadrante e sexo) vivem em `app/lib/toothChronology.ts` e não têm equivalente no
  backend. Ajustes de janela são feitos no app; não há sincronia a manter.
- O sexo do dependente (`Kid.gender`) é propagado até as previsões, o mapa dental e o modal de
  registro.

## Consequências

- A cadeia de dependência é unidirecional: backend → eventos → app → previsões. Uma divergência de
  janela entre app e backend não é possível (o backend não tem janelas).
- Tabelas de cronologia têm chaves exaustivas (`Record<ChronologyKey, …>`, com `ChronologyKey` montado
  por template literal sobre `Arch`/`Side`/`ToothType`); uma chave faltante quebra o `tsc`, e os testes
  em `app/lib/__tests__/` cobrem as derivações (`expectedDentition`, `isInEruptionWindow`,
  `buildToothPredictions`).

## Referência das tabelas

- Referência fornecida pelo usuário: PDF “PROJETO APP - MEU DENTINHO”, de Ana Luísa Pontes,
  exportado em 15/06/2026, 26 páginas.
- Páginas 4–9: identificação e cronologia dos 20 dentes decíduos, incluindo primeiro e segundo
  molares. Páginas 14–16: identificação e faixas médias dos dentes permanentes. Páginas 17–20:
  limites masculinos por quadrante; páginas 21–24: limites femininos por quadrante.
- Os limites masculinos também diferem entre lados. Não é correto aplicar uma única tabela por
  arco a ambos os lados. Sem sexo informado, mantém-se a tabela masculina como fallback técnico.
- A dentição decídua guarda a faixa média em meses e o limite em meses inteiros mais dias.
  Incisivos inferiores começam nas faixas 6–8 e 9–11 meses, sem substituir essas faixas pela média.
- O intervalo exibido para dentes decíduos vai do início da faixa média até o limite informado;
  para permanentes, exibe-se a faixa média. O limite permanente determina até quando a previsão
  permanece visível, respeitando o quadrante e o sexo.
- Datas de previsão usam meses do calendário, com ajuste para o último dia do mês quando
  necessário, seguidos dos dias adicionais. A previsão permanece visível durante todo o último
  dia do limite.
- A marca “X” nos terceiros molares significa limite não informado na fonte, representado por
  `null`. O app usa o fim da faixa média de 17–30 anos para encerrar a exibição, sem inventar um
  limite clínico de 100 anos.
- A célula feminina do dente 31 na página 23 escreve “7 E 6 MESES ANOS”. Foi interpretada como
  7 anos e 6 meses, mantendo o valor de 90 meses que já existia no app.
- O PDF distingue molares decíduos (54/55, 64/65, 74/75, 84/85) de molares permanentes
  (16/17, 26/27, 36/37, 46/47). Não estabelece a sequência “molar de leite → molar permanente”
  nem regras de bloqueio, cascata de exclusão ou registro retroativo.

## Fluxo dos pré-molares no app

Por solicitação explícita do usuário em 22/10/2026, primeiro e segundo pré-molares representam
o histórico completo da posição no mapa: nasceu de leite → caiu de leite → nasceu permanente →
caiu permanente. O contrato usa o mesmo `toothType` de pré-molar nas quatro etapas, diferenciadas
por `dentition` e `eventType`.

As tabelas de referência preservam a nomenclatura original do PDF. `PRIMARY_PREDECESSOR` relaciona
o primeiro molar decíduo à posição do primeiro pré-molar e o segundo molar decíduo à posição do
segundo pré-molar; `getChronology` deriva as janelas do mapa e das previsões usando essa relação.
Isso é uma representação do histórico por posição solicitada para o app, não uma alteração da
identificação anatômica dos dentes descritos na referência.

Primeiro, segundo e terceiro molares do mapa continuam exclusivamente permanentes. Previsões
primárias aparecem nas posições dos pré-molares, usando as idades dos respectivos antecessores
decíduos. A API exige a etapa anterior na criação dos eventos e mantém a cascata entre as quatro
etapas da mesma posição de pré-molar.

## Pendente

- Validar clinicamente a referência fornecida e as regras de registro com a equipe de
  odontopediatria. A transcrição do PDF não resolve a modelagem de sucessores e das duas dentições.
- Remover do backend a lógica de cronologia/odontograma que ficar sem uso, somente depois que o
  comportamento do frontend estiver validado. Rotas de API usadas por outras partes do app devem ser
  preservadas.
