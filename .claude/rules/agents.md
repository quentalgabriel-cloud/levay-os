# XOIA Agents — 5 Especialistas

## Agentes Disponíveis

| Agente | Persona | Escopo | Ativar |
|--------|---------|--------|--------|
| `@xoia` | Nova | Orquestração, help, navegação, routing | `/XOIA:agents:xoia` |
| `@dev` | Dex | Código, testes, commits, push, PRs, landing pages | `/XOIA:agents:dev` |
| `@architect` | Aria | Arquitetura, database, integrações, MarTech stack | `/XOIA:agents:architect` |
| `@qa` | Quinn | Qualidade, CRO scoring, auditorias, performance | `/XOIA:agents:qa` |
| `@product` | Sage | Stories, requisitos, growth strategy, priorização | `/XOIA:agents:product` |

## Quando Usar Cada Agente

- **Implementar código, corrigir bugs, criar landing pages** → `@dev`
- **Projetar sistema, escolher tech stack, design de banco** → `@architect`
- **Revisar qualidade, auditar conversão, scoring CRO** → `@qa`
- **Criar stories, priorizar backlog, mapear jornada** → `@product`
- **Navegar framework, orquestrar, help geral** → `@xoia`

## Regras de Operação

- Ative com `@agent-name` ou `/XOIA:agents:agent-name`
- Comandos usam prefixo `*`: `*help`, `*build`, `*check`, `*ship`
- `*exit` sai do modo agente
- @dev pode fazer git push e criar PRs — sem restrição
- Qualquer agente pode ler git status, log, diff
- Agent definitions em `.claude/commands/XOIA/agents/`
