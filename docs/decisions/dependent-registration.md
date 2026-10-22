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

O backend atual já aceita o payload e ordena as leituras por nome; nenhuma mudança de
contrato da API é necessária para estas correções.
