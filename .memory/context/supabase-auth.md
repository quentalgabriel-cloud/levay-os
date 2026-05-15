---
title: Supabase Auth — Integração e Configuração
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [supabase, auth, JWT, session, multi-tenant]
confidence: medium
gaps: [jwt-validation-middleware, session-refresh, multi-device-logout, RBAC]
---

# Supabase Auth — Integração e Configuração

## Setup

```bash
# Cliente servidor
apps/levay-os/src/lib/supabase/server.ts

# Cliente browser
apps/levay-os/src/lib/supabase/client.ts

# Pacotes
@supabase/ssr ^0.10.3
@supabase/supabase-js ^2.105.4
```

## Auth Flow

1. **Login**: Supabase Auth (email/password)
2. **Session**: JWT armazenado em cookie httpOnly (via @supabase/ssr)
3. **Middleware**: Valida JWT em cada request
4. **User mapping**: `auth.users.id` → `prisma.User.id`

## Header Auth (atualmente)

⚠️ **PROVISÓRIO**: `x-tenant-id` header sem validação JWT real

```http
x-tenant-id: sollu
x-role: operator
```

**Problema**: Não há validação de que o usuário tem permissão neste tenant

**Solução**: Implementar middleware que:
1. Extrai `user_id` do JWT do Supabase
2. Consulta `UserTenantRole` para validar acesso
3. Retorna 401/403 se inválido

## Session Context (API)

```javascript
// apps/api/src/modules/session/session.context.js
createSessionContext({ tenantId, role })
```

Injeta tenant context no request para todos os módulos

## Auth Events (Audit Log)

```prisma
AUTH_LOGIN
AUTH_LOGOUT
AUTH_SESSION_REFRESH
AUTH_PASSWORD_CHANGE
```

## Gaps

- [ ] JWT validation middleware real
- [ ] Session refresh automático
- [ ] Multi-device logout
- [ ] RBAC via Supabase + Prisma (story 1.3)

## Links

[[stack-tecnologico]], [[tenants-multi-tenancy]], [[prisma-sqlite-setup]], [[production-gaps]], [[xoia-hooks]]

[[stack-tecnologico]], [[tenants-multi-tenancy]], [[prisma-sqlite-setup]], [[production-gaps]]
