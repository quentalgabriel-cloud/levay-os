---
title: Workers — Background Jobs e Follow-up
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [workers, background-jobs, follow-up, queue, whatsapp]
confidence: medium
gaps: [bullmq-redis, job-monitoring-dashboard, webhooks-whatsapp-inbound]
---

# Workers — Background Jobs e Follow-up

## Estrutura

```
apps/workers/
├── src/
│   ├── runner.js              # Entry point
│   ├── jobs/
│   │   ├── followup.scheduler.js
│   │   └── followup.dispatcher.js
│   └── core/
│       ├── followup.queue.js  # Fila custom (sem BullMQ)
│       └── operations.event-publisher.js
```

## Follow-up Scheduler (Sollu)

### Janelas de follow-up
- **D+0**: Welcome message (logo após lead entrar)
- **D+1**: Re-engagement (1 dia após sem resposta)
- **D+3**: Final attempt antes de marcar "Lost"

### Idempotência
```javascript
idempotencyKey: `${leadId}/${tenantId}/${window}`
// Ex: "lead-123/sollu/d0"
// Garante que não envia duplicado
```

### Retry Mechanism
- Dead-letter queue para falhas persistentes
- Retry com backoff

### Integração WhatsApp
- Via `@levay/integrations` (WhatsApp client)
- Mensagens customizáveis por janela

## Event Publisher

**Path**: `apps/workers/src/core/operations.event-publisher.js`

- Publica eventos para `/api/v1/operations/events`
- Operações auditadas: lead stage change, reservation, etc.

## Rodando Workers

```bash
# Via stack start
node scripts/start-stack.mjs  # Starta API + Web + Workers

# Health check
npm run health
```

## Port Workers
- Workers: 3400+ (auto-detecta disponível)
- API_BASE_URL passado via env

## Gaps

1. **BullMQ + Redis**: Planejado mas não implementado
   - Motivation: Fila custom funciona bem para poucos jobs
   - Upgrade path: Trocar followup.queue.js por BullMQ quando escalar

2. **Job monitoring**: Dashboard de jobs pendentes/feitos
3. **Webhooks**: Resposta de WhatsApp inbound

## Links

[[stack-tecnologico]], [[integracoes-externas]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]], [[sollu-followup-by-origin]], [[crm-whatsapp-sollu]]
