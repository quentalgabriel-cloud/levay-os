---
title: 9 Box System — Performance Evaluation
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [evaluation, performance, 9-box, Bica, AMP, people]
confidence: medium
---

# 9 Box System — Performance Evaluation

## Contexto

**Projeto**: Sistema interno de avaliação de performance para Bica Bar + AMP 213.

**Problema**: Avaliação atual é manual, desconectada da realidade diária, inconsistente entre gestores, baixa frequência.

## Modelo 70/30

```
70% — Core Comum
  - Comportamento
  - Desempenho
  - Trabalho em equipe
  - Disciplina
  - Comunicação
  - Higiene

30% — Papel/Contexto Específico
  - Garçom: foco em salão, ritmo, atendimento
  - Bartender: foco em padrão, velocidade, controle
  - Cozinha: foco em timing, consistência, desperdício
```

## 9 Box Zones

| Zone | Box | Action |
|------|-----|--------|
| **⭐ Star** | Estrela | Amplify |
| **👍 Good** | Forte/comportamento, Forte/desempenho | Develop |
| **💎 Mid** | Diamante/bruto, Mediano, Especialista | Monitor |
| **👀 Watch** | Questionável, Dubio | Coach |
| **⚠️ Risk** | Insuficiente | Intervene |

## Evaluation Flow

```
1. Open dashboard → team overview, recent evals, pending follow-ups
2. Select employee → from list with search/filter
3. Confirm context → role, context (bar/events), shift/event
4. Guided evaluation → common criteria → role-specific criteria
5. Submit and interpret → scores → Nine Box quadrant
6. Save follow-up → notes, action plan with goal/owner/checkpoint
7. Return to history → evaluation saved, visible in dashboard
```

## Scoring Algorithm

- **Scale**: 1-5 per criterion
- **Behavior score**: average of behavior criteria
- **Performance score**: average of performance criteria
- **Level mapping**:
  - >= 3.7 = high
  - >= 2.7 = mid
  - < 2.7 = low
- **Nine Box**: behavior level × performance level

## Design Patterns

### 1. Progressive Disclosure
Deep explanations escondidas atrás de disclosure, mostradas apenas quando necessário.

### 2. Operational Language Priority
"Linguagem da casa" — vocabulário do bar/eventos, não RH corporativo.

### 3. Three Outcomes Test
Se feature não ajuda a **avaliar mais rápido**, **entender melhor**, ou **agir mais claramente** → não pertence.

### 4. Context-Aware Suffixes
Recomendações customizadas por contexto:
- **Bar context**: "Use o próximo turno como checkpoint"
- **Events context**: "Use o próximo evento como checkpoint"

## Oportunidade

Integrar 9 Box evaluation system no Levay OS:
- Criar modelo `PerformanceEvaluation`
- UI de evaluation flow
- Dashboard de follow-ups
- Action plans vinculados a funcionários

## Links

[[tres-empresas-dominio]], [[stack-tecnologico]], [[production-gaps]]
