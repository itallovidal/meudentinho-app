# Meu Dentinho

## What This Is

Aplicativo móvel para pais e responsáveis acompanharem o desenvolvimento bucal infantil, com ênfase na erupção e queda dos dentes, registro do histórico odontológico por dente e recomendações preventivas e orientativas ao longo da infância.

## Core Value

Pais e responsáveis conseguem acompanhar, antecipar e agir sobre eventos importantes de saúde bucal infantil de forma simples e confiável.

## Requirements

### Validated

(Nenhuma ainda — features serão validadas por uso)

### Active

- [ ] **AUTH-01**: Usuário pode criar conta, fazer login e manter sessão ativa
- [ ] **PROF-01**: Usuário pode cadastrar e gerenciar um ou mais filhos (perfil do dependente)
- [ ] **TEETH-01**: Sistema permite registrar eventos odontológicos por dente (erupção, queda, procedimento)
- [ ] **HIST-01**: Usuário pode visualizar histórico cronológico de eventos por criança e por dente
- [ ] **PRED-01**: O aplicativo gera previsões de próximos eventos simples (próxima erupção) com base no histórico registrado
- [ ] **ALRT-01**: Receber alertas orientativos em momentos importantes (fora do esperado, check-up recomendado)
- [ ] **CONTENT-01**: Área com conteúdo educativo (artigos) acessível aos usuários
- [ ] **ADMIN-01**: Interface admin (no app) para gerenciar/cadastrar artigos

### Out of Scope

- Integração com sistemas de pagamentos — não necessário para v1
- Chat em tempo real com profissionais — v2

## Context

O projeto nasce para resolver a falta de uma visão consolidada e previsível do desenvolvimento dentário infantil. O cliente alvo são pais e responsáveis que buscam orientação prática e registro histórico de fácil consulta.

- Plataforma alvo: mobile (Expo / React Native)
- Backend: API REST (external) — o app atua como cliente móvel
- Armazenamento local: AsyncStorage para cache e offline

## Constraints

- **Plataforma:** Mobile-first (Expo) — priorizar experiências iOS e Android via Expo
- **Prazos:** MVP com core flows em 8–12 semanas (estimativa coarse)
- **Privacidade:** Dados pessoais das crianças devem ser tratados com atenção (evitar exposição de dados sensíveis)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first (Expo) | Rápido ciclo e acesso nativo sem infra mobile pesada | — Pending |
| Vertical MVP | Entregar um fluxo end-to-end por vez para validar hipóteses com usuários | — Pending |

---
*Last updated: 2026-05-14 after initialization*
