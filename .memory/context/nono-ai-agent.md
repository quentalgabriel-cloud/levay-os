---
title: Nonô — AI Triage Agent
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [AI, anthropic, claude, triage, intelligence, nono]
confidence: medium
gaps: [fallback-manual, history-not-persisted, no-confidence-scoring, no-audit-trail]
---

# Nonô — AI Triage Agent

## O que é

Nonô é o agente de triagem AI do sistema Levay OS. Usa Anthropic Claude para classificar captures (capturas de informações) em categorias operacionais.

## Arquivos

- `apps/levay-os/src/lib/agents/intelligence.ts` — Core do agente
- `apps/levay-os/src/lib/agents/prompts.ts` — Prompts do Nonô

## Como funciona

### Input
- Texto livre da captura
- Contexto do tenant

### Output
```typescript
{
  cockpitBlock: "HOJE" | "DECIDIR" | "DELEGAR",
  title: string,
  status: "PENDING" | "EM_ANDAMENTO",
  priority: 1 | 2 | 3 | 4,  // 1=highest
  minimum_movement: string,
  company_slug: string
}
```

### Fluxo

1. Usuário descreve tarefa em texto livre
2. Nonô extrai informações estruturadas
3. Sistema cria Task com campos preenchidos
4. Cockpit block determinado pelo Nonô

## Configuração

### Env Required
```
ANTHROPIC_API_KEY
```

### Model
```
claude-3-5-sonnet-20241022
```

### Erro se Missing
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY não configurada");
}
```

## Prompts

- Triagem em português
- Foco em categorização operacional
- Extração de: título, bloco cockpit, prioridade, movimentação mínima
- Validação de campos obrigatórios

## Gaps

1. **Fallback manual**: Se Nonô falhar, não há processo de retry
2. **Histórico de triagem**: Não persiste resultado da IA
3. **Confidence scoring**: Não há score de confiança da IA
4. **Audit trail**: Não registra qual triagem a IA fez

## Cross-references

- `[[sollu-crewai-pipeline]]` — CrewAI sequential pipeline (GPT-4o-mini)
- `[[workers-background-jobs]]` — Where follow-ups are dispatched
- `[[vocabulary-labels]]` — Labels Nonô assigns (hoje, decidir, delegar)

## Links

[[stack-tecnologico]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]]
