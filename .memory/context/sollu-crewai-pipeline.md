---
title: Sollu — CrewAI 3-Agent Pipeline
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [Sollu, CrewAI, AI-agents, WhatsApp, automation]
confidence: medium
---

# Sollu — CrewAI 3-Agent Pipeline

## 3-Agents Sequential Pipeline

**Projeto**: `sistema_de_atendimento_automatizado_sollu_v1_crewai-project`

```
Triagem → Estratégico → CRM/Follow-up
```

### Agentes

| Agente | Papel | Modelo |
|--------|-------|--------|
| **Triagem** | Classificar tipo de demanda | GPT-4o-mini |
| **Estratégico** | Analisar e definir estratégia | GPT-4o-mini |
| **CRM/Follow-up** | Atualizar CRM e agendar follow-up | GPT-4o-mini |

### Configuração Comum

```python
model = "openai/gpt-4o-mini"
inject_date = True  # Awareness temporal
allow_delegation = False  # Linear workflow
max_iter = 25  # Conservative limit
```

## Trail Evolution Model

Cada cliente deve seguir jornada lógica:

```
Insights → Raio-X → Estrutura → Capital → Performance
```

### Preço por Trail

| Trail | Estratégia | Preço |
|-------|-----------|-------|
| INSIGHTS | Volume | R$XX |
| RAIO-X | Value | R$XXX |
| CAPITAL | High ticket | R$XXXX |
| PERFORMANCE | Recurring | R$XX/mês |

## Oportunidade para Levay OS

Implementar similar pipeline para:
- **Lead qualification**: Triagem → Qualificação → Proposta
- **Task routing**: Classificação → Alocação → Execução
- **Follow-up automation**: Detecção → Mensagem → Update CRM

## Cross-references

- `[[nono-ai-agent]]` — Nonô (Levay OS triage agent, Claude-based)
- `[[offline-first-crm]]` — AidPlug offline-first architecture
- `[[workers-background-jobs]]` — Follow-up scheduling

## Links

[[tres-empresas-dominio]], [[crm-whatsapp-sollu]], [[nono-ai-agent]], [[production-gaps]]
