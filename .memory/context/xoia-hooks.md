---
title: XOIA Hooks — hooks do Sistema
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [hooks, synapse, code-intel, precompact, Claude-Code]
confidence: high
---

# XOIA Hooks — Sistema de Hooks

## Hooks Configurados

### 1. synapse-engine
**File**: `.claude/hooks/synapse-engine.cjs`
**Trigger**: UserPromptSubmit
**Purpose**: Injeção de contexto antes do prompt do usuário

### 2. code-intel
**File**: `.claude/hooks/code-intel-pretool.cjs`
**Trigger**: PreToolUse (Write/Edit)
**Purpose**: Code intelligence antes de operações de escrita

### 3. precompact-session-digest
**File**: `.claude/hooks/precompact-session-digest.cjs`
**Trigger**: PreCompact
**Purpose**: Resumo de sessão antes de compactação de contexto

### 4. levai-memory-session-start (nosso novo)
**File**: `.claude/commands/levai-memory/levai-memory-session-start.mjs`
**Trigger**: SessionStart
**Purpose**: Carregar contexto do projeto no início da sessão

## Configuração (settings.local.json)

```json
{
  "hooks": {
    "SessionStart": [{
      "command": "node \"$PWD/.claude/commands/levai-memory/levai-memory-session-start.mjs\"",
      "description": "LevAI Memory — load project context on session start"
    }]
  }
}
```

## Ordem de Execução de Hooks

1. **SessionStart**: Carrega contexto do projeto
2. **UserPromptSubmit**: synapse-engine injeta contexto
3. **PreToolUse**: code-intel analisa escrita
4. **PreCompact**: precompact-session-digest resume sessão

## Links

[[xoia-cycle-agents]], [[levai-memory-system]], [[stack-tecnologico]], [[xoia-framework]], [[production-gaps]]
