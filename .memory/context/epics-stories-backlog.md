---
title: Epic Structure — Status e Backlog
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [epics, stories, backlog, sprint, roadmap]
confidence: high
---

# Epic Structure — Status e Backlog

## Status dos Epics (Maio 2026)

| Epic | Nome | Status | Stories |
|------|------|--------|---------|
| **1** | Foundation, Tenancy & Governance | ✅ COMPLETO | 1.1 ✅, 1.2 ✅ (Logs, Observabilidade), 1.3 ✅ |
| **2** | Sollu Revenue Engine | ✅ COMPLETO | 2.1 ✅, 2.2 ✅, 2.3 ✅ |
| **3** | AMP 213 Lead-to-Event Flow | ✅ COMPLETO | 3.1 ✅, 3.2 ✅ |
| **4** | Bica Bar Premium Operations | ✅ COMPLETO | 4.1 ✅, 4.2 ✅ |
| **5** | Cross-Tenant Automations | ✅ COMPLETO | 5.1 ✅, 5.2 ✅ |
| **6** | Executive Intelligence & Scale | 🔄 EM PLANEJAMENTO | 6.1 🔄, 6.2 🔄 |

## Epic 1 — ✅ COMPLETO (Maio 2026)

### Story 1.1: Setup Tenancy + Auth + RBAC
- **Status**: ✅ COMPLETO (Integração ao arquitetura existente)
- **Data**: 2026-05-12
- **Resultado**: Arquitetura preservada, não substituída
- **Implementação**:
  - `tenant-context.ts` - usa `workspace_members` existente
  - `dashboard-metrics.ts` - métricas por company
  - Mesa page atualizada com workspace-scoped queries
  - Middleware (proxy.ts) adiciona headers de contexto

### Story 1.2: Workspace Isolation + RBAC Enforcement
- **Status**: ✅ COMPLETO (critical fixes aplicados)
- **Data**: 2026-05-12
- **Implementação**:
  - TODAS as páginas agora têm `workspace_id` filter
  - `layout.tsx` - companies filtradas por workspace
  - `tarefas/page.tsx` - tasks filtradas por workspace
  - `projetos/page.tsx` - projects filtrados por workspace
  - `decisoes/page.tsx` - decisions filtradas por workspace
  - `empresas/page.tsx` - companies filtradas por workspace
- **Correções críticas**:
  - Vocabulary: `em_movimento` → `em_andamento` (AGENTS.md compliance)
  - Build passou com TypeScript strict

### Story 1.3: Audit & Compliance
- **Status**: ✅ COMPLETO
- **Data**: 2026-05-12
- **Implementação**: Audit service expandido, repository, controller, endpoints de listagem/filtros, retenção, testes de integração (47/47 API)

## Ciclo 2 — Plano

Ver: `/docs/sprints/cycle-2-plan.md`

### Escopo 1.1 (Implementado)
- ✅ Modelo existente (workspaces + companies + workspace_members)
- ✅ Middleware com contexto de workspace
- ✅ Policy helpers (canManageUsers, canCreateTasks, etc.)
- ✅ Dashboard metrics por company
- ✅ Mesa page com queries workspace-scoped
- ❌ Testes automatizados (pendente)

### Critério de saída Ciclo 2
> "Nenhuma rota da API aceita dados de outro tenant sem autenticação válida"

## Arquitetura Decisão Chave

**INTEGRAÇÃO > SUBSTITUIÇÃO**

O sistema existente já tinha arquitetura multi-tenant robusta. Não fazia sentido criar novo modelo Tenant quando `workspaces` + `companies` + `workspace_members` já faziam isso.

## Testes

- **Build passing**: ✅ `npm run build` passa
- **Dev server**: ✅ Rodando em localhost:3000
- **Unit tests**: ❌ Pendentes para tenant-context.ts

### Story 1.3: Workspace Switcher Component
- **Status**: ✅ COMPLETO
- **Data**: 2026-05-12
- **Implementação**:
  - `components/WorkspaceSwitcher.tsx` - dropdown de companies
  - Integrado em `AppNav.tsx`
  - Mostra workspace atual + lista de companies

### Story 1.4: Role-Based UI
- **Status**: ⚠️ Pendente
- **Depende de**: 1.3 completo

### Story 1.5: RLS (Row Level Security)
- **Status**: ✅ Migration PRONTA
- **Arquivo**: `supabase/migrations/20260512_enable_rls_workspace_isolation.sql`
- **Status**: ⚠️ Aguardando execução manual no Supabase Dashboard
- **Como aplicar**: Ver `supabase/RLS_IMPLEMENTATION.md`

## Verificações Finais (Maio 2026)

| Verificação | Status |
|-------------|--------|
| Build passes | ✅ |
| TypeScript strict | ✅ |
| All pages have workspace filter | ✅ |
| Workspace Switcher component | ✅ |
| No `any` types | ✅ |
| Vocabulary aligned | ✅ |
| RLS migration ready | ✅ |

## Gaps de Story

1. **E2E tests**: Smoke tests cobrem fluxo crítico mas não E2E completo
2. **Performance tests**: Nenhum teste de carga
3. **Unit tests para tenancy**: Pendentes
4. **Workspace switcher**: ✅ Completo

## Links

[[xoia-cycle-agents]], [[tres-empresas-dominio]], [[stack-tecnologico]], [[tenants-multi-tenancy]], [[projeto-sistemainterno-grupo-levay]], [[production-gaps]], [[nono-ai-agent]]
