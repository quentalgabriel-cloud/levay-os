# XOIA — Levay OS

Framework de orquestração de agentes AI para o sistema interno do Grupo Levay.

> **Novo por aqui?** Leia `PROJECT.md` na raiz primeiro — brief completo do projeto em 1 página.

## Como usar

Descreva o que precisa em linguagem natural. O XOIA detecta o modo e executa:

```
USUARIO: "Corrige o bug de supabase: any no tenant-context.ts"
XOIA:    BUILD → CHECK → SHIP (modo Quick)

USUARIO: "Implementa normalização das RLS policies"
XOIA:    PLAN → BUILD → CHECK → SHIP (modo Deep — toca DB)
```

## The Cycle

```
PLAN  →  BUILD  →  CHECK  →  SHIP
```

| Modo | Detectado quando | Ciclo |
|------|-----------------|-------|
| **Quick** | Bug fix, ajuste, config | BUILD → CHECK → SHIP |
| **Standard** | Feature nova, integração | PLAN → BUILD → CHECK → SHIP |
| **Deep** | Arquitetura, migration, RLS | PLAN (design) → SECURITY GATE → BUILD → CHECK → SHIP |

## Security Gate (obrigatório no modo Deep)

Toda mudança que toque banco de dados, RLS, auth ou env vars passa pelo Security Gate antes do BUILD:

- RLS policy cobre a tabela nova?
- `current_workspace_id()` está com schema explícito (`public.`)?
- `import 'server-only'` presente em módulos com acesso a DB?
- Migration é idempotente (tem `IF NOT EXISTS` / `IF EXISTS`)?

Se qualquer resposta for não → parar e resolver antes de codar.

## CHECK (o que é validado)

```bash
npm run lint && npm test && npm run typecheck
```

Para mudanças em DB/migrations, CHECK também verifica:
- Drift: schema declarado vs. prod (`supabase migration list`)
- RLS: toda tabela nova tem policy de SELECT/INSERT/UPDATE/DELETE

## Agents

| Ativar | Agente | Quando usar |
|--------|--------|-------------|
| `@dev` | Dex | Código, features, commits, PRs |
| `@architect` | Aria | Arquitetura, DB, migrations, RLS |
| `@qa` | Quinn | Qualidade, auditoria, segurança |
| `@product` | Sage | Stories, specs, priorização |
| `@xoia` | Nova | Orquestração, routing, status |

## Quando o XOIA para e pergunta

1. Ambiguidade no pedido
2. Decisão de negócio (tradeoff)
3. Credenciais ou acesso necessário
4. Falha após 3 tentativas
5. Operação destrutiva (drop table, force push, delete de dados)

## Convenções

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Stories em `docs/stories/`
- ADRs em `docs/adr/`
- Tools: `Read`/`Write`/`Edit` para arquivos, `Bash` para comandos, `Glob`/`Grep` para busca

---
*XOIA Framework — Levay OS v1.1*
