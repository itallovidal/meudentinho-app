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
- O app é a **fonte** da cronologia: `CHRONOLOGY` (base) e `WOMEN_PERMANENT` (override permanente por
  quadrante para o sexo feminino) vivem em `app/lib/toothChronology.ts` e não têm equivalente no
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

## Pendente

- Revisar clinicamente as janelas de `WOMEN_PERMANENT` com a equipe de odontopediatria — hoje elas
  foram transportadas do backend e mantidas apenas no app.
- Remover do backend a lógica de cronologia/odontograma que ficar sem uso, somente depois que o
  comportamento do frontend estiver validado. Rotas de API usadas por outras partes do app devem ser
  preservadas.
