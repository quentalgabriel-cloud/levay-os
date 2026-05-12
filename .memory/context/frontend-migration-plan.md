---
title: Frontend Migration Plan — Vanilla JS to Next.js
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [frontend, migration, nextjs, vanilla-js, html, css]
confidence: high
status: planned
---

# Frontend Migration Plan — Vanilla JS to Next.js

## Executive Decision

**Decision:** Port `apps/web/` (Vanilla JS) to `apps/levay-os/` (Next.js 16), do NOT discontinue.

**Rationale:**
- Next.js provides better DX (TypeScript, Server Components, Server Actions)
- Nonô AI Agent already exists in Next.js (`lib/agents/intelligence.ts`)
- Supabase Auth natively integrated in Next.js
- Single codebase to maintain long-term

## Current State Analysis

### apps/web/ — Vanilla JS (Operational)

| Feature | File | Complexity | Status |
|---------|------|------------|--------|
| **loadSnapshot** (12 endpoints) | app-resource-client.js:62-129 | 🔴 Alta | Working |
| **Bulk Actions** (3 tipos) | app-page.js:258-265 | 🔴 Alta | Working |
| **Search/filtros** | app-page.js:185-197 | 🟡 Média | Working |
| **Polling 20s** | app-page.js:725 | 🟡 Média | Working |
| **SSE EventSource** | operations-stream-client.js:14 | 🔴 Alta | Working |
| **Cockpit 4 colunas** | cockpit-template.js:38-85 | 🔴 Alta | Working |
| **Brain Dump + Nonô** | app-page.js:669 | 🔴 Alta | Working |
| **Operations Timeline** | operations-page.js | 🟡 Média | Working |
| **Role/Tenant persistence** | app-page.js:39-49 | 🟡 Média | Working |

### apps/levay-os/ — Next.js 16 (Modern)

| Feature | Status | Gap |
|---------|--------|-----|
| Auth Supabase | ✅ Working | - |
| Tasks CRUD | ✅ Working | - |
| Projects CRUD | ✅ Working | - |
| Companies CRUD | ✅ Working | - |
| Dashboard /app | ❌ Missing | 🔴 CRÍTICO |
| Cockpit columns | ⚠️ Partial | 🔴 CRÍTICO |
| Bulk Actions | ❌ Missing | 🔴 CRÍTICO |
| Real-time (SSE) | ❌ Missing | 🔴 CRÍTICO |
| Polling | ❌ Missing | 🟡 MÉDIO |
| Search/filters | ❌ Missing | 🟡 MÉDIO |
| Brain Dump + Nonô | ✅ Working | - |

## Feature Parity Checklist

```
| Feature                    | Vanilla JS | Next.js  | Gap      |
|----------------------------|------------|----------|----------|
| Dashboard /app             |      ✅     |    ❌    | 🔴 CRÍT  |
| Cockpit columns            |      ✅     |    ⚠️    | 🔴 CRÍT  |
| Bulk Actions               |      ✅     |    ❌    | 🔴 CRÍT  |
| Real-time (SSE)            |      ✅     |    ❌    | 🔴 CRÍT  |
| Polling 20s                |      ✅     |    ❌    | 🟡 MÉD   |
| Search + Filters           |      ✅     |    ❌    | 🟡 MÉD   |
| Brain Dump + Nonô          |      ✅     |    ✅    | ✅ OK    |
| Auth Supabase              |      ❌     |    ✅    | ✅ OK    |
| Tasks CRUD                 |      ❌     |    ✅    | ✅ OK    |
| Projects CRUD              |      ❌     |    ✅    | ✅ OK    |
| Companies CRUD             |      ❌     |    ✅    | ✅ OK    |
```

## Technical Gaps for Migration

### Gap 1: API Client
**Problem:** Vanilla JS uses raw fetch, Next.js needs typed Supabase client
**Solution:** Create `lib/supabase/api-client.ts` with TypeScript types

```typescript
// Proposed structure
export class ApiClient {
  constructor(supabase: SupabaseClient)
  loadSnapshot(params): Promise<Snapshot>
  bulkAction(actionId, tenantId): Promise<Result>
  // ... all 12 endpoints
}
```

