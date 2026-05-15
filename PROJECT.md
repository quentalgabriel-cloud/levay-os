# Levay OS — Sistema Interno do Grupo Levay

## O que é

Sistema operacional interno do Grupo Levay: gerencia tarefas, projetos, CRM, compras e colaboradores através de múltiplos workspaces (Sollu, Bica+AMP). Multi-tenant com isolamento por RLS no Supabase.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| App | Next.js 16 App Router + React 19 RSC |
| Linguagem | TypeScript estrito — sem `any` |
| Estilo | Tailwind v4 |
| Auth + DB | Supabase SSR (`@supabase/ssr`) + Postgres + RLS |
| Estado | Zustand (UI state only) |
| Deploy | Vercel (Fluid Compute) |
| AI | Anthropic SDK (triagem de leads) |

## O que existe neste repo

```
apps/
├── levay-os/          ← O APP EM PRODUÇÃO (Next.js 16)
└── _legacy/           ← Código legado JS — NÃO EDITAR, NÃO IMPORTAR

supabase/migrations/   ← Todas as migrations (Sprint 1-3 + Procurement)
docs/                  ← PRD, arquitetura, stories, ADRs
.claude/               ← XOIA agents + rules
.memory/               ← Decisões, contexto operacional, bottlenecks
```

## Onde está cada coisa (para agentes)

| Precisa saber sobre | Leia |
|--------------------|------|
| Componentes, stack, convenções | `apps/levay-os/AGENTS.md` |
| Decisões arquiteturais (ADRs) | `docs/adr/` |
| Contexto operacional do negócio | `.memory/MEMORY.md` (índice de decisões, bottlenecks, contexto) |
| Histórico de sprints | `.memory/decisions/` |
| PRD e produto | `docs/prd.md` |
| Design e tokens | `design.md` (raiz) + `apps/levay-os/src/app/globals.css` |
| Schema do banco | `supabase/migrations/` (mais recente = mais atual) |
| Design system (autoritativo) | `design.md` (raiz, 287 linhas) |
| Squads XOIA configurados | `squads/levay-continuous/` e `squads/levay-sollu-execution/` |

## Tenants (workspaces)

| Tenant | Cor |
|--------|-----|
| Sollu | #2563EB |
| Bica Bar | #7C3AED |
| AMP213 | #EA580C |

## Regras críticas (resumo)

1. **RLS obrigatório** em toda tabela nova — usar `current_workspace_id()` com schema explícito
2. **`import 'server-only'`** em todo `lib/` que toca banco ou env vars secretas
3. **Server Actions** para mutações — nunca API routes para CRUD
4. **`supabase: SupabaseServerClient`** — nunca `any`
5. **Dead code identificado**: `AppNav.tsx`, `/api/executive/route.ts`, `lib/actions/tasks.ts` — não referenciar

## Status atual (2026-05-15)

- Branch: `LEVAY-OS-v1.1`
- Sprint 3 (Security) concluída — hardening de DB e auth
- Sprint Procurement ativa — approval flow de compras funcionando
- Phase 0 (reorganização): em andamento

## XOIA Agents disponíveis

| Comando | Agente | Para que serve |
|---------|--------|---------------|
| `@dev` | Dex | Código, features, commits, PRs |
| `@architect` | Aria | Arquitetura, DB, migrations |
| `@qa` | Quinn | Qualidade, auditoria, segurança |
| `@product` | Sage | Stories, specs, priorização |
| `@xoia` | Nova | Orquestração, routing |
