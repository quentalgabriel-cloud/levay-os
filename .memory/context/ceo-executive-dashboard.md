---
title: CEO Executive Dashboard — Epic 6 Intelligence
type: decision
created: 2026-05-12
updated: 2026-05-12
tags: [epic-6, executive-view, CEO, analytics, dashboard, production-ready]
confidence: high
maintained_by: [Claude-Code]
related: [projeto-sistemainterno-grupo-levay, epics-stories-backlog, production-gaps, api-routes-fastify, supabase-auth]
---

# CEO Executive Dashboard — Epic 6

## O que foi decidido

Unificar a **Visão Executiva Consolidada** das 3 empresas (Sollu, AMP 213, Bica Bar) em um dashboard CEO dentro do Next.js (`apps/levay-os`), consumido pelo endpoint `/api/v1/analytics/executive` expandido da API Fastify. Decisão tomada em sessão de vistoria com @dev @architect @qa.

## Decisões Técnicas

### Frontend: Next.js como destino único
- `apps/web/` (vanilla JS) **será portado para** `apps/levay-os/` (Next.js 16)
- Dashboard operacional e Cockpit migram para Server Components + Client Components
- Decisão registrada em [[frontend-migration-plan]]

### Middleware: CEO bypass real
- `validateTenantAccess()` era **no-op crítico** — qualquer usuário autenticado acessava qualquer tenant
- Fix: CEO (`x-role=ceo`) libera cross-tenant via verificação de `user_tenant_roles`
- Operador: verifica `user_id` tem relação com `tenant_id` solicitado → 403 se não

### API: Analytics em memória → Supabase real
- `analytics.repository.js` usava `this.records = []` em memória (dados morrem no restart)
- Migrar para queries Supabase reais aggregating de `receivables`, `crm_clients`, `events`, `reservations`, `memberships`
- Não depende de `analytics_events` ingestion — usa dados reais das tabelas

### Testes: Expandir analytics.integration.test.js
- 5+ novos testes cobrindo CEO bypass, filtros, null-safety
- Framework: Vitest + `app.inject()` — mesmo padrão dos 14 testes existentes
- Gate: `npm run test --workspace @levay/api` passa com 100% coverage

## Arquitetura do Plano

### Tarefa 1 — Expandir `/api/v1/analytics/executive`

**analytics.repository.js**
- Trocar `this.records = []` por Supabase queries
- Query por `workspace_id` (tenant)
- Aggregate de: receivables, leads, events, reservations, membership

**analytics.service.js**
- `getExecutiveKpis()` expandido para:
  - `consolidated.revenue`: soma de receivables.pending de todos os tenants
  - `consolidated.conversion`: leads conversion rate médio ponderado
  - `consolidated.efficiency`: quality gates approval rate
  - `consolidated.occupancy`: taxa ocupação (bicabar reservations + amp213 events)
  - `topOpportunities`: top 5 leads cross-tenant por valor/prioridade
  - `pipeline`: leads por estágio cross-tenant

**analytics.controller.js**
- `x-role=ceo` → retorna dados de TODOS os tenants (sem filtro `tenantId`)
- `x-role≠ceo` → retorna dados só do tenant do header

### Tarefa 2 — Criar `/executive` page no Next.js

**Rota:** `app/(app)/executive/page.tsx` (Server Component)

**Estrutura:**
```
app/(app)/executive/
├── page.tsx                      # Server Component
├── components/
│   ├── ExecutiveKPICard.tsx      # Card reutilizável
│   ├── TenantSection.tsx         # Seção por empresa
│   ├── RevenueChart.tsx          # Tendência (placeholder)
│   ├── PipelineFunnel.tsx        # Funil cross-tenant
│   └── InsightList.tsx          # Insights automáticos
```

**Dados por tenant:**

| Tenant | KPIs | Fonte |
|--------|------|-------|
| `sollu` | Receivables, Leads, Quality Gates | `receivables`, `crm_clients`, `gates` |
| `amp213` | Events, Occupancy, Leads | `events`, `crm_clients` |
| `bicabar` | Reservations, Membership | `reservations`, `memberships` |

