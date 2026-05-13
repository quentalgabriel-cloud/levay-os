---
title: CRM WhatsApp — Sollu Automated Attendance
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [CRM, WhatsApp, WhatsApp-Business-Platform, Sollu, CrewAI, conversation]
confidence: medium
---

# CRM WhatsApp — Sollu Automated Attendance

## Contexto: Este Projeto

Sistema backend TypeScript para CRM de atendimento via WhatsApp, com:
- **WhatsApp Business Platform** (API oficial, não QR-code)
- **XOIA como framework de orquestração**
- **Arquitetura em camadas**: HTTP → Domain → Repository → Read
- **Multi-workspace ready** (base para multi-tenant)

## Arquitetura em Camadas

```
WhatsApp → POST /webhooks/whatsapp
    ↓
whatsapp-webhook-route.ts (parse & validate)
    ↓
inbox-domain-service.ts (map to domain entities)
    ↓
inbox-repository-service.ts (persist: memory or Postgres)
    ↓
Response with persisted state
```

## Dual Persistence Strategy

```typescript
// Repository factory chooses at startup:
if (DATABASE_URL) → PostgresInboxRepository
else → InMemoryInboxRepository
```

**Prancheta**: Permite dev local sem DB, produção com Postgres.

## Composite ID Strategy

```typescript
const conversationExternalId = `${phone_number_id}:${phoneNumber}`;
```

**Insight**: IDs compostos previnem colisões entre múltiplos números WhatsApp.

## Gaps Identificados

| Gap | Impacto |
|-----|---------|
| Outbound message persistence | Não mostra mensagens enviadas no histórico |
| Message type support | Apenas texto, sem imagem/doc/audio |
| Delivery status tracking | Não rastreia sent/delivered/read |
| Contact enrichment | Apenas phone + displayName |
| Conversation state machine | Sem open/closed/pending |

## Repository Pattern

```typescript
export interface InboxRepository {
  persistInboxEvent(workspaceId, event): Promise<PersistInboxEventResult>;
  getSnapshot(workspaceId): Promise<InboxRepositorySnapshot>;
}
```

**Benefício**: Interface compartilhada permite mock em testes e swap de implementação.

## Cross-references

- `[[sollu-crewai-pipeline]]` — CrewAI 3-agent pipeline
- `[[offline-first-crm]]` — AidPlug offline-first pattern
- `[[workers-background-jobs]]` — Follow-up scheduler

## Links

[[tres-empresas-dominio]], [[integracoes-externas]], [[stack-tecnologico]], [[production-gaps]]
