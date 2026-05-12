# Levay OS - Architecture Create Plan

## 1) Stack Tecnologica Definida

### Frontend

- Framework: Next.js 15 (React 19 + TypeScript)
- UI: Tailwind CSS + shadcn/ui
- Estado cliente: Zustand
- Data fetching: TanStack Query
- Formulario/validacao: React Hook Form + Zod
- Runtime: Node.js 22 LTS
- Deploy: Vercel

### Backend

- API: NestJS 11 (Node.js 22, Fastify adapter)
- API style: REST + Webhooks + eventos internos
- AuthN/AuthZ: Supabase Auth + RBAC por `tenant_id` e `role`
- Jobs/Workers: BullMQ + Redis (Upstash ou Redis dedicado)
- Arquivos/PDF: Supabase Storage + worker de geracao PDF (Playwright)

### Dados e Plataforma

- Banco principal: Supabase PostgreSQL 16
- Seguranca de dados: Row Level Security (RLS) por tenant
- Realtime: Supabase Realtime para cards, filas e status de worker
- Observabilidade: OpenTelemetry + Sentry + logs estruturados JSON
- CI/CD: GitHub Actions

## 2) Banco de Dados (Supabase/Postgres)

### Estrategia Multi-tenant

- Tenant Isolation: coluna obrigatoria `tenant_id` em todas as tabelas de dominio.
- RLS por tenant: policies obrigatorias para SELECT/INSERT/UPDATE/DELETE.
- Contexto de acesso: JWT com `tenant_id` ativo e `role` do usuario.
- Governanca holding: perfil CEO com escopo cross-tenant controlado por policy especifica.

### Entidades Nucleares

- `tenants`
- `users`
- `user_tenant_roles`
- `leads`
- `pipelines` / `pipeline_stages`
- `followup_rules` / `followup_events`
- `receivables` / `billing_events`
- `contracts` / `contract_templates`
- `events_calendar`
- `reservations` / `waitlist`
- `memberships`
- `inventory_items` / `stock_alerts`
- `quality_gates` / `approval_decisions`
- `automation_runs` / `integration_logs` / `audit_logs`

### Regras Criticas

- Indices compostos: (`tenant_id`, `created_at`) e (`tenant_id`, `status`) para telas operacionais.
- Idempotencia: `idempotency_key` em automacoes e webhooks externos.
- Auditoria: trilha imutavel para aprovacoes de Quality Gate e eventos financeiros.

## 3) Conexoes de API

### APIs internas (Levay API)

- Base URL: `/api/v1`
- Auth: JWT bearer (Supabase)
- Padrao de erro: RFC7807 (`application/problem+json`)

#### Modulos principais

- `/auth/*` - sessao, contexto de tenant ativo
- `/tenants/*` - configuracoes e governanca
- `/crm/*` - leads, pipeline, atividades
- `/billing/*` - contas a receber, cobrancas, conciliacao
- `/contracts/*` - templates e geracao de PDF
- `/events/*` - calendario AMP 213
- `/reservations/*` - mesas e fila Bica Bar
- `/membership/*` - BICA CLUB
- `/inventory/*` - estoque e alertas
- `/automations/*` - workers, status, retries
- `/quality-gates/*` - filas de aprovacao e decisoes
- `/integrations/*` - status conectores e webhooks
- `/analytics/*` - KPIs executivos e funis

### Integracoes externas

- WhatsApp
  - Entrada: webhook provider -> `/api/v1/integrations/whatsapp/webhook`
  - Saida: worker -> provider API (mensagens, cobranca, pedidos)
- Google Drive
  - Upload contratos PDF e anexos por service account
  - Metadados persistidos em `contracts`
- n8n
  - Captura de leads/eventos via webhook assinado
  - Callback de processamento para `integration_logs`
- Gateway de pagamento (adapter)
  - Contrato comum `PaymentProviderAdapter`
  - Implementacoes plugaveis (ex.: Asaas/Stripe/Pagar.me) sem acoplamento no dominio

## 4) Arquitetura de Servicos

- `apps/web`: frontend Next.js
- `apps/api`: backend NestJS
- `apps/workers`: processamento assincrono (follow-up, cobranca, PDF, estoque)
- `packages/shared`: tipos, validacoes Zod, clients HTTP e constantes de dominio
- `packages/integrations`: clients WhatsApp, Drive, n8n, Payment Adapter

## 5) Plano de Implementacao por Fases

### Fase 1 - Fundacao (2 semanas)

- Provisionar Supabase projeto + schema base + RLS.
- Subir `apps/api` com auth, tenancy e RBAC.
- Subir `apps/web` com shell do dashboard por perfil.
- Criar observabilidade minima (logs + erro + trace basico).

### Fase 2 - Sollu (2-3 semanas)

- CRM pipeline + follow-up D+0/D+1/D+3.
- Contas a receber + cobranca automatizada.
- Geracao de contrato PDF + upload Drive.

### Fase 3 - AMP 213 (2 semanas)

- Ingestao de leads via n8n webhooks.
- CRM atendimento com templates.
- Calendario de eventos proprietarios.

### Fase 4 - Bica Bar (2 semanas)

- Reservas/mesas/fila com capacidade maxima.
- Membership BICA CLUB.
- Alertas de estoque minimo + pedido via WhatsApp.

### Fase 5 - Quality Gates e Excecoes (1-2 semanas)

- Motor de gates por fluxo.
- Fila unificada de excecoes operacionais.
- Auditoria completa de aprovacoes.

### Fase 6 - Intelligence e Escala (1-2 semanas)

- Dashboard executivo consolidado.
- Insights operacionais/comerciais.
- Onboarding automatizado de novos tenants.

## 6) Nao-funcionais e Seguranca

- Segregacao de tenant aplicada em DB, API e cache.
- Criptografia TLS em transito e dados sensiveis em repouso.
- Rate limit + assinatura de webhook em integracoes externas.
- SLO inicial: 99,5% disponibilidade e p95 < 2s para operacoes criticas.

## 7) Decisoes de Arquitetura (ADRs resumidos)

1. Monorepo para compartilhar contratos e reduzir divergencia entre frontend/backend.
2. Supabase/Postgres para acelerar entrega com RLS nativo multi-tenant.
3. NestJS separado de Next.js para manter dominio e integracoes complexas desacoplados.
4. Workers assincronos para remover gargalo operacional humano e garantir escalabilidade.
5. Adapter pattern para gateways e provedores externos, evitando lock-in.
