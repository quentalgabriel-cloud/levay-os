---
title: Arquitetura Multi-Tenant — Tenant-First com FK Isolation
type: decision
created: 2026-05-12
confidence: high
tags: [multi-tenant, architecture, database, isolation]
---

# Arquitetura Multi-Tenant — Tenant-First com FK Isolation

## Estado: ✅ Aprovada

## O que foi decidido

Usar abordagem **Tenant-First com foreign key isolada** — cada recurso de negócio tem `tenantId` obrigatório como campo, garantindo isolamento no nível da aplicação.

## Por que Tenant-First sobre Alternatives

| Alternativa | Problema | Nossa Escolha |
|-------------|----------|---------------|
| Schema por tenant (Postgres) | Migrations duplicadas, overhead operacional | ❌ |
| Database por tenant | Sobrecarga de manutenção, queries cross-tenant complexas | ❌ |
| Discriminator column | Menos explícito, risco de leaks | ❌ |
| **Tenant-First com FK** | Simples, queries diretas, migrations únicas | ✅ |

## Implementação

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique // holding | sollu | amp213 | bicabar
  isActive  Boolean  @default(true)
}

model Task {
  id        String  @id @default(uuid())
  title     String
  tenantId  String  // FK obrigatória
  tenant    Tenant  @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}
```

## Mapeamento de Tenants

| Empresa | Slug | Descrição |
|---------|------|-----------|
| Grupo Holding | `holding` | Workspace raiz, acesso cross-tenant |
| Sollu | `sollu` | **Totalmente isolado** — CRM, billing, contracts |
| AMP 213 | `amp213` | Eventos e buffet — opera com Bica |
| Bica Bar | `bicabar` | Bar sensorial — opera com AMP |

## Regras de Isolamento

### Sollu — PROIBIDO misturar com outros tenants
- CRM leads de Sollu nunca aparecem em Bica
- Billing de Sollu nunca aparece em AMP
- Contratos de Sollu isolados

### Bica + AMP — Compartilham operação
- Mesmos membros da equipe
- Reservas e eventos no mesmo sistema
- Mas dados de clientes separados

### CEO — Exceção cross-tenant
- Acesso consolidado em `analytics/executive`
- Sem `tenantId` query param → vê tudo
- Todos os outros papéis: isolados

## API — Header Obrigatório

```http
x-tenant-id: sollu  # obrigatório em todas as rotas
x-role: operator    # default
```

⚠️ **CRÍTICO**: Header `x-tenant-id` não tem validação JWT real ainda (EPIC 1 pendente).

## Gaps

| Gap | Prioridade | Impacto |
|-----|-----------|--------|
| JWT validation middleware | **Alta** | Qualquer um acessa qualquer tenant |
| Row-level security (Postgres) | Alta | Proteção em nível de banco |
| Tenant-aware migrations | Média | Migrations não consideram tenant em race conditions |

## Alternativas Consideradas

| Alternativa | Avaliação |
|------------|-----------|
| Schema por tenant (Postgres) | Complexo demais para sistema interno |
| Database por tenant | Overhead operacional inaceitável |
| Discriminator column | Menos seguro, menos explícito |

## Trade-offs Aceitos

- Row-level security fica em nível de aplicação (não Postgres RLS) — mitigado por validação em API
- Queries não filtradas por tenant são erro de implementação (falta `WHERE tenantId = ?`)

## Links

[[stack-tecnologico]], [[prisma-sqlite-setup]], [[tres-empresas-dominio]], [[production-gaps]], [[supabase-auth]]
