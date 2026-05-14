---
title: Sprint Foundation v1.1 — Schemas, RLS Fix e Mesa
type: decision
created: 2026-05-13
updated: 2026-05-13
confidence: high
tags: [sprint, schema, rls, security, mesa, v1.1, contradicoes, defaults]
---

# Sprint Foundation v1.1 — 2026-05-13

## Contexto

Sprint executada após auditoria do dia: dia 1 (manhã) = planejamento + documentação;
dia 1 (tarde) = implementação. Plano em [[../docs/PLANO-MELHORIAS-V1.1.md]].
Decisões arquiteturais herdadas de [[arquitetura-ecossistema-definitivo]].

## O Que Foi Entregue

### 1. Fase 0 — Saneamento

- Corrigido bug residual em `src/lib/tenant-context.ts`:
  - `getWorkspaceContext`: adicionado `.order('created_at', { ascending: true })` antes do `.limit(1)` — determinístico para usuários multi-workspace (caso Taynan)
  - `requireAuth`: agora filtra pelo `workspace_id` já selecionado em `getWorkspaceContext` (consistência entre as duas queries)
  - `isWorkspaceMember`: `.single()` → `.maybeSingle()` (não lança erro quando 0 resultados)
- Apps deprecated marcados via DEPRECATED.md (apps/api, apps/web — arquivamento físico adiado por dependência em scripts/start-stack.mjs)

### 2. Fase 1 — Schema Foundation

7 migrations aplicadas em prod (`anwtivdognjrghipardd`):

| Migration | Tabela/escopo | Mudança |
|-----------|---------------|---------|
| `v1_1_010_companies_dna_fields` | companies | + cluster, escopo (enum), 9 DNA fields + seed 3 empresas |
| `v1_1_020_projects_foco_trimestral` | projects | + foco_trimestral |
| `v1_1_030_decisions_impacto_pratico_required` | decisions | practical_change NOT NULL + CHECK não-vazio |
| `v1_1_040_collaborators_vinculo_alocacoes_v3` | collaborators + alocacoes | + vinculo, status_employment + tabela alocacoes |
| `v1_1_050_lacunas` | lacunas | NEW: issue tracker leve |
| `v1_1_060_workspace_config` | workspace_config | NEW: tenant config + 4 defaults |
| `v1_1_070_rls_enforcement_legacy_tables` | 8 tabelas core | **CRÍTICO**: habilitou RLS em workspaces+companies+tasks+projects+decisions+events+crm_clients+collaborators |

### 3. Vulnerabilidade Crítica Encontrada e Corrigida

**Achado:** 8 tabelas core (workspaces, companies, tasks, projects, decisions, events, crm_clients, collaborators) tinham policies criadas mas RLS **desabilitada** — qualquer usuário autenticado podia ler/escrever em qualquer workspace. Provável raiz: a migration `20260512_enable_rls_workspace_isolation` aplicou `ALTER TABLE ... ENABLE RLS` originalmente, mas a memória `bug-workspace-members-single` registra que foram "Dropadas políticas problemáticas em get_my_workspace_id()" — esse drop provavelmente derrubou junto o estado de RLS.

**Correção:** migration `v1_1_070_rls_enforcement_legacy_tables`:
- `ENABLE ROW LEVEL SECURITY` nas 8 tabelas
- Adicionadas policies faltantes (`workspaces` SELECT, `collaborators` INSERT/UPDATE/DELETE, DELETE em 5 tabelas)
- Hardened 5 SECURITY DEFINER functions com `SET search_path = public, pg_temp`
- Resultado advisors: 15 ERRORs → **0 ERRORs**

### 4. Fase 2 — Server Actions + Lib

- `src/app/actions/decisions.ts` (NEW) — Zod-validated, enforce `practical_change` obrigatório
- `src/app/actions/lacunas.ts` (NEW) — Zod-validated, auto-set `resolvida_em` quando status fecha
- `src/app/actions/companies.ts` (UPDATED) — adicionado helper `readDnaFields` com 11 DNA fields opcionais
- `src/app/actions/projects.ts` (UPDATED) — leitura de `modality` e `foco_trimestral` (antes hardcoded 'pontual')
- `src/lib/workspace-config.ts` (NEW) — React `cache()` para ler `workspace_config` JSONB com defaults seguros
- `src/app/actions/index.ts` (UPDATED) — re-exporta decisions + lacunas

### 5. Fase 3 — Mesa do Diretor v1

- Cap "Hoje" agora lê de `workspace_config.cap_hoje` via `getCapHoje()` (default 3, antes era hardcoded 20)
- Label do bloco Hoje exibe "Hoje · max N"
- Quadrante Alertas agora inclui `lacunas` impacto=ALTO + status=ABERTA (além das tasks sem movimento existentes)
- `alertCount` atualizado para contemplar 3 fontes (lacunas + tasks sem movimento + decisões pendentes)

## Defaults Aplicados (revogáveis via `workspace_config`)

5 contradições do plano v1.1 resolvidas com defaults conservadores:

| # | Contradição | Default aplicado | Onde mudar |
|---|-------------|------------------|------------|
| 1 | Cap Hoje (3 ou 4?) | **3** | `UPDATE workspace_config SET value='4' WHERE key='cap_hoje'` |
| 2 | Paleta de cores | **'legado'** (Sollu #2563EB / Bica #7C3AED / AMP #EA580C) | `UPDATE workspace_config SET value='"fase3"' WHERE key='palette_version'` |
| 3 | Bica+AMP cluster | **'bica+amp'** (2 empresas separadas com cluster compartilhado) | `UPDATE workspace_config` + campo `companies.cluster` |
| 4 | Porta de entrada | **'/mesa'** (middleware já redireciona) | `UPDATE workspace_config SET value='"/empresas"' WHERE key='entry_route'` |
| 5 | WhatsApp Sollu owner | **adiado** | adicionar key futura |

## Adiado Conscientemente

Não está nesta sprint, registrado em PLANO-MELHORIAS-V1.1.md:

- Schemas Postgres por domínio (`sollu.*`, `bica.*`, `amp.*`, `platform.*`) — adiado para Fase 3+
- Two-step capture/triage com SLA 48h
- Pergunta-bloqueio de 3 etapas para tarefas do Erick
- Integração Whascale
- Apple Reminders sync
- KPIs instrumentados completos
- Páginas /decisoes, /colaboradores, /empresas, /projetos não foram atualizadas para exibir DNA/modality/lacunas — actions estão prontas, UI vira próxima sprint
- Modal "Qual sai?" ao adicionar 4ª task em HOJE — Mesa já enforça via LIMIT capHoje, modal é UX refinement

## Como Re-Verificar

```bash
# Advisors de segurança Supabase (esperado: 0 ERRORs)
# Via MCP: mcp__claude_ai_Supabase__get_advisors

# Typecheck (esperado: exit 0)
node_modules/typescript/bin/tsc --noEmit --project apps/levay-os/tsconfig.json

# Migrations aplicadas (esperado: ver as 7 v1_1_* listadas)
# Via MCP: mcp__claude_ai_Supabase__list_migrations
```

## Links

[[arquitetura-ecossistema-definitivo]], [[avaliacao-tecnica-2026-05-13]]
