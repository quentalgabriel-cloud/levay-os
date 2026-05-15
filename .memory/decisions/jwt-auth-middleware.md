---
title: JWT Auth Middleware Implementation
type: decision
created: 2026-05-12
updated: 2026-05-12
tags: [security, authentication, jwt, middleware, production]
confidence: high
---

# JWT Auth Middleware Implementation

## O que foi decidido

Implementar middleware de autenticação JWT que valida tokens em produção, mas permite desenvolvimento sem JWT quando `ENABLE_AUTH=false`.

## Por que

O gap crítico identificado no `.memory/context/production-gaps.md`:
- Problema: `x-tenant-id` header sem validação JWT
- Impacto: Qualquer um pode acessar qualquer tenant com header spoofado

## Como foi implementado

### 1. Middleware criado
- Arquivo: `apps/api/src/middleware/auth.middleware.js`
- Funções: `jwtAuthMiddleware`, `validateTenantAccess`, `createAuthHook`

### 2. Integração no app.js
- Hook executado antes do tenant handler
- Só ativa quando `ENABLE_AUTH=true` (production)
- Em dev mode: permite todas as requisições (mantém compatibilidade)

### 3. Configuração

| Ambiente | ENABLE_AUTH | Comportamento |
|----------|-------------|---------------|
| Development | false (default) | Permite tudo |
| Production | true | Requer JWT válido |

```bash
# Production - ativar auth
export ENABLE_AUTH=true
export SUPABASE_JWT_SECRET=your-secret
```

## Alternativas Considered

1. **Sempre requerer JWT** - Rejeitado porque quebraria dev local
2. **Usar Supabase Auth SDK** - Adiado para quando migrar para Supabase real
3. **Mock auth em dev** - Implementado via ENABLE_AUTH=false

## Trade-offs

- **Pros**: Segurança em produção, DX preservado em dev
- **Cons**: Não é true auth até migrar para Supabase real

## Próximos passos

1. Quando migrar para Supabase PostgreSQL, ativar `ENABLE_AUTH=true`
2. Integrar com Supabase Auth para validar JWT corretamente
3. Adicionar refresh token handling

## Files Created/Modified

- `apps/api/src/middleware/auth.middleware.js` (NEW)
- `apps/api/src/app.js` (MODIFIED - added auth hook)

## Links

[[production-gaps]], [[tenants-multi-tenancy]], [[stack-tecnologico]], [[projeto-sistemainterno-grupo-levay]]