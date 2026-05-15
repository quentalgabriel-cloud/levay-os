---
title: Integrações — WhatsApp, Drive, n8n, Pagamentos
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [integrations, whatsapp, google-drive, n8n, payments, webhooks]
confidence: medium
gaps: [whatsapp-inbound, drive-download, payment-gateway-real, n8n-workflows]
---

# Integrações — WhatsApp, Drive, n8n, Pagamentos

## WhatsApp Integration
**Path**: `packages/integrations/src/whatsapp/client.js`

- Mensagens outbound via provider API
- Triggers:
  - D+0 welcome (Sollu)
  - D+1 re-engagement (Sollu)
  - D+3 final attempt (Sollu)
  - Collection reminders (Sollu)
  - Stock alerts (Bica Bar)
- **Inbound**: Não implementado ainda

## Google Drive Integration
**Path**: `packages/integrations/src/google-drive/client.js`

- Upload de contratos PDF via service account
- Metadata persiste em contracts module
- Retry mechanism com dead-letter
- **Download**: Não implementado ainda

## n8n Webhook
**Path**: `apps/api/src/modules/integrations/n8n.webhook.*`

- Route: `POST /api/v1/integrations/n8n/webhook`
- Validação de assinatura (n8n.signature.js)
- Idempotência por `eventId`
- Ingestão de leads de formularios
- Legacy: Sollu CRM pipeline trigger

## Payment Gateway Adapter
**Path**: `packages/integrations/src/payments/payment.adapter.js`

- Adapter pattern (abstract)
- Normaliza callbacks sem acoplamento de gateway
- **Estado atual**: Billing in-memory (sem gateway real)
- Implementado: PaymentProviderAdapter

## Fluxo de Pagamento

```
Receivable.create() → PaymentProviderAdapter.initiate() → webhook callback → PaymentProviderAdapter.confirm() → Receivable.update(PAID)
```

## API Routes de Integração

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/integrations/n8n/webhook` | POST | Lead ingestion |
| `/api/v1/billing/*` | CRUD | Receivables |
| `/api/v1/contracts/*` | CRUD | PDF generation + Drive |

## Gaps Conhecidos

1. **WhatsApp inbound**: Webhook para respostas de cliente
2. **Google Drive download**: Busca de contratos existentes
3. **Payment gateway real**: Integração com Asaas/Pagar.me/Mundipagg
4. **n8n workflows**: Workflows de automação

## Links

[[stack-tecnologico]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]], [[workers-background-jobs]]
