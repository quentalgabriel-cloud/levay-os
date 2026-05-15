# ADR-002 — import 'server-only' Obrigatório em lib/

**Status:** Pendente implementação
**Data:** 2026-05-15

## Contexto

`lib/agents/intelligence.ts` contém `ANTHROPIC_API_KEY` mas não tem `import 'server-only'`.
Se importado acidentalmente em um Client Component, a key vaza no bundle JavaScript enviado ao browser.

Mesma situação em `lib/tenant-context.ts` e `lib/dashboard-metrics.ts`.

## Decisão

Todo módulo em `src/lib/` que:
- Acessa variáveis de ambiente secretas (não `NEXT_PUBLIC_*`)
- Faz queries ao banco de dados
- Usa o Supabase server client

DEVE ter `import 'server-only'` como primeira linha.

## Implementação

Adicionar a linha em:
- `src/lib/tenant-context.ts`
- `src/lib/dashboard-metrics.ts`
- `src/lib/agents/intelligence.ts`
- `src/lib/workspace-config.ts` (já tem ✓)

## Consequências

Se um Client Component tentar importar um módulo marcado, o build falha imediatamente com erro claro — prevenção em compile time.
