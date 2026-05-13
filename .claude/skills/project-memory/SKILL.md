# Project Memory - Sistema Interno Grupo Levay

Skill para **análise de operações e бизнес** que complementa o LevAI Memory System existente.

## Importante: Contrato Universal para Qualquer AI Agent

Esta memória é diseñada para funcionar com **qualquer AI Agent** (Claude, OpenCode, Cursor, Aider, ou qualquer outro). O arquivo `.memory/MEMORY.md` serve como **contrato de contexto** que o agente DEVE ler ao iniciar uma sessão.

Qualquer AI Agent que entrar neste projeto deve:
1. Ler `.memory/MEMORY.md` para entender o sistema
2. Ler `.memory/index/index.json` para ver todas as entradas
3. Respeitar as decisões em `.memory/decisions/` (são autoritativas)
4. Atualizar a memória quando fazer descobertas relevantes
5. Linkar novas notas com notas existentes via `[[slug]]`

## Contexto

O projeto já possui:
- `.memory/decisions/` — Decisões arquiteturais
- `.memory/context/` — Contexto técnico e de domínio

Esta skill adiciona:
- `.memory/operations/` — Estado operacional atual
- `.memory/bottlenecks/` — Gargalos identificados
- `.memory/opportunities/` — Novas frentes e oportunidades
- `.memory/synthesis/` — Análises transversais

## Arquitetura Estendida

```
.memory/
├── decisions/      # Já existe - decisões arquiteturais
├── context/        # Já existe - contexto técnico
├── operations/    # NOVO - operações do negócio
├── bottlenecks/   # NOVO - gargalos identificados
├── opportunities/ # NOVO - novas frentes
├── synthesis/     # NOVO - análises transversais
└── index/
    └── index.json # Atualizado automaticamente
```

## Conceito: Memória Organizacional

Esta skill permite:
1. **Mapear** o que o negócio faz hoje (operações)
2. **Identificar** onde estão os gargalos
3. **Descobrir** oportunidades de melhoria
4. **Sintetizar** análises que conectam tudo

Cada entrada é linkada com a memória existente via `[[slug]]`.

## Comandos

### /memory init
Inicializa estrutura de operações. Cria:
- `operations/overview.md` — Mapa geral das operações
- `bottlenecks/` e `opportunities/` — Diretórios vazios
- Atualiza index.json

### /memory operations
Mapeia as operações atuais do negócio:
- Quais são as áreas/times?
- O que cada área faz no dia a dia?
- Quais processos são críticos?
- Quais ferramentas/sistemas são usados?

Gera: `.memory/operations/overview.md`

### /memory bottlenecks
Executa análise de gargalos:
- Processos que estão lentos ou travados
- Pontos de decisão bottleneck
- Comunicação entre áreas
- Sistemas/ferramentas com problemas
- Falta de recursos

Cada gargalo inclui:
```yaml
---
type: bottleneck
severity: critical | high | medium | low
impact: Quem é afetado e como
root_cause: Por que existe
suggestion: O que fazer
connections: []
---
```

### /memory opportunities [area]
Identifica oportunidades em uma área:
- Automatização possível
- Novas frentes de negócio
- Melhorias em processos
- Integrações que faltam

Cada oportunidade:
```yaml
---
type: opportunity
impact: high | medium | low
effort: high | medium | low
next_steps: Ações para validar
connections: []
---
```

### /memory analyze [topic]
Executa análise profunda:
1. Coleta contexto do que já existe na memória
2. Identifica entidades, processos, conexões
3. Gera página interconectada
4. Atualiza index e log

### /memory sync
Sincroniza a estrutura:
- Verifica se todos os diretórios existem
- Atualiza index.json
- Detecta notas órfãs

### /memory query [question]
Consulta a memória de operações:
- Busca em operations/, bottlenecks/, opportunities/
- Usa contexto do grafo para relevância
- Retorna com referências

## Integração com LevAI Memory

Esta skill complementa (não substitui) a memória existente:

| Memory existente | Esta skill |
|-----------------|-----------|
| decisões técnicas | operações de negócio |
| contexto de código | contexto de processos |
| arquitetura | gargalos e oportunidades |

Quando analisar operações, links para decisões técnicas relevantes:
- [[decisions/stack-tecnologico]] se envolve ferramenta
- [[context/frontend-migration-plan]] se envolve UI
- [[context/production-gaps]] se envolve produção

## Fluxo de Uso

1. Execute `/memory init` uma vez
2. Use `/memory operations` para mapear o que existe
3. Execute `/memory bottlenecks` para encontrar problemas
4. Use `/memory opportunities [area]` para cada área
5. Use `/memory analyze [topic]` para análises específicas
6. Use `/memory query` para perguntar sobre o negócio

## Qualidade das Análises

Cada análise deve incluir:
- **Fonte** — de onde vem a informação (entrevista, documento, observação)
- **Nível de confiança** — alto/médio/baixo
- **Connections** — links para notas relacionadas
- **Próximos passos** — ações concretas

## Exemplo de Entrada

```markdown
---
title: Ciclo de Vendas Longo
type: bottleneck
severity: high
impact: TIME: 时间延长，失去商机 | EQUIPE: frustração com processo
root_cause: Aprovação manual em todas as etapas
suggestion: Automatizar aprovação para tickets > R$500
connections: [[decisions/stack-tecnologico], [context/crm-whatsapp-sollu]]
created: 2026-05-12
updated: 2026-05-12
---

# Ciclo de Vendas Longo

## Descrição
O processo de venda atual requer aprovação manual em cada etapa...

## Dados
- Tempo médio: 15 dias
- Taxa de perda: 23%
- Etapas críticas: [aprovação orçamento, jurídico]
```