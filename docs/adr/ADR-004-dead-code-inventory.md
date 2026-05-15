# ADR-004 — Inventário de Dead Code

**Status:** Pendente remoção
**Data:** 2026-05-15

## Dead code confirmado — remover

| Arquivo | Por que é dead code |
|---------|---------------------|
| `src/components/AppNav.tsx` | Substituído por `Sidebar.tsx` — documentado em AGENTS.md |
| `src/lib/actions/tasks.ts` | Duplicata de `src/app/actions/tasks.ts` — não é importado |
| `src/app/api/executive/route.ts` | Endpoint quebrado — filtros JS por string nunca batem em UUID |
| `src/app/(app)/configuracoes/page.tsx` | Salva SUPABASE keys no localStorage — vulnerabilidade |

## Legacy arquivado (não remover — histórico)

| Localização | O que era |
|-------------|-----------|
| `apps/_legacy/api/` | API Fastify legada (JS) |
| `apps/_legacy/web/` | Dashboard web legado (JS) |
| `apps/_legacy/workers/` | Workers de fila legados (JS) — não estão rodando |
| `apps/_legacy/packages/` | Integrações WhatsApp, pagamentos (JS) |

## Decisão

Remover dead code listado na tabela 1 em sprint dedicada.
Nunca importar nada de `apps/_legacy/` no app ativo.
