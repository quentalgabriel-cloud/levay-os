# Claude Code Hooks

Sistema de governanca automatica do XOIA.

## Arquitetura

```
UserPromptSubmit Hooks
└── (all prompts)  → synapse-engine.cjs

PreToolUse Hooks
└── Write|Edit    → code-intel-pretool.cjs

PreCompact Hooks
└── (manual+auto)  → precompact-session-digest.cjs
```

## Hooks Ativos

### 1. synapse-engine.cjs
**Trigger:** `UserPromptSubmit`

SYNAPSE context engine — injeta contexto de sessao em cada prompt.
- Runtime: `.xoia-core/core/synapse/runtime/hook-runtime.js`
- Session: `.xoia-core/core/synapse/session/session-manager.js`

### 2. code-intel-pretool.cjs
**Trigger:** `PreToolUse` (matcher: `Write|Edit`)

Code intelligence injection — enriquece operacoes de escrita com dados de analise de codigo.
- Runtime: `.xoia-core/core/code-intel/hook-runtime.js`

### 3. precompact-session-digest.cjs
**Trigger:** `PreCompact`

Session digest capture — salva resumo da sessao antes de compactacao de contexto.
- Runner: `.xoia-core/hooks/unified/runners/precompact-runner.js`

## Exit Codes

| Code | Significado |
|------|-------------|
| 0 | Permitido (operacao continua) |
| 2 | Bloqueado (operacao cancelada, mostra stderr) |
| Outro | Erro nao-bloqueante |

## Input Format

Hooks recebem JSON via stdin:

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file"
  },
  "cwd": "/path/to/project"
}
```

## Configuracao

Hooks registrados em `.claude/settings.local.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/synapse-engine.cjs\"", "timeout": 10 }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/code-intel-pretool.cjs\"", "timeout": 10 }]
      }
    ],
    "PreCompact": [
      {
        "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/precompact-session-digest.cjs\"", "timeout": 10 }]
      }
    ]
  }
}
```

**IMPORTANTE:** Claude Code NAO usa filesystem discovery. Cada hook DEVE ser registrado explicitamente.

## Manutencao

Para adicionar novo hook:

1. Criar arquivo `.claude/hooks/novo-hook.cjs` (deve ler stdin JSON, mesmo pattern do synapse-engine.cjs)
2. Registrar em `.claude/settings.local.json` com evento e matcher corretos
3. Documentar neste README
4. Testar com casos reais
