# Cycle 2 Plan — Foundations (Epic 1)

**Objetivo:** Implementar a camada de Autenticação, RBAC e Tenancy real, desbloqueando a Story 1.3 (Dashboard por Perfil) e elevando a segurança de toda a stack.

**KPI de saída:** Nenhuma rota da API aceita dados de outro tenant sem autenticação válida.

## Stories por Prioridade

| # | Story | Status | Bloqueio |
|---|-------|--------|----------|
| 1 | 1.1 Setup Tenancy / Auth / RBAC | Draft | Nenhum — é o desbloqueador |
| 2 | 1.2 Observabilidade / Logs Auditáveis | Draft | Depende de 1.1 (tenant_id nos logs) |
| 3 | 1.3 Dashboard Dinâmico por Perfil | In Review (CONCERNS) | Depende de 1.1 para RBAC real |

## Escopo Story 1.1

- Modelo de dados: `tenant`, `user`, `role`, `user_tenant_role`
- Middleware que resolve contexto de tenant por JWT (não mais `x-tenant-id` sem auth)
- Policy layer centralizado (deny by default)
- Seed: holding + Sollu + AMP213 + Bica Bar
- Endpoint de auditoria administrativa
- Testes: positive + negative cross-tenant

## Dependência Crítica

Story 1.3 tem QA gate com `CONCERNS` exatamente pelo fato de que `tenant_id` vem via header sem autenticação. Quando 1.1 for implementada:
1. Substituir `x-tenant-id` header por JWT claim
2. Rodar smoke tests novamente
3. Atualizar QA gate de 1.3 → status Done

## Cycle 1 — Summary (Fechado)

- 11 stories marcadas Done
- 45/45 testes passando
- Sprint Sollu Cycle 1: QA Pass — aguardando sign-off manual do dashboard CRM
