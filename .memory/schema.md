---
title: Memory Schema — Contrato para AI Agents
type: schema
created: 2026-05-12
updated: 2026-05-12
---

# Memory Schema — Contrato para AI Agents

> **IMPORTANTE**: Este arquivo é o contrato que QUALQUER AI Agent deve ler ao iniciar neste projeto. Todos os agentes (Claude, OpenCode, Cursor, Aider, etc.) devem respeitar este schema.

---

## Propósito

Este projeto usa um sistema de memória em camadas:
1. **LevAI Memory** (técnico/arquitetural) — decisões, contexto de código
2. **Project Memory** (operações/negócio) — processos, gargalos, oportunidades

O agente deve ler `.memory/MEMORY.md` para visão completa.

---

## Estrutura de Diretórios

```
.memory/
├── decisions/      # DECISÕES AUTORITATIVAS (não alterar sem nova decisão)
├── context/        # CONTEXTO (fatos, domínio, processos)
├── operations/     # OPERAÇÕES (estado atual do negócio)
├── bottlenecks/    # GARGALOS (problemas identificados)
├── opportunities/ # OPORTUNIDADES (novas frentes)
├── synthesis/      # SÍNTESES (análises transversais)
├── index/
│   └── index.json  # ÍNDICE AUTOMÁTICO
└── MEMORY.md       # VISÃO GERAL (sempre ler primeiro)
```

---

## Tipos de Nota e Sua Autoridade

| Tipo | Diretório | Autoridade | Quando Criar |
|------|-----------|------------|--------------|
| decision | decisions/ | **ALTA** — inverteável apenas com nova decisão | Arquitetura, stack, processo |
| context | context/ | MÉDIA — pode ser atualizado | Domínio, integração, estado |
| operations | operations/ | MÉDIA — mapeia estado atual | O que o negócio faz |
| bottleneck | bottlenecks/ | MÉDIA — problema documentado | Processos lentos, travados |
| opportunity | opportunities/ | BAIXA — sugestão, precisa validar | Novas frentes, melhorias |
| synthesis | synthesis/ | MÉDIA — análise validada | Conclusões de análise |

---

## Formato de Nota (OBRIGATÓRIO)

Todas as notas DEVEM seguir este formato:

```markdown
---
title: Título Descritivo
type: [decision | context | operations | bottleneck | opportunity | synthesis]
tags: [tag1, tag2]
connections: [[slug-relacionado-1], [slug-relacionado-2]]
related: [[slug-relacionado-1]]
confidence: high | medium | low  # Apenas para context e operations
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Título

Conteúdo da nota...
```

### Campos Obrigatórios
- `title`: Título legível
- `type`: Tipo da nota
- `created`: Data de criação (YYYY-MM-DD)
- `updated`: Data de última atualização
- `connections`: Links para outras notas relacionadas

### Campos Opcionais por Tipo
- `confidence`: high/medium/low (context, operations)
- `severity`: critical/high/medium/low (bottleneck)
- `impact`: Descrição do impacto (bottleneck, opportunity)
- `effort`: high/medium/low (opportunity)
- `root_cause`: Causa raiz (bottleneck)
- `suggestion`: Sugestão de ação (bottleneck)

---

## Regras de Ouro

1. **SEMPRE ler `.memory/MEMORY.md` primeiro** ao iniciar sessão
2. **Decisões são autoritativas** — não Reverta sem nova decisão documentada
3. **Links bidirecionais** — se A linka B, B também deve linkar A
4. **Atualizar `updated`** — sempre que conteúdo mudar
5. **Connections obrigatórias** — mínimo 2 links para notas relacionadas
6. **Buscar antes de criar** — verificar se nota já existe

---

## Como Pesquisar a Memória

O agente pode usar:
- `.memory/index/index.json` — lista todas as notas
- Busca por `[[slug]]` — encontra notas relacionadas
-grep em arquivos `.memory/` — buscar termos específicos

---

## Quando Atualizar a Memória

O agente DEVE criar/atualizar nota quando:
- Tomar decisão arquitetural → `.memory/decisions/`
- Descobrir contexto relevante → `.memory/context/`
- Mapear processo de negócio → `.memory/operations/`
- Identificar gargalo → `.memory/bottlenecks/`
- Encontrar oportunidade → `.memory/opportunities/`
- Criar análise transversal → `.memory/synthesis/`

---

## Formato de Busca

Para encontrar informações na memória:
```bash
# Listar decisões
grep -r "type: decision" .memory/decisions/

# Encontrar nota específica
cat .memory/decisions/stack-tecnologico.md

# Ver todas as notas de um tipo
cat .memory/index/index.json | jq '.entries[] | select(.type=="operations")'
```

---

## Integração com CLAUDE.md

- **CLAUDE.md** = instruções de como escrever código
- **.memory/** = contexto de negócio e operações

O agente deve consultar ambos: código (CLAUDE.md) + contexto (memory).

---

*Este schema é válido para qualquer AI Agent. Qualquer dúvida, ler `.memory/MEMORY.md` primeiro.*