**Componentes reutilizáveis:**
- `Block` de `mesa/page.tsx`
- `COMPANY_COLOR` de `vocabulary.ts`
- Design tokens de `globals.css`
- `dashboard-metrics.ts` para queries base

**Navegação:**
- Link "Visão Executiva" no `AppNav.tsx`
- Role guard: só `role=ceo` vê o link

### Tarefa 3 — Fix `validateTenantAccess()`

```javascript
// ANTES (no-op):
export function validateTenantAccess(request, reply, done) {
  done(); // ← nunca bloqueia ninguém
}

// DEPOIS (correto):
export function validateTenantAccess(request, reply, done) {
  const role = request.headers['x-role'] || request.authUser?.role;
  const requestedTenant = request.headers['x-tenant-id'];

  // CEO tem bypass cross-tenant
  if (role === 'ceo') return done();

  // Não-CEO: verificar relação user ↔ tenant
  if (requestedTenant) {
    const userTenants = request.userTenantIds || []; // setado pelo jwtAuthMiddleware
    if (!userTenants.includes(requestedTenant)) {
      return reply.code(403).send({ message: 'Access denied to this tenant' });
    }
  }
  done();
}
```

### Tarefa 4 — Testes

**Arquivo:** `apps/api/test/analytics.integration.test.js` (expandir existente)

**Novos testes (5+):**
1. `CEO bypass: GET sem tenantId retorna todos` — `x-role: ceo` sem `tenantId` → todos tenants
2. `Operador restrito ao seu tenant` — `x-role: operator` + `x-tenant-id: sollu` → só sollu
3. `Operador não acessa outro tenant` — GET com `x-tenant-id: amp213` sem relação → 403
4. `Filtro de período` — `from`/`to` filtra corretamente
5. `KPIs null-safe` — `revenue: null` → `0` (não NaN)
6. `Cross-tenant consolidado` — dados de 3 tenants agregados corretamente

**Padrão:** mesmo de todos os 14 testes existentes (`beforeEach buildApp`, `afterEach app.close`, `app.inject()`)

## Ordem de Execução

```
PASSO 1: Fix validateTenantAccess()          [middleware crítico]
PASSO 2: analytics.repository.js → Supabase [dados reais]
PASSO 3: analytics.service.js expandido      [ KPIs consolidados ]
PASSO 4: analytics.controller.js CEO bypass  [ x-role=ceo ]
PASSO 5: Testes (5+ novos)                 [ npm run test ]
PASSO 6: /executive page                   [ Next.js Server Component ]
PASSO 7: AppNav link                       [ navegação ]
```

## Gaps Conhecidos

- **Middleware `jwtAuthMiddleware`**: usa parser JWT manual (`atob()`) sem verificação de assinatura RS256 contra chave pública do Supabase. Para produção, substituir por `@supabase/ssr` com `getUser()`.
- **API não tem conexão Supabase configurada**: verificar que `apps/api/.env` tem `DATABASE_URL` pointing para o mesmo Supabase que o Next.js.
- **x-role header**: o middleware extrai role do JWT, não do header. O controller usa `request.headers['x-role']` diretamente para o bypass. Garantir consistência.

## PRD Referências

- Epic 6: [[epics-stories-backlog]] — "Executive Intelligence & Scale"
- Story 6.1: KPIs consolidados por empresa
- Story 6.2: Insights de performance
- FR20: Dashboard dinâmico por perfil

## Status

- [ ] Tarefa 1 — Expandir API
- [ ] Tarefa 2 — /executive page
- [ ] Tarefa 3 — Fix middleware
- [ ] Tarefa 4 — Testes

## Respostas em Aberto (pendentes do usuário)

1. Quando CEO acessa `/executive`, vê dados do workspace dele ou de todos os workspaces que ele tem acesso via `user_tenant_roles`?
2. KPIs devem vir do que já está no banco (`receivables`, `crm_clients`) ou do módulo `analytics_events` ingestion?
3. Testes coexistem no mesmo `analytics.integration.test.js` ou em arquivo separado?
