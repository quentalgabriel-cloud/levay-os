---
title: Prisma ORM com SQLite — Setup de Desenvolvimento
type: decision
created: 2026-05-12
confidence: high
tags: [database, prisma, sqlite, development, setup]
---

> ~~DEPRECATED~~ — App migrou para Supabase. Prisma/SQLite desativado (apps/_legacy/).


# Prisma ORM com SQLite — Setup de Desenvolvimento

## Estado: ✅ Aprovada

## O que foi decidido

Usar **Prisma ORM** com **SQLite** como banco de dados local para desenvolvimento, com path confirmado para migração para **PostgreSQL** em produção.

## Por que Prisma

- **Schema-first**: Definição de schema em `schema.prisma`, migrations automáticas
- **Type-safe**: Geração automática de tipos TypeScript
- **Portabilidade**: Schema é agnóstico de banco — trocar provider é mudar 2 linhas
- **Dev experience**: Auto-complete, validação, migrations versionadas
- **Maturidade**: Equipe grande, documentação excelente, comunidade ativa

## Por que SQLite

- **Zero infra**: Sem Docker, sem servidor, sem configuração
- **Portabilidade**: Arquivo único `dev.db` — commit no git, backup trivial
- **Performance**: Para dev local com < 1000 registros é mais rápido que Postgres
- **Simplicidade**: Sem conexões de rede, sem pool management

## Caminho para Produção

```prisma
// DEV: schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// PRODUÇÃO:只需 trocar provider
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Migrations continuam funcionando — Prisma gera SQL compatível.

## Setup Atual

```bash
# 1. Instalar dependências
npm install @prisma/client prisma

# 2. Generate client
npx prisma generate

# 3. Criar migrations
npx prisma migrate dev --name init

# 4. Abrir database client
npx prisma studio
```

## Schema Atual

13 modelos implementados:

| Modelo | Propósito | Tenant-isolated |
|--------|-----------|----------------|
| Tenant | Raiz multi-tenant | — |
| User | Perfis de usuário | Via UserTenantRole |
| UserTenantRole | Papel por tenant | ✅ |
| AuditLog | Auditoria | ✅ |
| Task | Tarefas | ✅ |
| Lead | CRM leads | ✅ |
| Receivable | Contas a receber | ✅ |
| Gate | Quality gates | ✅ |
| Reservation | Reservas Bica | ✅ |
| Member | Membership BICA CLUB | ✅ |
| MemoryEntry | Conhecimento | Via tenantId opcional |
| MemoryLink | Links de conhecimento | Via tenantId opcional |
| MemorySession | Sessões | Via projectSlug |

## Gaps

- **Migrations em equipe**: Requer que todos rodem `prisma migrate deploy`
- **Production schema**: Não há schema de produção (PostgreSQL) definido
- **Seed data**: Não há script de seed para desenvolvimento

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| Raw SQL | Sem type-safety, migrations manuais |
| Drizzle ORM | Ecossistema menor, tooling menos maduro |
| TypeORM | API mais verbosa, menos type-safe |

## Links

[[stack-tecnologico]], [[tenants-multi-tenancy]], [[getting-started]], [[production-gaps]]
