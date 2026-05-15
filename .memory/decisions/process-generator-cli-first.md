---
title: Process Generator — CLI-First Architecture
type: decision
created: 2026-05-12
updated: 2026-05-12
confidence: medium
tags: [process, CLI, XOIA, automation, BPMN]
---

# Process Generator — CLI-First Architecture

## Decisão: CLI-First como Truth Source

**Projeto**: `gerador-de-processos`

**Declaração**: "CLI is the source of truth where all intelligence, execution and automation live."

**Rational**: AIOS/Bica should follow same principle — CLI enables AI agent autonomy.

## Princípios Core

### 1. Story-Driven Development
Todo desenvolvimento começa e termina com uma story. Cada feature rastreável a requisitos documentados.

### 2. No Invention Rule
"Especificações não inventam — apenas derivam dos requisitos."

**Implicação**: AI não adiciona features não-requestadas.

### 3. Human-in-the-Loop Validation
Validação humana final antes de decisões irreversíveis.

## Process Output Structure

```typescript
{
  priority: "high" | "medium" | "low",
  suggestedOwner: string,
  deadline: Date,
  destination: "notion" | "queue" | "other",
  confidence: number, // 0-1
  uncertainties: string[] // marked gaps
}
```

**Insight**: Ações estruturadas com metadata — não apenas texto.

## Methodology Selection

Baseado em características do processo:

| Metodologia | Quando Usar |
|------------|-------------|
| **BPMN** | Processos repetitivos, sequência fixa |
| **CMMN** | Processos dependentes de contexto, caso-based |
| **DMN** | Processos decision-heavy, regras de negócio |

## Oportunidades para Levay OS

1. **Structured Action Objects**: Implementar ações com owner, deadline, destination
2. **Confidence Scoring**: Mostrar nível de confiança em conteúdo gerado
3. **Uncertainty Tracking**: Marcar lacunas e pendências
4. **Methodology Selection**: Auto-detectar tipo de processo

## Links

[[stack-tecnologico]], [[xoia-cycle-agents]], [[production-gaps]]
