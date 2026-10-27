# Previsões dentais calculadas no frontend

## Decisão

As janelas de previsão de erupção/troca (`app/lib/toothPredictions.ts`) são calculadas no app, a partir
da data de nascimento, do sexo do dependente, dos eventos registrados e das tabelas de cronologia em
`app/lib/toothChronology.ts`.

## Motivo

- As previsões são apresentadas pelo app Expo nas plataformas nativas e web.
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
  arco a ambos os lados. O fallback para tabela masculina em dependentes sem sexo foi removido;
  sem sexo válido, não se gera previsão (cadastro passa a exigir sexo). Registros legados serão
  saneados e o fallback pode ser eliminado por completo após a limpeza.
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

## Referência e validação das tabelas (issue #15)

As tabelas foram confrontadas com as frentes técnicas registradas no relatório da #15; nenhuma
alteração clínica automática foi aplicada.

- Referência de origem informada pelo usuário: PDF “PROJETO APP - MEU DENTINHO”, de Ana Luísa
  Pontes, exportado em 15/06/2026, 26 páginas. Fontes bibliográficas usadas no aplicativo e no
  trabalho acadêmico: Micheli et al., 2025; Fekonja, 2022; Kapusi-Papp, Máth e Nemes, 2025;
  Toscano et al., 2026; Scarparo (org.), 2021 (ODONTOPEDIATRIA: bases teóricas para uma prática
  clínica de excelência).
- Comparação atual (mesma chave `ChronologyKey`, 32 entradas permanentes por sexo): `from` e `to`
  iguais entre os sexos nas 32 chaves; **19 limites (`limit`) diferentes entre os sexos**; 13
  entradas idênticas, incluindo quatro terceiros molares com limite `null`; **6 pares femininos
  assimétricos entre 14 pares sem terceiros molares**; 8 pares masculinos assimétricos entre
  14 pares. Os valores permanecem como estimativas versionadas (`CHRONOLOGY_VERSION`).
- Propriedade `limit`: determina até quando a previsão permanece visível. Ao ultrapassá-lo, a
  previsão deixa de ser exibida (`toothMilestones.ts`). Um permanente com nascimento `2019-10-26`,
  sem eventos, referência `2026-10-27 12:00` em São Paulo, já produz diferença por sexo aos
  **7 anos e 1 dia**, no primeiro molar inferior (masculino `overdue`; feminino `current`,
  `inTolerance: true`). As tabelas públicas (AAPD) não reproduzem as colunas de limite por
  sexo e lado do app, portanto a validação segue pendente.
- Pendente (clínico, sem responsável atribuído): origem e validade de `from`, `to`, `limit`,
  `limitDays`; valores por sexo/lado; fallback para dependentes antigos sem sexo (hoje tabela
  masculina foi removido; sem sexo válido, não se gera previsão). O cadastro já exige escolha
  explícita (ADR de cadastro:13), de modo que novos cadastros não precisam do fallback. Registros
  legados sem sexo serão saneados; após saneamento, remoção definitiva do código. Não unificar lados
  nem reajustar limites sem revisão clínica.
- Aproximação da fonte pública consultada: [AAPD — Dental Growth and Development](https://www.aapd.org/globalassets/media/policies_guidelines/r_dentalgrowth25.pdf)
  separa dentições e arcos, mas não apresenta colunas equivalentes de limite por sexo e lado; não
  permite ratificar automaticamente os 19 valores diferentes nem substituir a tabela particular.

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

## Apresentação de previsões e idade — issue #32

Decisões de produto aprovadas pelo usuário em 27/10/2026:

- Permanentes entre o fim da faixa média e o limite recebem “Após o período previsto”. Esse estado
  é uma projeção de apresentação (`tolerance`), sem antecipar o `overdue` dos alertas de registro.
- A ordem é faixa vigente, tolerância e futuras. Tolerância usa o limite mais próximo; os demais
  grupos usam o início crescente, com desempate pela identidade da previsão.
- Para decíduos, preserva-se a janela exibida do início ao limite, sem separar a faixa média.
- Após o limite, mantém-se o fluxo existente de revisão, histórico incompleto e adiamentos.
- O destaque de nascimento esperado considera a faixa exibida vigente, excluindo a tolerância
  permanente. Uma posição pode destacar o próximo nascimento permanente mesmo com leite presente.
  A metade voltada para o centro da boca fica amarela, acompanhando a rotação do desenho: embaixo
  nos dentes superiores e em cima nos inferiores. A outra metade preserva a cor do último registro.
  Dentes sem registro ficam inteiramente amarelos, assim como o exemplo da legenda. As validações
  de sequência do registro continuam.
  Legenda e resumo da Home contam as mesmas posições únicas do indicador. Presença permanente
  conhecida, inclusive sem data ou por registro de perda, encerra o destaque.
- Os títulos explicitam a dentição e identificam os antecessores decíduos das posições de pré-molar
  como molares de leite. O cartão inclui o ano quando diferente do ano de referência; intervalos
  entre anos mostram ambos. A página abre na data atual, sem previsão selecionada. Tocar numa
  previsão a seleciona; tocar novamente na mesma previsão a desmarca e retorna o calendário para hoje.
  Ao reabrir a página, a seleção e o número de itens visíveis são reiniciados. “Ver mais” revela dois
  itens por vez, com animação de altura compartilhada com a legenda do mapa.
- A idade exibida usa meses completos de calendário: menos de 1 mês; meses até 11; anos e meses de
  12 a 23; anos completos a partir de 24. Isso não altera a idade aproximada usada no domínio.
- Aniversários mensais usam o último dia do mês quando o dia de nascimento não existe no destino.
  Nascidos em 29/02 completam anos em 28/02 nos anos não bissextos. A atualização ocorre à meia-noite
  local e no retorno ao app, usando a mesma referência na apresentação.

Essas decisões tratam da apresentação da #32 e não encerram as demais questões clínicas da #15.

## Atalhos na tela Sorriso

- Toda a área dos cards de Previsões e Últimos Registros abre a página correspondente. Os itens
  resumidos de Últimos Registros também levam ao histórico. Os atalhos acessíveis dos ícones são
  preservados; tentar novamente em um erro de revisão não dispara a navegação do card.
- Toque simples em um dente continua abrindo o registro da próxima etapa. Toque prolongado em
  dente com histórico abre a edição do último registro representado pela posição, usando o editor
  já existente no histórico. A comparação considera a etapa da dentição e depois a data do evento.
- O indicador permanente da aba ativa permanece. Pressionar, clicar ou passar o mouse sobre as
  abas não adiciona fundo cinza, ripple visível ou redução de opacidade.
