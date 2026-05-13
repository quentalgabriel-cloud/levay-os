---
title: RLS (Row Level Security) Implementation
type: decision
created: 2026-05-12
tags: [decisão, security, rls, supabase, multi-tenant]
---

# RLS Implementation for Workspace Isolation

## O que foi decidido

Implementar **Row Level Security (RLS)** no Supabase para garantir isolamento de dados no nível do banco de dados, independente da aplicação.

## Por que RLS é crítico

1. **Defense in depth** — Mesmo se a aplicação tiver bugs, o banco protege
2. **Supabase-native** — RLS é a forma recomendada de segurança no Supabase
3. **Automático** — Qualquer query passando pelo Supabase é filtrada

## Arquitetura

```
┌─────────────────────────────────────────────┐
│                 Next.js App                  │
│  (getWorkspaceContext + .eq(workspace_id))   │
└──────────────────┬────────────────────────┘
                   │ auth.uid()
                   ▼
┌─────────────────────────────────────────────┐
│              Supabase Auth                  │
│         (JWT with user_id)                 │
└──────────────────┬────────────────────────┘
                   │ auth.uid()
                   ▼
┌─────────────────────────────────────────────┐
│           Supabase Postgres                  │
│  ┌─────────────────────────────────────┐   │
│  │  RLS Policies                       │   │
│  │  auth.workspace_id() → workspace_id │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Função Helper

```sql
CREATE OR REPLACE FUNCTION auth.workspace_id()
RETURNS TEXT AS $$
  SELECT workspace_id
  FROM workspace_members
  WHERE user_id = auth.uid()
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

## Tabelas Protegidas

| Tabela | Select | Insert | Update | Delete |
|--------|--------|--------|--------|--------|
| companies | workspace_id | workspace_id | workspace_id | workspace_id |
| tasks | workspace_id | workspace_id | workspace_id | workspace_id |
| projects | workspace_id | workspace_id | workspace_id | - |
| decisions | workspace_id | workspace_id | workspace_id | - |
| events | workspace_id | workspace_id | workspace_id | - |
| crm_clients | workspace_id | workspace_id | workspace_id | - |
| captures | workspace_id | workspace_id | workspace_id | - |
| workspace_members | user_id | - | - | - |
| audit_log | admin only | system only | - | - |
| collaborators | workspace-based | - | - | - |

## Como Aplicar

1. Dashboard → SQL Editor
2. Executar: `supabase/migrations/20260512_enable_rls_workspace_isolation.sql`

## Verificação

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar policies
SELECT tablename, policyname, permissive
FROM pg_policies
WHERE schemaname = 'public';
```

## Alternativas Consideradas

1. **Aplicação-only filtering** — Não seguro se houver bugs
2. **Views com security_barrier** — Mais complexo, overhead
3. **Schema separado por tenant** — Overhead operacional alto

## Links

[[projeto-sistemainterno-grupo-levay]], [[tenants-multi-tenancy]], [[stack-tecnologico]]