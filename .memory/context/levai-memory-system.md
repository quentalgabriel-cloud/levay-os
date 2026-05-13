---
title: LevAI Memory System — Project Memory
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [levai, memory, knowledge-graph, obsidian-like]
confidence: high
maintained_by: [Claude-Code, humans]
---

# LevAI Memory System

Sistema de memória para o projeto Sistema Interno Grupo Levay. Inspirado no Obsidian com graph view, wiki-links e busca semântica.

## Arquitetura

- `.memory/notes/` — Notas gerais
- `.memory/decisions/` — Decisões de arquitetura e negócio
- `.memory/context/` — Contexto de projeto
- `.memory/index/index.json` — Índice invertido + grafo de links
- `.memory/sessions/` — Histórico de sessões

## Modelo Prisma

MemoryEntry, MemoryLink, MemorySession

## Comandos

| Comando | Quando usar |
|---------|-------------|
| `/memory:save` | Salvar estado da sessão |
| `/memory:search <query>` | Buscar por qualquer conceito |
| `/memory:recall <slug>` | Ler nota específica |
| `/memory:stats` | Ver estatísticas do sistema |
| `/memory:graph <slug>` | Explorar grafo de notas linked |
| `/memory:context` | Decisões e contexto recente |
| `/memory:decision` | Registrar decisão |
| `/memory:note` | Criar nota |

## Note Lifecycle

```
draft → review → approved → maintained → deprecated
```

Every note has:
- `type`: `decision` | `context` | `note`
- `confidence`: `high` | `medium` | `low`
- `gaps`: Array of known gaps (context notes only)
- `updated`: Last modified date
- `tags`: kebab-case, min 2

## AI Pipeline Integration

| Agente | Tecnologia | Papel |
|--------|-----------|-------|
| Nonô | Claude 3.5 Sonnet | Triage, classificação de tasks |
| CrewAI | GPT-4o-mini | Pipeline Sollu (Triagem→Estratégico→CRM) |
| XOIA | Mix | Orquestração, routing, ciclo autônomo |
| LevAI Memory | — | Persistência de contexto entre sessões |

## Cross-references

- `[[xoia-hooks]]` — Hook que carrega memória no SessionStart
- `[[xoia-cycle-agents]]` — XOIA cycle: PLAN→BUILD→CHECK→SHIP
- `[[nono-ai-agent]]` — Levay OS triage agent (Claude-based)
- `[[sollu-crewai-pipeline]]` — 3-agent CrewAI pipeline

## Links

[[projeto-sistemainterno-grupo-levay]], [[xoia-framework]], [[prisma-sqlite-setup]], [[xoia-hooks]], [[xoia-cycle-agents]]
