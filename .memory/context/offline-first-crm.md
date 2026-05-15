---
title: Offline-First CRM — AidPlug Architecture
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [offline-first, IndexedDB, PWA, CRM, mobile]
confidence: medium
---

# Offline-First CRM — AidPlug Architecture

## Decisão: Offline-First com Sync Queue

**Projeto**: `aidplug-crm-main` (Sollu/AidPlug CRM PWA para UAE)

## Arquitetura Offline-First

### IndexedDB Storage
```typescript
// Local persistence with sync queue
// Changes queued when offline, synced when online
```

### Sync Queue Pattern
```typescript
// Offline changes → queue → sync on reconnect
// Intelligent merge strategy for concurrent edits
```

## Por que Offline-First

Para **field sales teams** em áreas com conectividade limitada:
- Funcionalidade completa sem internet
- Dados preservados durante falhas de conexão
- Sync automático quando reconecta

## Componentes Implementados

| Componente | Propósito |
|-----------|-----------|
| `indexedDB.ts` | Local storage |
| `syncQueue.ts` | Offline change queue |
| `offlineSync.ts` | Conflict resolution |
| `OfflineIndicator.tsx` | Visual status |
| `SyncDetailsModal.tsx` | Queue visualization |

## SyncDetailsModal

14.561 bytes — mostra detalhes da fila de sync:
- Changes pending
- Conflicts detected
- Sync status

**Prática**: Transparency no sync state reduz ansiedade do usuário.

## PWA Config

```json
// manifest.json — App configurado como Progressive Web App
// Service Worker caching for offline capability
```

## Oportunidade para Levay OS

Implementar sync offline para:
- **Leads**: Captura offline em eventos
- **Reservas**: gestão offline em áreas sem conexão
- **Tarefas**: atualizar status mesmo offline

## Cross-references

- `[[crm-whatsapp-sollu]]` — Sollu CRM com WhatsApp
- `[[workers-background-jobs]]` — Follow-up scheduling engine
- `[[sollu-crewai-pipeline]]` — AI pipeline inspiration

## Links

[[stack-tecnologico]], [[tres-empresas-dominio]], [[crm-whatsapp-sollu]], [[workers-background-jobs]]
