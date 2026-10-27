# Cadastro e edição de dependentes

## Contexto

A issue #18 descreve perda de identidade na edição, datas inválidas ou incompletas,
seleção implícita de sexo e prematuridade sem semanas. Em 22/10/2026, o usuário
solicitou implementar as correções propostas no relatório local da issue.

## Regras adotadas

- O aceite da Política de Privacidade é exibido e exigido somente na criação; a edição
  preserva o consentimento já registrado e não exige nova confirmação.
- O cadastro começa sem sexo selecionado e exige uma escolha explícita.
- A data de nascimento representa um dia de calendário. Hoje é permitido em qualquer
  horário; datas futuras, impossíveis e incompletas impedem salvar, com mensagens distintas.
- A edição é identificada por `kid.id`; o cadastro possui a identidade `new`. Ao trocar
  de identidade, o formulário inteiro é remontado, incluindo máscara e prematuridade.
- Marcar prematuridade exige informar as semanas de gestação, usando as opções existentes
  de 20 a 36 semanas. Desmarcar limpa a seleção e envia `prematureWeeks: "0"`.
- `isPremature` é um estado validado do formulário, não um campo da resposta ou do payload
  da API. Ao editar, é derivado de `prematureWeeks` diferente de zero.
- Home, Perfil e Sorriso compartilham as mutations de dependentes. A edição do formulário
  completo usa PUT. Revogar consentimento cancela e remove consultas de eventos do dependente
  na conta atual, incluindo paginação infinita, e mantém o aviso da exclusão do histórico.
- A lista exibida usa ordem alfabética em português, ignorando diferenças de caixa e
  acentuação, com desempate por id. A ordem também vale durante atualizações locais.

## Limites

A issue #15 continua responsável pela validação clínica, pelo significado definitivo das
semanas no contrato e por eventual idade corrigida nas previsões. Esta mudança mantém
as previsões existentes e não migra dados clínicos. Registros antigos com semanas fora
das opções do formulário precisam de uma escolha válida ao editar com prematuridade marcada.

### Semântica das semanas (issue #15)

Contrato atual, reconciliado em 27/10/2026:

- O formulário pergunta idade gestacional ao nascer e oferece semanas inteiras de 20 a 36.
  Desmarcar limpa a seleção e envia `prematureWeeks: "0"`.
- O app envia exatamente o número escolhido; `"0"` significa “não prematuro”.
- A API (a partir da correção descrita no relatório) aceita apenas `"0"` ou `"20"`–`"36"`,
  em criação, `PUT` e `PATCH`; qualquer outro valor responde `400 INVALID_PAYLOAD`. Antes, a
  faixa da API ia de 0 a 40 e divergia do app.
- `prematureWeeks` é string em ambas as camadas; nada sugere conversão para “semanas que
  faltaram”. Um registro `"32"` não deve ser reinterpretado com subtração automática.
- As previsões dentais **não usam** `prematureWeeks`; usam data de nascimento e meses de
  calendário. Se a correção de idade prematura for escolhida, o cálculo deve ser idade
  derivada, sem alterar a data real de nascimento nem as decisões de apresentação da #32.
- Implementação atual de cálculo: ao informar semanas (20–36) e idade cronológica < 24 meses, as janelas dentais são deslocadas em `(40 - semanas)` semanas (idade corrigida, baseada em protocolo geral da AAP de idade corrigida nos primeiros 2 anos, aplicada nas tabelas de cronologia). Fora desse horizonte, usa-se a idade cronológica. A data real de nascimento não é alterada. Validação clínica da aplicabilidade odontológica segue pendente (#15).
- Uso além do cadastro: exportação do histórico exibe “Prematuridade: N semanas”. Aliar a
  política de privacidade (arts. 6º III/VI e 14 da LGPD) deve considerar essa finalidade.

### Política temporal (issue #15)

- Regra de **etapas** (issue #17) e regra **cronológica entre datas** resolvidas em
  frentes distintas. A primeira bloqueia etapas posteriores sem a anterior; a segunda
  (implementada na API e refletida no modal) impede, quando há data conhecida em ambos os lados,
  erupção/queda anteriores da mesma posição com datas invertidas, incluindo edição apenas de
  data. Registros sem data não entram na comparação e o mesmo dia é aceito. O cliente deve
  validar o mesmo critério no modal (`validateEventDateKey`/`validateToothEventDateOrder` em
  `app/lib/utils.ts`) e tratar `422 TOOTH_EVENT_OUT_OF_ORDER`.

O backend atual já aceita o payload e ordena as leituras por nome; nenhuma mudança de
contrato da API é necessária para estas correções.
