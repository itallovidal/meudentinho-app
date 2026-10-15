# Previsões dentais calculadas no frontend

## Decisão

As janelas de previsão de erupção/troca (`app/lib/toothPredictions.ts`) são calculadas no app, a partir da data de nascimento, do sexo do dependente, dos eventos registrados e das tabelas de cronologia em `app/lib/toothChronology.ts`.

## Motivo

- Não há cliente web planejado; o app é o único consumidor.
- As previsões não são persistidas como marcos. São estimativas derivadas e recalculadas a cada renderização.

## Consequências

- A cronologia do backend (`odontogram.go`, incluindo `menChronology` e `womenPermanent`) não é consumida pelo app. O endpoint `/tooth-events/kid/{id}/odontogram` retorna esses dados, mas o frontend usa apenas o campo `events`.
- A cronologia feminina do frontend (`WOMEN_PERMANENT` em `toothChronology.ts`) espelha a tabela `womenPermanent` do backend e deve ser mantida em sincronia com ela enquanto ambas existirem.
- O sexo do dependente (`Kid.gender`) é propagado até as previsões, o mapa dental e o modal de registro.

## Pendente

- Remover do backend a lógica de cronologia/odontograma que ficar sem uso, somente depois que o comportamento do frontend estiver validado. Rotas de API usadas por outras partes do app devem ser preservadas.
