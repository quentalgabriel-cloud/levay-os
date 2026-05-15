# ADRs — Architecture Decision Records

Registro de decisões arquiteturais do Levay OS. Leia antes de implementar features que toquem DB, auth ou segurança.

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-001](ADR-001-rls-helper-function.md) | Padronização do Helper de RLS | Pendente |
| [ADR-002](ADR-002-server-only-imports.md) | import 'server-only' Obrigatório em lib/ | Pendente |
| [ADR-003](ADR-003-supabase-client-typing.md) | Tipagem do Supabase Client | Pendente |
| [ADR-004](ADR-004-dead-code-inventory.md) | Inventário de Dead Code | Pendente remoção |
| [ADR-005](ADR-005-security-headers.md) | Headers de Segurança HTTP | Pendente |

## Como criar um novo ADR

Arquivo: `docs/adr/ADR-NNN-slug.md`

```
# ADR-NNN — Título

**Status:** Proposta | Aceita | Rejeitada | Depreciada
**Data:** YYYY-MM-DD

## Contexto
## Decisão
## Consequências
```
