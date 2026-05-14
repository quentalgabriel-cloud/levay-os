---
title: Arquitetura Definitiva do Ecossistema — Monolito Modular
type: decision
created: 2026-05-13
updated: 2026-05-13
confidence: high
tags: [architecture, multi-tenant, supabase, ecossistema, decisao-definitiva, pwa, whascale]
---

# Arquitetura Definitiva do Ecossistema — Monolito Modular

## Estado: ✅ Aprovada (supera [[tenants-multi-tenancy]])

## O que foi decidido

**Monolito modular** com schemas Postgres por domínio. Não 3 sistemas separados.

```
os.levay.com.br         → LEVAY OS Hub (auth master, CEO dashboard, cockpit, equipe, KPIs)
os.levay.com.br/sollu   → Módulo Sollu (CRM, follow-up, cobranças, contratos)
os.levay.com.br/bica    → Módulo Bica Bar (PDV, estoque, reservas, BICA CLUB, mobile)
os.levay.com.br/amp     → Módulo AMP 213 (leads, agenda, execução de eventos)
```

## Por que não 3 sistemas separados

- Nada em produção — sem evidência de negócio que justifique separação agora
- 1 arquiteto operando 3 stacks = inconsistência garantida e abandono previsível
- Sollu website (`sollubrasil.com.br`) integra via webhook, sem migração de banco
- `bica-bar-system/` e `sollu-system/` são placeholders vazios, não sistemas

## Fonte da Verdade: Supabase

- `apps/api` (Fastify + Prisma + SQLite) → **arquivado** como `apps/api.deprecated`
- `prisma/schema.prisma` → **arquivado** como `docs/reference/prisma-domain-model.prisma` (referência de domínio, não implementação)
- Workers: Node.js standalone consumindo Supabase via service role key

## Arquitetura de Schemas Postgres

```sql
platform.*   → workspaces, users, companies, collaborators, team, audit
sollu.*      → crm_leads, pipeline_stages, receivables, followups, contracts
amp.*        → events, event_leads, calendar, event_checklists, team_schedule
bica.*       → reservations, members (bica_club), orders, stock, menu, checklists, cash_close
```

**Atenção:** migração dos dados existentes (204 tasks, 6 colaboradores, 9 decisões) é obrigatória no Pré-Trabalho antes das features de negócio.

## Mobile: PWA (Progressive Web App)

Interface mobile para colaboradores do Bica Bar via PWA sobre Next.js. Instalável no celular, sem app store. Views por role: garçom (pedidos), cozinha (comandas), segurança (reservas), Lana (painel geral).

## WhatsApp: Whascale

Plataforma de integração WhatsApp é **Whascale**. Sequência: templates manuais primeiro → automação via Whascale depois. WhatsApp Business API nativa descartada por complexidade.

## Integração Sollu Website

```
Lead no sollubrasil.com.br (Supabase separado) → webhook/N8N → Lead no CRM Sollu do LEVAY OS
```
Banco do website permanece separado. Não migrar agora.

## Trilha de Extração Futura

Se Sollu exigir segregação LGPD ou time dedicado: schema `sollu.*` + workers da Sollu são portáveis para deploy separado sem refazer a base.

## Roadmap de Fases (resumo)

| Fase | Nome | Tempo |
|------|------|-------|
| 0 | Pré-Trabalho Técnico (arquivar api, migrar schemas, avaliar aidplug) | 1–2 dias |
| 1 | Erick vê o sistema (deploy + login + CRM Sollu funcionando) | 3–5 dias |
| 2 | Para de sangrar R$5k/semana (workers, webhook, follow-up, cobranças) | 2–3 semanas |
| 3 | Bica Bar tem profissionalismo (reservas, PWA mobile, checklists) | 3–4 semanas |
| 4 | Bica Bar é um negócio (PDV, estoque, BICA CLUB, Whascale) | 4–6 semanas |
| 5 | AMP fecha mais eventos (CRM comercial + execução operacional) | 2–3 semanas |
| 6 | Erick enxerga o grupo (hub executivo, cockpit, alertas) | 2 semanas |

## Contexto da Decisão

- Erick: nenhum sistema em uso. WhatsApp + cabeça + app lembretes
- Gabriel: arquiteto solo, presente diariamente. Capacidade limitada = monolito é o único path sustentável
- Bica Bar: o produto mais complexo do grupo (ERP completo de bar)
- Prioridade de impacto: Sollu (dinheiro vazando agora) → Bica (operação melhorável agora) → AMP → Hub

## Investigações Pendentes

- I1: `aidplug-crm` — tem base reutilizável para CRM Sollu?
- I2-I10: ver `docs/PLANO-ESTRATEGICO-ECOSSISTEMA.md` seção "Investigações Pendentes"

## Arquitetura de Plataforma Aberta

> Adicionado: 2026-05-13 (após sessão com Erick)

O LEVAY OS se comporta como **plataforma central** do grupo, não apenas como sistema isolado:

| Componente | Modelo |
|------------|--------|
| **LEVAY OS Hub** | Centro de inteligência do grupo — gestão unificada, CEO dashboard |
| **Sollu System** | Sistema isolado e específico — não compartilha operação com outros |
| **AMP+Bica System** | Multi-tenant compartilhado — operações compartilhadas, visualizações individuais |
| **Integrações** | 100% friendly às outras plataformas do grupo via webhooks e APIs |

### Modelo de Integração

```
┌─────────────┐      webhook       ┌─────────────┐
│ Sollu Site  │ ────────────────▶ │  LEVAY OS   │
│ (sollubrasil│                   │   (CRM)     │
│  .com.br)   │                   └──────┬──────┘
└─────────────┘                          │
                                        ▼
                                ┌─────────────────┐
                                │   AMP + Bica    │
                                │   Multi-tenant  │
                                │  (compartilhado)│
                                └─────────────────┘
```

### Princípios

1. **Dados centralizados** — LEVAY OS como fonte de verdade
2. **Sollu isolado** — não compartilha operação, mas expõe dados via API se necessário
3. **AMP+Bica compartilhado** — mesma base, operações compartilhadas, métricas individuais
4. **Exportação possível** — capacidade de expor dados para outras plataformas do grupo

## Links

[[tenants-multi-tenancy]], [[stack-tecnologico]], [[supabase-auth]], [[production-gaps]], [[xoia-cycle-agents]], [[operacoes-compartilhadas-amp-bica]], [[bica-bar-conceito-sensorial]]
