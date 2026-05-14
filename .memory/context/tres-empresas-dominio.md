---
title: 3 Empresas — Visão de Domínio
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [business, domain, sollu, bica-bar, amp213, CRM, multi-tenant]
confidence: high
---

# 3 Empresas — Visão de Domínio

## As 3 Entidades

### 1. Sollu (Isolada Totalmente)
- **Natureza**: Consultoria financeira / crédito corporativo
- **Especial**: CRM, billing, contracts em tenant separado
- **PROIBIDO**: Nunca misturar com outros tenants
- **Objetivo**: Parar perda de R$ 5.000/semana (falta de follow-up/cobrança)
- **Potencial**: Fintech para serviços financeiros digitais
  - Consultas automatizadas
  - Higienização digital
  - Representantes regionais
- **Pipeline**: NOVO → CONTATADO → QUALIFICADO → NEGOCIANDO → GANHO|PERDIDO
- **Follow-up**: D+0 (welcome), D+1 (re-engagement), D+3 (lost)
- **Cobrança**: Receivable PENDING → PAID → OVERDUE

### 2. Bica Bar Sensorial (Compartilha com AMP 213)
- **Natureza**: Bar de cocktails premium em Recife
- **Ticket alto**: Experiências sensoriais
- **Operação compartilhada com AMP 213**
- **Reservas**: Max 65 pessoas (dado atualizado em 2026-05-13: "65 pessoas sentadas minimamente confortáveis")
- **Estados de mesa**: livre | reservada | ocupada | no-show
- **Features**: Fila de espera com promoção automática
- **Concorrência**: Handle para evitar overbooking

### 3. AMP 213 (Compartilha com Bica Bar)
- **Natureza**: Eventos e buffet premium
- **Operação compartilhada com Bica Bar**
- **Calendário**: Detecção de conflito por local/hora
- **Features**: Eventos privados, eventos corporativos
- **Pipeline leads**: Igual Sollu

## Mapeamento de Tenant

| Empresa | Slug Prisma | Slug Supabase (legacy) |
|---------|------------|------------------------|
| Sollu | `sollu` | `company_id` = sollu |
| Bica Bar | `bicabar` | `company_id` = bicabar |
| AMP 213 | `amp213` | `company_id` = amp213 |
| Holding | `holding` | `workspace_id` = holding |

## Contexto Estratégico

- Holding = workspace raiz (Grupo Levay)
- Companies = subdivisões
- CEO acessa cross-tenant
- Outros papéis: isolados por tenant

## Integrações por Empresa

| Integração | Sollu | Bica Bar | AMP 213 |
|-----------|-------|---------|---------|
| WhatsApp outbound | ✅ | ✅ | ❌ |
| Follow-up D+0/D+1/D+3 | ✅ | ❌ | ❌ |
| Cobrança | ✅ | ❌ | ❌ |
| CRM Pipeline | ✅ | ❌ | ❌ |
| Reservas/Mesas | ❌ | ✅ | ❌ |
| Calendário eventos | ❌ | ❌ | ✅ |
| Membership BICA CLUB | ❌ | ✅ | ❌ |
| Quality Gates | ✅ | ✅ | ✅ |
| Google Drive contratos | ✅ | ❌ | ❌ |

## Links

[[projeto-sistemainterno-grupo-levay]], [[tenants-multi-tenancy]], [[stack-tecnologico]], [[xoia-framework]], [[vocabulary-labels]], [[integracoes-externas]], [[workers-background-jobs]], [[crm-whatsapp-sollu]], [[offline-first-crm]], [[nono-ai-agent]], [[sollu-crewai-pipeline]]
