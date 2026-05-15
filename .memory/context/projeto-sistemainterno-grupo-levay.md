---
title: Sistema Interno Grupo Levay — Visão Geral
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [projeto, sistema-interno, multi-tenant, nextjs, supabase]
confidence: high
---

# Sistema Interno Grupo Levay

Sistema interno multi-tenant para gestão de empresas do grupo Levay. Incluye gestão de tarefas, leads, recebíveis, reservas, membros e muito mais.

## Stack Tecnológico

- **Frontend**: Next.js 16 App Router (levay-os app), React 19 Server Components
- **Backend**: Node.js API + Supabase (Database, Auth, RLS)
- **Database**: SQLite local via Prisma ORM + Supabase Postgres em produção
- **Auth**: Supabase Auth (magic link)
- **Workers**: Background jobs (follow-up scheduling, event publishing)
- **Orchestration**: XOIA Framework
- **Design**: Tailwind v4 com semantic tokens

## Arquitetura Multi-Tenant

### Modelo de Dados (Maio 2026)

| Entidade | Descrição | Papel |
|----------|-----------|-------|
| `workspaces` | Workspace principal (Grupo Levay) | Tenant raiz |
| `companies` | Empresas (Sollu, AMP213, Bica) | Sub-tenants |
| `workspace_members` | user_id + workspace_id + role | Associação + RBAC |
| `collaborators` | Usuários no workspace | User profiles |

### Isolation Strategy

- **Todos os recursos** têm `workspace_id` como FK obrigatória
- Queries sempre filtram por `workspace_id`
- Middleware (proxy.ts) adiciona headers: `x-workspace-id`, `x-workspace-slug`, `x-user-role`
- Roles: `owner` | `admin` | `member` | `viewer`

### Arquitetura Keys

- **AGENTS.md**: Stack rules, vocabulary, prohibitions
- **tenant-context.ts**: Context helpers, permission functions
- **dashboard-metrics.ts**: Company-scoped metrics
- **proxy.ts**: Middleware with workspace headers

## Apps

- `apps/levay-os/` — Next.js dashboard (auth + main app)
- `apps/api/` — Express-style API
- `apps/web/` — Web runtime modules (UI shell generation)
- `apps/workers/` — Background job runner

## Vocabulário

Ver: `apps/levay-os/src/lib/vocabulary.ts`

**Status tarefa**: a_fazer | em_andamento | aguardando | standby | fechando_ciclo | cancelado

**Labels**: "Pede atenção" (não "Atrasado"), "Fechar ciclo" (não "Concluído"), "Em movimento" (não "Pendente")

## Status Story 1.1 (Maio 2026)

✅ COMPLETO — Integração ao arquitetura existente

## Links

[[levai-memory-system]], [[prisma-sqlite-setup]], [[tenants-multi-tenancy]], [[epics-stories-backlog]]
