# Requirements: Meu Dentinho

**Defined:** 2026-05-14
**Core Value:** Pais e responsáveis conseguem acompanhar, antecipar e agir sobre eventos importantes de saúde bucal infantil de forma simples e confiável.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Usuário pode criar conta com email e senha e fazer login
- [ ] **AUTH-02**: Sessão do usuário persiste entre aberturas do app

### Profiles (Dependentes)

- [ ] **PROF-01**: Usuário pode cadastrar, editar e remover dependentes (um ou mais filhos)

### Dental Events & Timeline

- [ ] **TEETH-01**: Usuário pode registrar eventos odontológicos por dente (erupção, queda, procedimentos) com data e nota opcional
- [ ] **HIST-01**: Usuário pode visualizar histórico cronológico de eventos por criança e por dente

### Predictions & Alerts

- [ ] **PRED-01**: Aplicativo gera previsões básicas de próximos eventos (p.ex. janela esperada de erupção) usando regras determinísticas
- [ ] **ALRT-01**: Aplicativo envia alertas/avisos orientativos quando eventos estiverem fora do esperado ou quando for recomendada avaliação profissional

### Content & Admin

- [ ] **CONTENT-01**: Usuário pode ler artigos e conteúdos educativos dentro do app
- [ ] **ADMIN-01**: Usuário admin pode criar/editar/remover artigos dentro do app (UI administrativa)

## v2 Requirements

- **SYNC-01**: Sincronização entre dispositivos (família) e export para clínica
- **ML-01**: Modelos de predição mais sofisticados baseados em dados coletados

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat com profissionais | Escopo e custo além do MVP |
| Pagamentos / Billing | Não necessário para v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Pending |
| TEETH-01 | Phase 2 | Pending |
| HIST-01 | Phase 2 | Pending |
| PRED-01 | Phase 3 | Pending |
| ALRT-01 | Phase 3 | Pending |
| CONTENT-01 | Phase 2 | Pending |
| ADMIN-01 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-14*
