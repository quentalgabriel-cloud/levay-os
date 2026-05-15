---
title: Gaps e Inconsistências — Production Readiness
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [gaps, production, inconsistencies, TODOs, critical]
confidence: high
---

# Gaps e Inconsistências — Production Readiness

## ⚠️ Críticos para Produção

### 1. Auth/RBAC Enforcement
```
Status: ✅ IMPLEMENTADO (Maio 2026)
Solução: JWT Auth Middleware criado em apps/api/src/middleware/auth.middleware.js
Ativação: set ENABLE_AUTH=true em produção
AVISO: validateTenantAccess() é NO-OP — não valida relação user↔tenant
CORRIGIR: ver [[ceo-executive-dashboard]] Passo 1
```
**Implementação**: Middleware valida JWT tokens em produção, permite dev local com ENABLE_AUTH=false

### 1b. Tenant Isolation Bypass (CRÍTICO)
```
Status: ❌ A CORRIGIR
Problema: validateTenantAccess() é no-op — qualquer usuário acessa qualquer tenant
Impacto: Qualquer user logado pode acessar dados de outros tenants via x-tenant-id header
Solução: Ver [[ceo-executive-dashboard]] — Passo 1 (Tarefa 3)
```

### 2. Database Migration
```
Status: DEV (SQLite)
Problema: Prisma/SQLite → Prisma/PostgreSQL não feito
Impacto: Performance limitada, SQLite não escala
Depends: Supabase PostgreSQL
```

### 3. RLS (Row Level Security)
```
Status: ✅ PRONTO (Maio 2026)
Arquivo: supabase/migrations/20260512_enable_rls_workspace_isolation.sql
Execução: Requer execução manual no Supabase Dashboard
```

### 4. Audit & Compliance
```
Status: ✅ COMPLETO (Maio 2026)
Implementação: Audit service expandido, repository, controller, 6 testes
Endpoints: /audit/events, /audit/stats, /audit/retention
```

## Inconsistências Encontradas

### Documentação vs Código

| Item | Docs dizem | Código faz |
|------|-----------|-----------|
| API Framework | NestJS | **Fastify** |
| Database | Supabase Postgres | **Prisma+SQLite** |
| Jobs | BullMQ+Redis | **Fila custom** |
| Middleware | `middleware.ts` existe | **NÃO existe** |

### Schema Terminology

| Prisma Schema | Supabase Schema (legacy) |
|---------------|-------------------------|
| `tenantId` | `workspace_id` + `company_id` |
| `status` (Task) | `inbox` + `block` |
| `statusCockpit` | N/A no legacy |

### Vocabulário UI

Ver: [[vocabulary-labels]]

## Gaps por Área

### Auth
- [ ] JWT validation middleware
- [ ] Session refresh handling
- [ ] Multi-device logout
- [ ] 2FA setup

### Database
- [ ] Prisma migrate para PostgreSQL
- [ ] Sync com Supabase schema legacy
- [ ] RLS policies

### Integrações
- [ ] WhatsApp inbound webhook
- [ ] Google Drive download
- [ ] Payment gateway real (Asaas/Pagar.me)
- [ ] n8n inbound workflows

### Observabilidade
- [ ] Job monitoring dashboard
- [ ] Error tracking (Sentry)
- [ ] API metrics
- [ ] Health endpoints completos

### Deployment
- [ ] Vercel deploy (Next.js)
- [ ] API hosting (onde? Fly.io/Railway)
- [ ] Redis para BullMQ (se escalar)
- [ ] CI/CD pipeline

## Links

[[vocabulary-labels]], [[stack-tecnologico]], [[tenants-multi-tenancy]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]], [[supabase-auth]], [[xoia-cycle-agents]], [[ceo-executive-dashboard]]

[[stack-tecnologico]], [[tenants-multi-tenancy]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]], [[ceo-executive-dashboard]]
