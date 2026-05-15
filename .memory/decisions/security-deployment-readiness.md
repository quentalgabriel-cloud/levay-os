---
title: Security & Deploy Readiness - Production Prep
type: decision
created: 2026-05-12
updated: 2026-05-12
tags: [security, deployment, production, docker, ci-cd]
confidence: high
---

# Security & Deploy Readiness

## O que foi decidido

Implementar camadas de segurança, observabilidade e CI/CD para preparação de produção.

## Implementações

### 1. Security Headers Middleware
- Arquivo: `apps/api/src/middleware/security.middleware.js`
- Headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Rate Limiting opcional via `ENABLE_RATE_LIMIT=true`

### 2. CLI de Observabilidade
- Script: `scripts/cli/observability.mjs`
- Comandos: `npm run status`, `npm run status:health`, `npm run status:metrics`
- Health check, métricas de API, status de workers

### 3. CI/CD Pipeline
- `.github/workflows/ci.yml` - Lint, TypeCheck, Build, Test, Security audit
- `.github/workflows/cd.yml` - Deploy staging/production com health check

### 4. Docker Support
- `Dockerfile` - Multi-stage build otimizado
- `docker-compose.yml` - Orquestração local
- `.dockerignore` - Reduz tamanho da imagem

## Configuração de Produção

```bash
# Environment variables para produção
ENABLE_AUTH=true
ENABLE_RATE_LIMIT=true
NODE_ENV=production
```

## Testes

- Todos os 97 testes passando
- Build passando
- Smoke test passando

## Links

[[production-gaps]], [[stack-tecnologico]], [[tenants-multi-tenancy]]