# Inventário de Código — Fase 0
**Story 0.1 | Gerado em: 2026-05-13**

> Triagem completa de `apps/api/`, `apps/workers/` e `packages/` antes da migração para a arquitetura definitiva (Next.js + Supabase). Nenhum arquivo de `apps/levay-os/` importa de `apps/api/` ou `apps/workers/` — validado ✅

---

## Legenda

| Status | Significado |
|--------|-------------|
| **KILL** | Deletar ou ignorar — substituído pela nova arquitetura |
| **REFERÊNCIA** | Ler antes de implementar — contém modelo de domínio, lógica ou config valiosos |
| **PORT** | Copiar/adaptar diretamente — código puro portável sem acoplamento |

---

## apps/api/src/modules/

### actions/

| Path | Status | Justificativa |
|------|--------|---------------|
| `actions/actions.controller.js` | **KILL** | Rota Fastify. Não existe no Next.js. |
| `actions/actions.service.js` | **REFERÊNCIA** | `rolePolicy` map é o melhor padrão RBAC do projeto. Porta como middleware de autorização para Server Actions. |

### analytics/

| Path | Status | Justificativa |
|------|--------|---------------|
| `analytics/analytics.controller.js` | **KILL** | Rota Fastify. |
| `analytics/analytics.repository.js` | **KILL** | In-memory records sem persistência. |
| `analytics/analytics.service.js` | **REFERÊNCIA** | `getExecutiveKpis` tem lógica de agregação multi-tenant valiosa (billingData + crmData + eventsData + occupancy + insights). Referência direta para a Server Action da Mesa do Diretor. |

### audit/

| Path | Status | Justificativa |
|------|--------|---------------|
| `audit/audit.controller.js` | **KILL** | Rota Fastify. |
| `audit/audit.repository.js` | **KILL** | In-memory Map. Supabase já tem tabela `audit_log` com RLS ativo. |
| `audit/audit.service.js` | **KILL** | Superceded pelo `audit_log` no Supabase. |

### billing/

| Path | Status | Justificativa |
|------|--------|---------------|
| `billing/billing.controller.js` | **KILL** | Rota Fastify. |
| `billing/billing.repository.js` | **REFERÊNCIA** | Modelo rico: `receivable { amount, dueDate, status: pending/paid/overdue }`. Referência para migration `sollu.receivables`. |
| `billing/billing.service.js` | **REFERÊNCIA** | `triggerCollection` com canal (whatsapp/email). Lógica de cobrança porta como Server Action. |

### contracts/

| Path | Status | Justificativa |
|------|--------|---------------|
| `contracts/contracts.controller.js` | **KILL** | Rota Fastify. |
| `contracts/contracts.repository.js` | **REFERÊNCIA** | Modelo: `contract { fileId, fileUrl, provider, customerName }`. Referência para migration `sollu.contracts`. |
| `contracts/contracts.service.js` | **REFERÊNCIA** | Lógica de upload com retry e audit trail. Porta como Server Action. |

### crm/

| Path | Status | Justificativa |
|------|--------|---------------|
| `crm/crm.controller.js` | **KILL** | Rota Fastify. |
| `crm/crm.repository.js` | **KILL** | In-memory `Map`. Zero persistência — reescrever do zero sobre Supabase. |
| `crm/crm.service.js` | **KILL** | Acoplado ao in-memory Map. Reescrever como Server Actions no Story 0.2. |

### dashboard/

| Path | Status | Justificativa |
|------|--------|---------------|
| `dashboard/dashboard.config.js` | **REFERÊNCIA** | `buildDashboardContract(role)` com seções e cards por papel (ceo/commercial/operations). Referência direta para ACL do cockpit. |
| `dashboard/dashboard.controller.js` | **KILL** | Rota Fastify. |

### events/

| Path | Status | Justificativa |
|------|--------|---------------|
| `events/events.controller.js` | **KILL** | Rota Fastify. |
| `events/events.repository.js` | **REFERÊNCIA** | Modelo rico: `event { title, venue, startsAt, endsAt, status, hasConflict }`. Referência para migration `amp.events`. |
| `events/events.service.js` | **REFERÊNCIA** | Conflict detection e venue validation. Porta como Server Action para AMP 213. |

### integrations/

| Path | Status | Justificativa |
|------|--------|---------------|
| `integrations/n8n.signature.js` | **PORT** | HMAC SHA-256 validation pura (sem dependências). Copiar para `apps/levay-os/src/lib/webhook/signature.ts`. |
| `integrations/n8n.webhook.controller.js` | **KILL** | Rota Fastify. |
| `integrations/n8n.webhook.service.js` | **PORT** | Idempotency + duplicate detection com `processedEvents Set`. Porta para Next.js API route `/api/webhook/n8n`. |

### membership/

| Path | Status | Justificativa |
|------|--------|---------------|
| `membership/membership.controller.js` | **KILL** | Rota Fastify. |
| `membership/membership.repository.js` | **REFERÊNCIA** | Modelo BICA CLUB: `member { name, tier, status, validUntil }` + benefits. Referência para migration `bica.members`. |
| `membership/membership.service.js` | **REFERÊNCIA** | Tier management e benefit listing. Porta como Server Action na Fase 4. |

### observability/

| Path | Status | Justificativa |
|------|--------|---------------|
| `observability/observability.controller.js` | **KILL** | Health check Fastify. Next.js usa `/api/health` nativo. |

### operations/

| Path | Status | Justificativa |
|------|--------|---------------|
| `operations/operations.controller.js` | **KILL** | Rota Fastify. |
| `operations/operations.repository.js` | **KILL** | In-memory event bus com subscribers — Supabase Realtime substitui. |
| `operations/operations.service.js` | **KILL** | Acoplado ao event bus in-memory. |

