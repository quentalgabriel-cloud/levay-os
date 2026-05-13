---
title: getting-started — Como Iniciar o Projeto
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [setup, getting-started, npm, dev, environment]
confidence: high
---

# getting-started — Como Iniciar o Projeto

## Pré-requisitos

```bash
node --version  # v22+
npm --version    # 10+
```

## Setup Inicial

```bash
# 1. Clonar/instalar deps
npm install

# 2. Configurar .env
cp .env.example .env
# Preencher:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   ANTHROPIC_API_KEY (para Nonô)
#   PORT (API)
#   ALLOWED_ORIGIN (CORS)
```

## .env Template

```bash
# Database
DATABASE_URL="file:./dev.db"

# Supabase (Levay-OS frontend)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI (Nonô)
ANTHROPIC_API_KEY=

# API
PORT=3001
ALLOWED_ORIGIN=http://localhost:3200

# Workers
PORT=3003
WORKERS_PORT=3003
LEVAY_API_BASE_URL=http://localhost:3001
```

## Scripts Disponíveis

| Script | O que faz |
|--------|----------|
| `npm run dev` | Start full stack (API + Web + Workers) |
| `npm run start` | Idem dev |
| `npm run lint` | Node syntax check |
| `npm run typecheck` | Module imports verification |
| `npm run build` | Build + templates + followups |
| `npm run smoke` | Smoke test |
| `npm run health` | Squad health check |
| `npm run test` | Tests (api + workers) |

## Estrutura de Portas

O start-stack.mjs aloca portas automaticamente:

```javascript
// Procura disponível:
// API: 3000+
// Web: 3200+
// Workers: 3400+
```

## Stack que Start

```bash
# 3 serviços em paralelo:
node apps/api/src/server.js      # Fastify API
next dev apps/levay-os/           # Next.js
node apps/workers/src/runner.js   # Workers
```

## Health Endpoints

```bash
# API
GET http://localhost:3001/health

# Workers
GET http://localhost:3003/health
```

## Prisma Setup

```bash
# Gerar client após instalar deps
npx prisma generate

# Migrar schema (dev)
npx prisma migrate dev

# Ver DB no browser
npx prisma studio
# Abre: http://localhost:5555
```

## Verificação Rápida

```bash
# 1. Start stack
npm run dev

# 2. Verificar serviços
npm run health

# 3. Smoke test
npm run smoke
```

## Estrutura de Projetos

```
apps/
├── api/          Fastify REST API (porta 3001)
├── levay-os/     Next.js dashboard (porta 3200)
├── web/          Web runtime modules
└── workers/      Background job runner (porta 3400)

packages/
└── integrations/ WhatsApp, Drive, Payments adapters
```

## IDE Setup (VS Code)

```bash
# Extensões recomendadas
# - Tailwind CSS IntelliSense
# - Prisma
# - ESBenpt/config-prettier
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `MODULE_NOT_FOUND` | `npm install` |
| `Prisma client not generated` | `npx prisma generate` |
| CORS error | Verificar `ALLOWED_ORIGIN` no .env |
| Supabase connection fail | Verificar `.env` keys |
| Porta ocupada | `kill $(lsof -t -i:3001)` |

## Cross-references

- `[[xoia-hooks]]` — Hooks que rodam no SessionStart
- `[[workers-background-jobs]]` — Follow-up scheduler
- `[[prisma-sqlite-setup]]` — Prisma details

## Links

[[stack-tecnologico]], [[prisma-sqlite-setup]], [[vocabulary-labels]], [[xoia-hooks]], [[workers-background-jobs]]
