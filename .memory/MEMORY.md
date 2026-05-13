---
title: LevAI Memory System — Master Knowledge Base
type: note
created: 2026-05-12
updated: 2026-05-12
tags: [levai, memory, knowledge-base, obsidian-like]
confidence: high
maintained_by: [Claude-Code, OpenCode, Cursor, Aider, humans]
---

> **⚠️ IMPORTANTE — PARA QUALQUER AI AGENT**: Leia `.memory/schema.md` primeiro para entender como operar esta memória. Este arquivo é o contrato universal para todos os agentes (Claude, OpenCode, Cursor, Aider, etc.).

# LEVAI MEMORY SYSTEM — Master Knowledge Base

## Visão Geral

Sistema de memória do tipo Obsidian para o **Levay OS** (Sistema Interno Grupo Levay). Criado em 2026-05-12. Mantido por agentes AI com supervisão humana.

**Princípio**: Toda decisão, contexto e conhecimento relevante vive aqui. Agentes AI consultam esta base antes de executar. Humanos revisam periodicamente.

---

## Arquitetura do Sistema

```
.memory/
├── decisions/      Decisões arquiteturais e de negócio (autoritativo)
├── context/         Contexto, domínio, processos e integrações
├── notes/           Notas gerais, ideias, experiências
├── sessions/        Histórico de sessões (JSON)
└── index/
    └── index.json  Índice + grafo de links
```

**Hooks**: `levai-memory-session-start.mjs` carrega contexto no início de cada sessão.

---

## Comandos Disponíveis

### LevAI Memory (Técnico/Arquitetural)
| Comando | Quando usar |
|---------|-------------|
| `/memory:search <query>` | Buscar por qualquer conceito |
| `/memory:recall <slug>` | Ler nota específica |
| `/memory:stats` | Ver estatísticas do sistema |
| `/memory:graph <slug>` | Explorar grafo de notas linked |
| `/memory:context` | Decisões e contexto recente |

### Project Memory (Operações/Negócio)
| Comando | Quando usar |
|---------|-------------|
| `/memory operations` | Mapear operações atuais do negócio |
| `/memory bottlenecks` | Identificar gargalos em processos |
| `/memory opportunities` | Descobrir novas frentes e oportunidades |
| `/memory analyze [tema]` | Analisar área específica em profundidade |
| `/memory query [pergunta]` | Consultar a memória de operações |

---

**Nota**: LevAI Memory foca em contexto técnico/arquitetural. Project Memory complementa com análise de operações, gargalos e oportunidades de negócio.

---

## Estrutura de Nota

```markdown
---
title: Título Descritivo
type: decision | context | note
created: 2026-05-12
updated: 2026-05-12
tags: [tag1, tag2, tag3]
confidence: high | medium | low  # Para notas de contexto
---

# Título

Corpo do conteúdo...

Links: [[slug-outra-nota]]
```

---

## Tipos de Nota

### Decision (Decisão)
- **Quando**: Arquitetura, stack, processo, negócio
- **Formato**: O que foi decidido + Por que + Alternativas consideradas + Trade-offs aceitos
- **Autoridade**: Alta — decisões são inverteis apenas com nova decisão documentada

### Context (Contexto)
- **Quando**: Domínio, processos, integrações, estado do projeto
- **Formato**: Descrição factual + Detalhes técnicos + Gaps conhecidos
- **Atualização**: Sempre que fatos mudarem

### Note (Nota)
- **Quando**: Ideias, experimentos, aprendizados, anotações gerais
- **Formato**: Livre

---

## Diretrizes de Qualidade

### Antes de criar nota, verificar:
- [ ] Decisão/contexto já existe? (Buscar antes de criar)
- [ ] Nota pertence ao Levay OS ou é genérica demais?
- [ ] Tem tags suficientes para descoberta?
- [ ] Tem links para notas relacionadas?
- [ ] Contexto está atualizado?

### Para tags:
- Usar **kebab-case**: `multi-tenant`, `follow-up`, `CRM`
- Tags de domínio: `Sollu`, `BicaBar`, `AMP213`, `Holding`
- Tags de tipo: `architecture`, `database`, `integration`, `process`
- Tags de status: `production-ready`, `in-progress`, `deprecated`

### Para links:
- Usar `[[slug]]` para conectar conceitos relacionados
- Cada nota deve ter **mínimo 2 links** para notas relacionadas
- Link bidirecional: se A linked B, B também linked A

---

## Princípios de Conteúdo

### Decisões
1. **O que foi decidido** — frase clara e objetiva
2. **Por que** — justificativa com contexto de negócio
3. **Alternativas consideradas** — e por que foram rejeitadas
4. **Trade-offs aceitos** — transparência sobre custos
5. **Gaps/Gaps críticos** — se houver

### Contexto
1. **Definição** — o que é, por que existe
2. **Como funciona** — fluxo ou arquitetura
3. **Onde está** — paths de arquivo
4. **Gaps** — o que falta ou está quebrado
5. **Próximos passos** — se aplicável

