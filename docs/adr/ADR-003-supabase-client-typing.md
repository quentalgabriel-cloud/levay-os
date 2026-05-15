# ADR-003 — Tipagem do Supabase Client

**Status:** Pendente implementação
**Data:** 2026-05-15

## Contexto

`lib/tenant-context.ts:16,37,92` usa `supabase: any` como parâmetro, perdendo toda a validação de tipos do client Supabase.

## Decisão

Exportar um tipo central `SupabaseServerClient` de `lib/supabase/server.ts` e usar em todas as assinaturas de função.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
export type SupabaseServerClient = ReturnType<typeof createServerClient>

// lib/tenant-context.ts
import type { SupabaseServerClient } from '@/lib/supabase/server'
export async function getWorkspaceContext(supabase: SupabaseServerClient) { ... }
```

## Consequências

Erros de tipo detectados em compile time. Nenhuma mudança em runtime.
