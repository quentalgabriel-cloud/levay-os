---
title: Vocabulário — Labels Obrigatórios do Sistema
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [vocabulary, labels, status, UI, mandatory]
confidence: high
---

# Vocabulário — Labels Obrigatórios do Sistema

## Regras de Ouro

⚠️ **NÃO usar "Atrasado"** → Usar "Pede atenção"
⚠️ **NÃO usar "Concluído"** → Usar "Ciclo fechado"
⚠️ **NÃO usar "Pendente"** → Usar "Em movimento"
⚠️ **NÃO usar "Concluído"** → Usar "Fechar ciclo"

## Task Status

| Código (DB) | Label (UI) | Significado |
|-------------|------------|------------|
| `inbox` | "Inbox" | Nova tarefa recebida |
| `em_movimento` | "Em movimento" | Em execução |
| `aguardando` | "Aguardando" | Aguardando resposta/ação externa |
| `fechar_ciclo` | "Pede atenção" | Requer atenção do dono |
| `ciclo_fechado` | "Ciclo fechado" | Finalizada com sucesso |

## Task Cockpit Blocks

| Código | Label | Significado |
|--------|-------|------------|
| `hoje` | "Capturar" | Capturar agora |
| `today` | "Hoje" | Tarefa para hoje |
| `decidir` | "Decidir" | Requer decisão |
| `delegar` | "Delegar" | Delegar para outro |
| `no-movement` | "Sem Movimento" | Sem movimento mínimo |

## Movimentação Mínima (OBRIGATÓRIO)

⚠️ **CAMPO OBRIGATÓRIO EM TODA TAREFA**
⚠️ **"block save without it"** — Não salva sem preenchimento

- Campo: `movimentoMinimo`
- Cockpit block "no-movement": Mostra tarefas SEM este campo
- Propósito: Evitar tarefas esquecidas sem下一步

## Project Status

| Código | Label |
|--------|-------|
| `ativo` | Em Andamento |
| `pausado` | Pausado |
| `concluido` | Concluído |
| `arquivado` | Arquivado |

## Decision Status

| Código | Label |
|--------|-------|
| `rascunho` | Rascunho |
| `decidido` | Decidido |
| `revisao` | Em Revisão |

## CRM Pipeline (Sollu)

| Status | Label | Próximo |
|--------|-------|---------|
| `NOVO` | Novo | Contatar |
| `CONTATADO` | Contatado | Qualificar |
| `QUALIFICADO` | Qualificado | Negociar |
| `NEGOCIANDO` | Negociando | Ganho ou Perdido |
| `GANHO` | Ganho | — |
| `PERDIDO` | Perdido | — |

## Receivable Status

| Código | Label |
|--------|-------|
| `PENDING` | Pendente |
| `PAID` | Pago |
| `OVERDUE` | Vencido |
| `CANCELLED` | Cancelado |

## Reservation Status

| Código | Label |
|--------|-------|
| `PENDING` | Pendente |
| `CONFIRMED` | Confirmada |
| `CANCELLED` | Cancelada |
| `COMPLETED` | Finalizada |

## Quality Gate Status

| Código | Label |
|--------|-------|
| `PENDING` | Aguardando |
| `APPROVED` | Aprovado |
| `REJECTED` | Rejeitado |

## Tenant Slugs

| Tenant | Slug |
|--------|------|
| Grupo Holding | `holding` |
| Sollu | `sollu` |
| AMP 213 | `amp213` |
| Bica Bar | `bicabar` |

## Source (Leads)

| Código | Label |
|--------|-------|
| `organic` | Orgânico |
| `referral` | Indicação |
| `ads` | Anúncio |
| `cold` | Frio |

## Links

[[tres-empresas-dominio]], [[projeto-sistemainterno-grupo-levay]], [[stack-tecnologico]], [[nono-ai-agent]], [[design-system]]

[[tres-empresas-dominio]], [[projeto-sistemainterno-grupo-levay]], [[stack-tecnologico]]
