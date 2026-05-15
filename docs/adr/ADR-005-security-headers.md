# ADR-005 — Headers de Segurança HTTP

**Status:** Pendente implementação
**Data:** 2026-05-15

## Contexto

`apps/levay-os/vercel.json` não define nenhum header de segurança HTTP.
`apps/levay-os/next.config.ts` está vazio.

## Decisão

Adicionar via `next.config.ts` (headers function):

```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ],
}]
```

CSP com nonce será implementado em sprint separada (requer integração com middleware).

## Consequências

Melhora postura de segurança HTTP. Zero impacto em funcionalidade.
