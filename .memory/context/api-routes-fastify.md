---
title: API Routes — Fastify Endpoints
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [API, routes, fastify, endpoints, modules]
confidence: high
gaps: [OpenAPI-docs, rate-limiting, request-validation, auth-middleware]
---

# API Routes — Fastify Endpoints

## Base URL

```
/api/v1/
```

## Header Obrigatório

```
x-tenant-id: <tenant-slug>
x-role: <role> (default: operator)
```

## Módulos Implementados

### CRM
- Route: `/api/v1/crm/*`
- Files: `crm.controller.js`, `crm.service.js`, `crm.repository.js`
- Features: Leads, pipeline stages, audit trail
- CEO: Cross-tenant access

### Billing
- Route: `/api/v1/billing/*`
- Features: Receivables, collections
- Integration: PaymentProviderAdapter

### Events
- Route: `/api/v1/events/*`
- Features: Calendar (AMP 213), conflict detection

### Reservations
- Route: `/api/v1/reservations/*`
- Features: Tables, waitlist, capacity (max 70)

### Membership
- Route: `/api/v1/membership/*`
- Features: BICA CLUB lifecycle, eligibility

### Quality Gates
- Route: `/api/v1/quality-gates/*`
- Features: Flow/Step gates, pending queue

### Contracts
- Route: `/api/v1/contracts/*`
- Features: PDF generation, Google Drive upload

### Analytics
- Route: `/api/v1/analytics/executive`
- Features: Cross-tenant KPIs
- CEO: Gets consolidated view (sem tenantId query param)

### Operations
- Route: `/api/v1/operations/*`
- Features: Event log, event publishing

### Tasks
- Route: `/api/v1/tasks/*`
- Features: CRUD, cockpit status

### Actions
- Route: `/api/v1/actions/*`
- Features: Unified action service

### Dashboard
- Route: `/api/v1/dashboard/*`
- Features: Config, session context injection

### n8n Webhook
- Route: `/api/v1/integrations/n8n/webhook`
- Features: Lead ingestion, signature validation, idempotency

## Session Context

```javascript
// File: apps/api/src/modules/session/session.context.js
createSessionContext({ tenantId, role })
mutateRequestTenant(request, tenantId)
```

## CORS

Resolvido dinamicamente via `ALLOWED_ORIGIN` env

## Links

[[stack-tecnologico]], [[tres-empresas-dominio]], [[prisma-sqlite-setup]]
