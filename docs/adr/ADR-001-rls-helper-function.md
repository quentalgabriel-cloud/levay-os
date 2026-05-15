# ADR-001 — Padronização do Helper de RLS

**Status:** Pendente implementação
**Data:** 2026-05-15

## Contexto

Duas funções inconsistentes para obter workspace em RLS policies:
- `auth.workspace_id()` — sem ORDER BY, não-determinístico para multi-workspace
- `workspace_id()` — sem schema, resolve via search_path (frágil)

Bug confirmado: Taynan tem 2 memberships, resultado era aleatório.

## Decisão

Criar `public.current_workspace_id()` com schema explícito e `ORDER BY created_at ASC`.
Deprecar e dropar as duas versões antigas após migrar todas as policies.

## Migration pendente

`supabase/migrations/YYYYMMDD_normalize_rls_helper.sql`

```sql
CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC LIMIT 1;
$$;
```

## Consequências

Elimina non-determinismo e ambiguidade de search_path. Requer auditoria de todas as migrations existentes.