### Gap 2: Real-time (SSE)
**Problem:** Vanilla JS uses EventSource for SSE
**Solution:** 
- Create `app/api/stream/route.ts` for SSE endpoint
- Create `hooks/useSSE.ts` hook
- Fallback to polling with `useInterval`

### Gap 3: Bulk Actions
**Problem:** Vanilla JS calls API endpoints directly
**Solution:**
- Create Server Actions in `lib/actions/bulk.ts`
- Use `useServerAction` hook for optimistic updates

### Gap 4: Cockpit 4 columns
**Problem:** Cockpit uses vanilla HTML template rendering
**Solution:**
- Create `app/(app)/cockpit/page.tsx`
- Use React state for columns (HOJE, DECIDIR, DELEGAR, ALERTAS)
- Integrate with existing Nonô (`lib/agents/intelligence.ts`)

### Gap 5: Operations Timeline
**Problem:** Operations uses vanilla JS with custom rendering
**Solution:**
- Create `app/(app)/operations/page.tsx`
- Use SSE for real-time updates
- KPI cards with real-time data

## apps/workers/ Dependencies

Workers run independently and should NOT be migrated. They handle:

| Worker | Responsibility | Migration |
|--------|---------------|-----------|
| FollowupQueue | D+0, D+1, D+3 follow-up scheduling | Keep as-is |
| FollowupDispatcher | Send WhatsApp messages | Keep as-is |
| OperationsEventPublisher | Publish operational events | Keep as-is |

**Decision:** Workers stay in `apps/workers/`. They are called via API, not directly from frontend.

## Migration Phases

### Phase 2.1 — API Client (1 day)
- Create `lib/supabase/api-client.ts`
- Map all 12 endpoints from app-resource-client.js
- Add TypeScript types
- Pattern: Keep Promise.allSettled from vanilla

### Phase 2.2 — Dashboard Operacional (3 days)
- Create `app/(app)/dashboard/page.tsx`
- KPI cards (receivables, leads, quality gates, contracts)
- Sidebar with navigation + counters
- Bulk actions per section
- Search + filters

### Phase 2.3 — Cockpit + Brain Dump (2 days)
- Create `app/(app)/cockpit/page.tsx`
- 4 columns: HOJE, DECIDIR, DELEGAR, ALERTAS
- Brain dump textarea
- Integrate with existing Nonô

### Phase 2.4 — Real-time (2 days)
- Create SSE endpoint `app/api/stream/route.ts`
- Create `hooks/useSSE.ts`
- Operations real-time updates
- Fallback polling (20s)

### Phase 2.5 — Operations (2 days)
- Create `app/(app)/operations/page.tsx`
- Timeline visualization
- KPI summary cards
- Alerts panel

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 2.1 API Client | 1 day | 1 day |
| 2.2 Dashboard | 3 days | 4 days |
| 2.3 Cockpit | 2 days | 6 days |
| 2.4 Real-time | 2 days | 8 days |
| 2.5 Operations | 2 days | 10 days |

**Total estimated: 2 weeks for frontend migration**

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|-------|------------|
| Nonô integration fails | High | Already working in Next.js, test early |
| SSE complexity | Medium | Use fallback polling initially |
| Bulk action UX | Medium | Use Server Actions with optimistic UI |

## Pre-requisites Before Starting

1. ✅ Supabase project linked (`anwtivdognjrghipardd`)
2. ✅ Next.js 16 + TypeScript environment
3. ✅ Existing Nonô AI in `lib/agents/intelligence.ts`
4. ✅ API endpoints already working (12 endpoints verified)

## Next Steps

1. **Start Phase 2.1** — Create API client
2. **Verify** — Run tests, ensure no regression
3. **Proceed** to Phase 2.2 when ready

---

## References

- Original analysis: apps/web/ codebase
- Nonô integration: `apps/levay-os/src/lib/agents/intelligence.ts`
- API endpoints: `apps/api/src/modules/*`
- Follow-up workers: `apps/workers/src/`

---

*Document created: 2026-05-12*
*Status: Ready for execution*