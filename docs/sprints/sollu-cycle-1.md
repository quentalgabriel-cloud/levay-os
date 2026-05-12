# Sprint Contract - Sollu Cycle 1

**Goal**: Industrialize Sollu's CRM and Billing operations to eliminate manual follow-up gaps.
**KPI**: 100% automated follow-up coverage for D+0, D+1, and D+3 leads.

## Scope
- [ ] **CRM Pipeline**: Implement visual pipeline for lead tracking.
- [ ] **Workers**: Deploy D+0/D+1/D+3 follow-up scripts.
- [ ] **Billing**: Automated collection triggers for accounts receivable.
- [ ] **Quality Gates**: Manual approval step for contract generation.

## Agent Assignment (Handoff Sequence)
1. **Aria (@levay-po)**: Validate story scope and acceptance criteria.
2. **Quinn (@levay-sm)**: Refine backlog and remove blockers.
3. **Dex (@levay-dev)**: Implement functional slices in API/Workers.
4. **Sage (@levay-qa)**: Execute quality gates and final verification.

## Exit Criteria
- [x] Workspace health check passing (45/45 tests).
- [x] Full-stack smoke test passing.
- [x] QA Gate PASS — stories 2.1, 2.2, 2.3 verificadas e marcadas Done.
- [ ] Manual sign-off on CRM dashboard usability.

**Status**: [QA PASS] - Aguardando sign-off manual no dashboard CRM.

## QA Gate Summary (2026-05-12)

| Story | Veredicto | Observações |
|-------|-----------|-------------|
| 2.1 CRM Pipeline | ✅ PASS | 4 testes integração; audit fromStageId correto; cross-tenant 404 |
| 2.2 Workers D+0/D+1/D+3 | ✅ PASS | Idempotência, 3-retry → dead-letter, operations events publicados |
| 2.3 Billing | ✅ PASS | Collection trigger, payment callback, bulk collect, isolamento |
| 3.1 N8N Webhook | ✅ PASS | HMAC signature, deduplicação, lead criado em tenant correto |
| 3.2 Calendário AMP213 | ✅ PASS | Filtro por tenant e date range |
| 4.1 Reservas Bica | ✅ PASS | Capacidade máxima 70 lugares |
| 4.2 Membership | ✅ PASS | Tier, validade, status de membro |
| 5.1 Quality Gates | ✅ PASS | Bulk approve, audit de decisão, rejeição sem autorização |
| 5.2 Drive/Contratos | ✅ PASS | Upload metadata, tenant isolation |
| 6.1 Analítico Executivo | ✅ PASS | Agregação KPI por tenant e consolidado |
| 6.2 Dashboard Cross-tenant | ✅ PASS | Views por role com contrato |
