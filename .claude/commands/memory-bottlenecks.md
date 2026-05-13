# Memory Bottlenecks

Identifica gargalos nos processos e operações do negócio.

## Descrição

Executa análise focada em identificar:
- Processos operacionais lentos ou travados
- Pontos de decisão bottlenecks
- Comunicação entre áreas
- Sistemas e ferramentas com problemas
- Falta de recursos ou pessoas
- Dependências que causam espera

## Ação

O sistema deve:
1. Analisar as operações conhecidas
2. Identificar pontos de gargalo
3. Classificar por severidade (crítico, alto, médio, baixo)
4. Sugerir ações para cada gargalo
5. Registrar em `.memory/bottlenecks/`

## Formato de Saída

```markdown
---
title: Nome do Gargalo
type: bottleneck
severity: alto
tags: [processo, area]
connections: [processo-relacionado]
created: 2026-05-12
---

# Nome do Gargalo

## Descrição
[O que é e como afeta]

## Impacto
[Como prejudica a operação]

## Causa Raiz
[Por que existe]

## Sugestão de Ação
[O que fazer para resolver]

## related_bottlenecks:
- [outro gargalo relacionado]
```