### quality-gates/

| Path | Status | Justificativa |
|------|--------|---------------|
| `quality-gates/quality-gates.controller.js` | **KILL** | Rota Fastify. |
| `quality-gates/quality-gates.repository.js` | **KILL** | In-memory Map. |
| `quality-gates/quality-gates.service.js` | **REFERÊNCIA** | `decideGate(actor, justification)` pattern — referência para feature de Gates de Aprovação. |

### reservations/

| Path | Status | Justificativa |
|------|--------|---------------|
| `reservations/reservations.controller.js` | **KILL** | Rota Fastify. |
| `reservations/reservations.repository.js` | **REFERÊNCIA** | Modelo mais rico do projeto: tables + reservations + waitlist com priority queue sorted. Referência para migration `bica.reservations`. |
| `reservations/reservations.service.js` | **REFERÊNCIA** | Waitlist pop, capacity check, table status. Porta como Server Action para PWA do Bica Bar. |

### session/

| Path | Status | Justificativa |
|------|--------|---------------|
| `session/session.context.js` | **KILL** | AsyncLocalStorage para Fastify — padrão não aplicável ao Next.js (usa cookies/session via Supabase Auth). |

### tasks/

| Path | Status | Justificativa |
|------|--------|---------------|
| `tasks/tasks.controller.js` | **KILL** | Rota Fastify. |
| `tasks/tasks.repository.js` | **REFERÊNCIA** | Único módulo com Prisma real. Define `statusCockpit`, `movimentoMinimo`, `effort`, `impact`, `return`. Referência para Server Action de tasks no Supabase. |
| `tasks/tasks.service.js` | **REFERÊNCIA** | Lógica de tasks com statusCockpit (HOJE/DECIDIR/DELEGAR/QUARENTENA). Porta como Server Action. |

---

## apps/workers/src/

| Path | Status | Justificativa |
|------|--------|---------------|
| `core/followup.queue.js` | **REFERÊNCIA** | Idempotency key + dead-letter pattern — referência para modelar tabela `sollu.followup_jobs` no Supabase. |
| `core/operations.event-publisher.js` | **KILL** | In-memory pub/sub — Supabase Realtime substitui completamente. |
| `jobs/followup.dispatcher.js` | **PORT** | Retry logic (max 3), dead-letter, audit trail. Porta para Supabase Edge Function com pg_cron. Lógica de retry é produção-ready. |
| `jobs/followup.scheduler.js` | **PORT** | `scheduleFollowups(D+0, D+1, D+3)`: JS puro, zero dependências externas. Copiar diretamente para `apps/levay-os/src/lib/followup/scheduler.ts`. |
| `runner.js` | **KILL** | Fastify worker runner — substituído por Supabase pg_cron ou Vercel Cron Jobs. |

---

## packages/

| Path | Status | Justificativa |
|------|--------|---------------|
| `integrations/src/google-drive/client.js` | **KILL** | Simulação com `simulateFailCount` — sem implementação real. Reescrever quando contratos forem feature. |
| `integrations/src/payments/payment.adapter.js` | **KILL** | Stub vazio que apenas normaliza payload. Sem lógica real. |
| `integrations/src/whatsapp/client.js` | **KILL** | Mock client para testes dos workers — retorna fake `messageId`. Substituído por `WhatsAppService` real. |
| `integrations-whatsapp/src/services/whatsapp.ts` | **PORT** | `WhatsAppService` real com `fetch` + Zod validation. Schema de webhook tipado. Porta para `apps/levay-os/src/lib/integrations/whatsapp.ts`. |
| `integrations-whatsapp/src/index.ts` | **PORT** | Entry point — porta junto com o service. |

---

## Validação de Isolamento

```
grep -r "from.*apps/api|from.*apps/workers" apps/levay-os/src/
→ Nenhum resultado ✅
```

`apps/levay-os/` é completamente isolado de `apps/api/` e `apps/workers/`. A migração não requer desfazer importações.

---

## Resumo Executivo

| Categoria | KILL | REFERÊNCIA | PORT |
|-----------|------|------------|------|
| apps/api/src/modules | 26 arquivos | 14 arquivos | 2 arquivos |
| apps/workers/src | 2 arquivos | 1 arquivo | 2 arquivos |
| packages | 3 arquivos | 0 arquivos | 2 arquivos |
| **Total** | **31** | **15** | **6** |

### Conteúdo de alto valor a preservar antes de arquivar `apps/api/`:

1. **rolePolicy map** (`actions.service.js`) → RBAC das Server Actions
2. **getExecutiveKpis** (`analytics.service.js`) → coração da Mesa do Diretor
3. **buildDashboardContract** (`dashboard.config.js`) → ACL por papel
4. **reservations model** (`reservations.repository.js`) → schema `bica.reservations`
5. **followup scheduler/dispatcher** (`workers/`) → Supabase Edge Function
6. **WhatsAppService** (`integrations-whatsapp/`) → integração real com WA Business API

### Próximos passos desbloqueados por este inventário:

- **Story 0.2** — CRM Supabase + Server Actions (referências: `crm.repository.js` → modelo, `n8n.webhook.service.js` → idempotência)
- **Story 0.3** — Clean root + Vercel readiness (nada nos packages bloqueia)
- **Fase 2** — Follow-up workers (PORT: `followup.scheduler.js` + `followup.dispatcher.js`)
- **Fase 3** — Reservas Bica Bar (REFERÊNCIA: `reservations.repository.js`)
- **Fase 4** — BICA CLUB (REFERÊNCIA: `membership.repository.js`)
