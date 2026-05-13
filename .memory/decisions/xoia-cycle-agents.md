---
title: XOIA — Ciclo Autônomo e Agentes Especialistas
type: decision
created: 2026-05-12
confidence: high
tags: [xoia, autonomous, agents, cycle, PLAN-BUILD-CHECK-SHIP]
---

# XOIA — Ciclo Autônomo e Agentes Especialistas

## Estado: ✅ Aprovada

## O que foi decidido

Adotar **XOIA Framework** como sistema de orquestração de agentes AI para o Levay OS, com ciclo autônomo e 5 agentes especialistas.

## O Ciclo Autônomo

```
PLAN → BUILD → CHECK → SHIP
```

| Modo | Gatilho | Ciclo |
|------|---------|--------|
| **Quick** | Bug fix, ajuste, config, hotfix | BUILD → CHECK → SHIP |
| **Standard** | Feature, landing page | PLAN → BUILD → CHECK → SHIP |
| **Deep** | Arquitetura, brownfield | PLAN (design doc) → BUILD → CHECK → SHIP |

## CHECK Automático

```bash
npm run lint      # Syntax check
npm test          # 45/45 testes passando
npm run typecheck # TypeScript validation
```

Para landing pages: **CRO scoring** (CCD + MECLABS + Core Web Vitals).

## 5 Agentes Especialistas

| Agente | Persona | Expertise | Inspirado em |
|--------|---------|-----------|-------------|
| `@xoia` | Nova | Orquestração, routing, ciclo | Scott Brinker, Karl Sakas |
| `@dev` | Dex | Código, testes, push, PRs | Vlad Magdalin, Dharmesh Shah |
| `@architect` | Aria | Arquitetura, DB, integrações | David Raab, Brian Balfour |
| `@qa` | Quinn | Qualidade, CRO scoring | Peep Laja, Oli Gardner |
| `@product` | Sage | Stories, specs, growth | Sean Ellis, Avinash Kaushik |

## Squad Levay Sollu Execution

### Handoff Sequence
1. `@levay-master` → `*orchestrate-sprint`
2. `@levay-po` → `*validate-scope`
3. `@levay-dev` → `*implement-sollu-slice`
4. `@levay-ux` → `*harden-operations-ui`
5. `@levay-qa` → `*run-quality-gate`
6. `@levay-master` fecha ciclo → próximo slice

### Status Consolidation
- `docs/status/levay-continuity.md` — ponto de consolidação
- Template: `templates/implementation-status-update-tmpl.md`

## Quando Parar e Perguntar

XOIA para e pergunta quando:
- **Ambiguidade**: Não sabe o que o usuário quer
- **Decisão de negócio**: Tradeoffs entre abordagens
- **Credenciais/Acesso**: Necessário mas não disponível
- **Falha 3x**: Após 3 tentativas de correção sem sucesso

## Quality Gates

```
Story Implementation → QA Review → PO Validation → Handoff → Next Slice
```

## Evolução: AIOX → XOIA

| Métrica | Antes (AIOX) | Depois (XOIA) |
|---------|--------------|---------------|
| Agentes | 13 genéricos | 5 especialistas |
| Workflows | 14 | 1 ciclo adaptativo |
| Quality Gates | 6 obrigatórios | 1 automático |
| Comandos | Precisava digitar | Descreve e executa |
| Expertise | Genérica | Carregada com metodologias de mercado |

## Gaps

| Gap | Prioridade |
|-----|-----------|
| Squad health check configurado | ✅ Feito (`squads/levay-sollu-execution/`) |
| Status consolidation rodando | ⚠️ Manual |
| Handoff automatizado entre agentes | ❌ Não implementado |

## Links

[[xoia-framework]], [[xoia-hooks]], [[stack-tecnologico]], [[epics-stories-backlog]], [[production-gaps]]