### Evitar
- Notas genéricas sem ação específica
- Duplicação de informação (atualizar existente, não criar novo)
- Tags demais (> 10) ou de menos (< 2)
- Conteúdo vago sem detalhes concretos

---

## Metadados do Sistema

| Métrica | Valor |
|---------|-------|
| Total entries | 28 |
| Decisions | 7 |
| Context | 22 |
| Wiki-links | ~130+ |
| Notes with confidence | 21/21 |
| Notes with updated date | 27/27 |

---

## Índice de Notas

### Decisões (7)

| Slug | Título | Confiança |
|------|--------|-----------|
| `prisma-sqlite-setup` | Prisma + SQLite | ✅ Alta |
| `tenants-multi-tenancy` | Arquitetura Multi-Tenant | ✅ Alta |
| `stack-tecnologico` | Stack Tecnológico | ✅ Alta |
| `xoia-cycle-agents` | XOIA Ciclo + Agentes | ✅ Alta |
| `sollu-followup-by-origin` | Follow-up por Origem | ✅ Alta |
| `cli-first-architecture` | CLI-First Architecture | ✅ Alta |
| `process-generator-cli-first` | Process Generator CLI-First | ✅ Alta |

### Contexto (21)

| Slug | Área | Confiança | Nota |
|------|------|-----------|------|
| `projeto-sistemainterno-grupo-levay` | Projeto | ✅ alta | Visão geral |
| `tres-empresas-dominio` | Domínio | ✅ alta | 3 tenants |
| `vocabulary-labels` | Vocabulário | ✅ alta | Labels obrigatórios |
| `integracoes-externas` | Integrações | ⚠️ média | Gaps: inbound, drive, gateway |
| `workers-background-jobs` | Workers | ⚠️ média | Gaps: BullMQ, monitoring |
| `api-routes-fastify` | API | ✅ alta | Rotas, módulos |
| `supabase-auth` | Auth | ⚠️ média | Gaps: JWT, RBAC |
| `design-system` | Design | ⚠️ média | Gaps: dark-mode |
| `epics-stories-backlog` | Roadmap | ✅ alta | Status épicos/stories |
| `production-gaps` | Gaps | ✅ alta | Críticos + pendentes |
| `getting-started` | Setup | ✅ alta | Como iniciar |
| `xoia-hooks` | Hooks | ✅ alta | 4 hooks configurados |
| `xoia-framework` | Framework | ✅ alta | PLAN→BUILD→CHECK→SHIP |
| `nono-ai-agent` | AI | ⚠️ média | Claude triage agent |
| `crm-whatsapp-sollu` | CRM | ⚠️ média | WhatsApp CRM Sollu |
| `sollu-brand-positioning` | Brand | ⚠️ média | Fonte: sollu-website |
| `offline-first-crm` | CRM | ⚠️ média | Fonte: aidplug-crm |
| `nine-box-evaluation` | HR | ⚠️ média | Performance evaluation |
| `massa-hub-design-system` | Design | ⚠️ baixa | Fonte: aidplug-massa |
| `sollu-crewai-pipeline` | AI | ⚠️ média | Fonte: sollu-crewai |
| `ceo-executive-dashboard` | Epic 6 | ✅ alta | CEO dashboard + analytics API + middleware fix |
| `levai-memory-system` | Sistema | ✅ alta | Este sistema |

---

## Ciclo de Vida de Nota

```
draft → review → approved → maintained → deprecated
```

- **draft**: Criada mas não validada
- **review**: Em revisão por humano
- **approved**: Validada, autoritativa
- **maintained**: Ativamente mantida (decisões)
- **deprecated**: Substituída por nota mais recente

---

## Integridade e Consistência

### Regras de Ouro
1. **Una fonte de verdade**: Cada decisão existe em exatamente uma nota
2. **Links bidirecionais**: A linked B → B linked A
3. **Dates atualizados**: `updated` muda quando conteúdo muda
4. **Confidence score**: Alta/Medium/Low em todas as notas de contexto
5. **Gaps explícitos**: Toda nota de contexto lista gaps conhecidos

### Revisões Periódicas
- A cada sprint: verificar notas marcadas `⚠️ Parcial`
- A cada milestone: auditar decisões para marcar `deprecated` se necessário
- A cada nova integração: atualizar `integracoes-externas`

---

## Comandos de Manutenção

```bash
# Verificar consistência de links
node .claude/commands/levai-memory/memory-manager.mjs index

# Ver estatísticas
node .claude/commands/levai-memory/memory.mjs stats

# Buscar notas órfãs (sem links)
# TODO: implementar

# Buscar gaps críticos
node .claude/commands/levai-memory/memory.mjs search "gap critical TODO"
```

---

*LevAI Memory System v1.0 — Manutenção contínua*
