---
title: Stack Tecnológico — Decisões Arquiteturais
type: decision
created: 2026-05-12
confidence: high
tags: [architecture, tech-stack, fastify, prisma, supabase, nextjs]
---

# Stack Tecnológico — Decisões Arquiteturais

## Estado: ✅ Aprovada

## O que foi decidido

| Componente | Planejado | Implementado | Status |
|------------|-----------|------------|--------|
| **API** | NestJS 11 | **Fastify direto** | ✅ |
| **Database** | Supabase PostgreSQL + RLS | **Prisma + SQLite** | ✅ Dev working |
| **Frontend** | Next.js 15 | **Next.js 16.2.6 + React 19** | ✅ |
| **Jobs** | BullMQ + Redis | **Fila custom** | ✅ |
| **Auth** | Supabase Auth + RBAC | **Supabase Auth via @supabase/ssr** | ⚠️ Parcial |

## Por que Fastify direto

- Simpler, less opinionated
- Less boilerplate, faster iteration
- Module pattern: controller → service → repository

## Por que Prisma + SQLite

- **Zero infra**: Sem Docker, sem Supabase local
- **Schema-first**: Migrations versionadas, type-safe
- **Portabilidade**: Arquivo único `dev.db`
- **Path para Postgres**: Trocar provider no datasource é trivial
- **Auth Separation**: Prisma para negócio, Supabase apenas para auth

## Estrutura do Monorepo

```
levay-os/ (workspace root)
├── apps/
│   ├── api/           Fastify API (port 3000+)
│   ├── levay-os/     Next.js dashboard (port 3200+)
│   ├── web/          Web runtime modules
│   └── workers/      Background jobs (port 3400+)
└── packages/
    └── integrations/  WhatsApp, Google Drive, Payments
```

## Scripts Principais

```bash
npm run dev        # API + Web + Workers (start-stack.mjs)
npm run lint      # Syntax check
npm run typecheck # Module imports verification
npm run build     # Build + templates + followups
npm run smoke     # Smoke test (POST /demo/bootstrap)
npm run health   # Squad health check
npm run test      # Tests em api + workers
```

## Gaps de Migration

| Gap | Prioridade | Status |
|-----|-----------|--------|
| Prisma → PostgreSQL production | Alta | Não feito |
| RBAC real com Supabase Auth | Alta | ⚠️ Pendente |
| Supabase schema sync (278 tabelas) | Média | Não feito |

## Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| NestJS | Overhead desnecessário para escopo atual |
| Prisma + Postgres direto | Requer Docker/infra para dev local |
| Drizzle ORM | Menor adoção, menos tooling |
| Raw SQL | Sem type-safety, migrations manuais |
| Supabase completo | Lock-in demais, menos flexibilidade |

## Trade-offs Aceitos

- SQLite não escala para produção com muitos usuários concorrentes (mas é gestão interna, poucos usuários)
- Migrations via `prisma migrate dev`, não via Supabase MCP

## Links

[[prisma-sqlite-setup]], [[tenants-multi-tenancy]], [[xoia-cycle-agents]], [[xoia-framework]], [[getting-started]], [[production-gaps]]
