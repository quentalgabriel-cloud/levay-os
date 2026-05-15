---
title: CLI-First Architecture — Truth Source para AI Agents
type: decision
created: 2026-05-12
confidence: high
tags: [CLI, AI-agents, architecture, autonomy, observability]
---

# CLI-First Architecture — Truth Source para AI Agents

## Estado: ✅ Princípio Adotado

## O que foi decidido

**CLI é a fonte da verdade** onde toda inteligência, execução e automação vivem.

> "CLI is the source of truth where all intelligence, execution and automation live."

## Hierarquia de Arquitetura

```
CLI (Máxima) → Observability (Secundária) → UI (Terciária)
```

| Nível | Características |
|-------|-----------------|
| **CLI** | Funcionalidade completa, testável, automável |
| **Observability** | Dashboards que observam, nunca controlam |
| **UI** | Interface que facilita, não é requisito para operação |

## Regras Core

### I. CLI First
- **MUST**: Toda funcionalidade nova funciona 100% via CLI antes de UI
- **MUST**: Dashboards apenas observam — nunca controlam ou tomam decisões
- **MUST**: UI nunca é requisito para operação do sistema
- **MUST**: Ao decidir onde implementar: CLI > Observability > UI

### II. No Invention (para AI Agents)
- **MUST**: Todo statement em spec/code rastreia para requisito funcional (FR-*)
- **MUST**: Features não presentes nos requisitos não são adicionadas
- **MUST**: Detalhes de implementação não assumidos sem pesquisa

### III. Human-in-the-Loop
- Validação humana final antes de decisões irreversíveis
- Ações destrutivas requerem confirmação explícita
- Outputs de IA são sugestões, não comandos automáticos

## Implicações para Levay OS

| Componente | CLI | Observability | UI |
|-----------|-----|-------------|-----|
| Tarefas | ✅ CRUD via API | ✅ Dashboard | ✅ Form |
| Leads | ✅ Pipeline via API | ✅ CRM view | ✅ Kanban |
| Reservas | ✅ API completa | ✅ Calendário | ✅ Booking |
| Follow-up | ✅ CLI do worker | ⚠️ Log only | ❌ |
| Quality Gates | ✅ API | ⚠️ Pending queue | ✅ UI approval |
| Membership | ✅ API | ⚠️ Ativos/expirando | ❌ |

## Princípio SLC (Simple, Lovable, Complete)

Antes de ship qualquer feature:

> "Se eu mostro isso para um [usuário real] — eles dizem 'wow' ou 'hm, interesting'?"

- **Simple**: Funcionalidade mínima que resolve
- **Lovable**: UX que cria conexão emocional
- **Complete**: Feature que entrega valor completo, não half-baked

## Evitar

- UI criada antes de CLI funcional
- Dashboards que控制的 não só observam
- Features "degradadas" em CLI vs UI
- Invention: adicionar features não-requestadas

## Gaps Conhecidos

| Gap | Status |
|-----|--------|
| Workers observability dashboard | ⚠️ Não feito |
| CLI tool para operators | ❌ Não feito |
| Action tracking em UI | ⚠️ Parcial |

## Links

[[xoia-cycle-agents]], [[stack-tecnologico]], [[production-gaps]], [[process-generator-cli-first]]
