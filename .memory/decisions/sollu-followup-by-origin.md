---
title: Follow-up por Origem — Cadência Customizada por Lead Source
type: decision
created: 2026-05-12
confidence: medium
tags: [follow-up, CRM, lead-source, cadence, Sollu]
---

# Follow-up por Origem — Cadência Customizada por Lead Source

## Estado: ⚠️ Proposal (não implementada)

## O que foi decidido

Diferenciar a cadência de follow-up com base na **origem do lead**, não apenas janela fixa (D+0, D+1, D+3).

## Contexto

Sistema atual implementa follow-up com janelas fixas:
- **D+0**: Welcome (logo após entrada)
- **D+1**: Re-engagement (1 dia após sem resposta)
- **D+3**: Final attempt (3 dias após sem resposta)

**Problema**: Todas as origens recebem a mesma cadência, ignorando qualificação intrínseca.

## Cadência Proposta por Origem

| Origem | Qualificação | Cadência Proposta |
|--------|-------------|-------------------|
| **Indicação** | Alta — warm lead, referral | 1h → 1d → 1semana |
| **Meta Ads** | Média — educacional, precisa nutrir | 2h → 2d → 2semanas |
| **Google Ads** | Alta — intent específica, hot | 30min → 5d → 10dias |
| **Orgânico** | Variável | 4h → 3d → 1semana |
| **Frio** | Baixa — qualificação necessária | 24h → 1semana → 2semanas |

## Por que Diferenciar

- **Indicação**: Responde rápido, shorter nurture cycle
- **Meta Ads**: Necesitam convencimento/educação, ciclo mais longo
- **Google Ads**: Já pesquisaram, querem resolução, urgência maior

## Implementação Atual

```javascript
// followup.scheduler.js
const FOLLOWUP_WINDOWS = {
  D0: { delay: 0, label: 'welcome' },
  D1: { delay: 86400000, label: 're-engagement' },
  D3: { delay: 259200000, label: 'final-attempt' }
};

// Idempotency key
idempotencyKey: `${leadId}/${tenantId}/${window}`
```

## Gap: Origem Não Considerada

**Problema**: O scheduler atual não lê `lead.source` para aplicar cadência customizada.

**Solução**: Modificar scheduler para:
1. Ler `lead.source`
2. Mapear para `FOLLOWUP_WINDOWS_BY_SOURCE[source]`
3. Aplicar delays customizados
4. Rastrear origem-to-conversion por cadência

## Oportunidade

Implementar tracking:
```typescript
interface FollowupMetric {
  leadId: string;
  source: LeadSource;
  cadence: string; // "1h-1d-1sem"
  respondedAt: Date | null;
  convertedAt: Date | null;
  daysToConversion: number;
}
```

## Alternativas Consideradas

| Alternativa | Avaliação |
|------------|-----------|
| Manter janelas fixas | Simples mas subótimo |
| ML para predição de cadência | Complexo demais para v1 |
| Cadência por lead score | Requer scoring implementado |

## Links

[[tres-empresas-dominio]], [[workers-background-jobs]], [[production-gaps]], [[crm-whatsapp-sollu]]
