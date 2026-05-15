# Plano Estratégico — Ecossistema Grupo Levay

> **Versão:** 1.1
> **Data:** 2026-05-13
> **Origem:** Sessão de planejamento com análise Opus (opusplan) + devolutiva de IA paralela + respostas de Gabriel
> **Auditoria:** Revisado após checagem de completude, coerência e inteligência das definições
> **Status:** Aprovado para execução

---

## Contexto do Negócio

Erick, dono de 3 empresas, gerencia tudo na cabeça + WhatsApp + app lembretes. Nenhum sistema de gestão em produção. Gabriel é o arquiteto de sistemas, presente diariamente (30 min a 4h disponíveis por tarde). Thaynan ajuda na organização operacional (papel ainda a ser definido formalmente).

### As 3 Empresas

| Empresa | Natureza | Operação | Urgência |
|---------|----------|----------|----------|
| **Sollu** | Regularização financeira, aumento de score, higienização digital | 100% remota. B2B/B2C. Ciclo longo. Perde ~R$5k/semana por falta de follow-up e cobrança | **CRÍTICA** |
| **AMP 213** | Casa de eventos no sítio histórico de Olinda. Buffet completo, cozinha profissional | Agenda por demanda (sem calendário fixo). Comercial fecha eventos. Execução envolve cozinha, garçom, limpeza | Alta |
| **Bica Bar Sensorial** | Bar speakeasy no 2º piso do AMP 213. 65 pessoas sentadas. Conceito premium | Operação fixa: quinta a sábado, 19h–01h | Alta |

**Operação compartilhada AMP + Bica:**
- Mesmo imóvel (Rua do Amparo, 213)
- Equipe-chave compartilhada: Lana, segurança, cozinha + 2-3 colaboradores
- Estoque de cozinha parcialmente compartilhado
- Erick tende a enxergar como 2 negócios separados — o sistema respeita isso mas expõe a operação integrada

---

## Decisões Arquiteturais Definitivas

### D1 — Supabase é a fonte da verdade

O `apps/api` (Fastify + Prisma + SQLite) está **descartado** — sem consumidor real em produção. A camada em uso real é Next.js consumindo Supabase diretamente. Workers serão Node.js standalone consumindo Supabase via service role key.

O `prisma/schema.prisma` **não é descartado** — é arquivado como referência de domínio para guiar o design dos schemas Postgres.

### D2 — Monolito Modular (não 3 sistemas separados)

```
os.levay.com.br         → LEVAY OS Hub (auth master, CEO dashboard, equipe, KPIs, cockpit)
os.levay.com.br/sollu   → Módulo Sollu
os.levay.com.br/bica    → Módulo Bica Bar
os.levay.com.br/amp     → Módulo AMP 213
```

Um Supabase (conta LEVAY OS), um deploy (Vercel), um auth (Supabase Auth com magic link).

**Trilha de extração futura:** se a Sollu exigir segregação LGPD ou time próprio, o módulo `sollu.*` é portável para deploy separado sem refazer a base.

### D3 — Sollu Website (sollubrasil.com.br) permanece separado

O site tem Supabase próprio (outra conta). Integração via webhook:
```
Lead no formulário do site → N8N/webhook → Lead criado no CRM Sollu do LEVAY OS
```
Não migrar banco agora. Conexão de entrada, não migração.

### D4 — Bica Bar é ERP completo de bar (não só reservas)

Escopo completo do produto Bica Bar:
- **Reservas inteligentes** — com gestão de mesa, fila de espera, confirmações
- **BICA CLUB (membership)** — sistema de associados com regras de acesso e benefícios
- **PDV (ponto de venda)** — garçom tira pedido no celular, comanda sai para cozinha
- **Controle de estoque** — integrado ao PDV (baixa automática ao vender)
- **Cardápio gerenciável** — Erick ou responsável atualiza sem técnico
- **Checklists de abertura e fechamento** — responsável registrado, o que não foi feito fica computado
- **Dashboard de caixa por noite** — faturamento e fechamento de cada dia de operação
- **Gestão de insumos e compras** — alertas de estoque mínimo, pedido automático a fornecedores
- **Mobile para colaboradores** — interface por role (garçom, cozinha, caixa, segurança)

### D5 — AMP 213 tem escopo comercial E operacional

AMP não é só pipeline de leads. O escopo cobre dois momentos:

**Comercial (fechar o evento):**
- Pipeline de leads (captação → proposta → fechamento)
- Calendário de disponibilidade e agenda de eventos
- Templates de resposta rápida (lead não esfria)

**Operacional (executar o evento):**
- Checklist de execução por evento (cozinha, garçom, limpeza, setup)
- Briefing do chef com cardápio e quantidade de pessoas
- Escala da equipe por evento
- Controle de presença da equipe no dia

### D6 — Mobile approach: PWA (Progressive Web App)

A abordagem mobile para colaboradores do Bica Bar será **PWA sobre Next.js** — responsivo, instalável no celular, sem custo de app store, sem build nativa. Interface por role: garçom vê tela de pedidos; segurança vê lista de reservas; cozinha vê comandas.

### D7 — Arquitetura de schemas Postgres por domínio

```sql
platform.*   → workspaces, users, companies, team, collaborators, audit
sollu.*      → crm_leads, pipeline_stages, receivables, followups, contracts
amp.*        → events, event_leads, calendar, event_checklists, team_schedule
bica.*       → reservations, members (bica_club), orders, stock, menu, checklists, cash_close
```

RLS policies por schema. Cross-domain apenas via plataforma (analytics, equipe compartilhada).

**Atenção:** a migração dos dados já existentes no Supabase (204 tasks, 6 colaboradores, 9 decisões importadas do Notion) para os novos schemas é um passo obrigatório no Pré-Trabalho antes das features de negócio.

### D8 — Whascale é a plataforma de integração WhatsApp

A integração de WhatsApp usará **Whascale** (já referenciada no PRD e no backlog). A integração nativa WhatsApp Business API é descartada por complexidade. A sequência é: templates manuais primeiro → Whascale com automação depois.

---

## Investigações Pendentes (antes de implementar as features dependentes)

Estas NÃO são decisões — são questões que precisam ser respondidas antes de determinadas fases:

| # | Questão | Impacta |
|---|---------|---------|
| I1 | `aidplug-crm` (sollu-system/): avaliar se tem base reutilizável para o CRM Sollu | Antes de construir Sollu CRM do zero |
| I2 | Whascale: já tem conta/instância ativa? Qual plano? | Antes de Fase 2 (automação WhatsApp) |
| I3 | N8N: tem instância rodando? Onde? | Antes de Fase 2 (webhook leads) |
| I4 | Cardápio Bica Bar: existe versão digital? Quem gerencia hoje? | Antes de Fase 4 (PDV + cardápio) |
| I5 | Reservas Bica Bar: como está sendo feito hoje? | Antes de Fase 3 |
| I6 | Leads AMP: chegam por qual canal (formulário, WhatsApp, Instagram)? Quem atende? | Antes de Fase 5 |
| I7 | Thaynan: papel formal na operação? Terá acesso ao sistema? Que role? | Antes de Fase 1 (onboarding) |
| I8 | Google Ads: ativo para AMP e/ou Sollu? Onde caem os leads hoje? | Antes de Fase 2 e Fase 5 |
| I9 | BICA CLUB: já existe alguma regra de membership? Benefícios definidos? | Antes de Fase 4 |
| I10 | Cap "Hoje = 3" do cockpit: é só para Erick ou para toda a equipe? | Antes de Fase 6 |

---

## Roadmap por Impacto Real de Negócio

### Fase 0 — Pré-Trabalho Técnico (1–2 dias, antes de tudo)

**Objetivo:** Limpar o terreno. Sem isso, qualquer feature nova pode ser construída sobre a fundação errada.

**Escopo:**
- Validar que `apps/levay-os` (Next.js + Supabase) roda e tem Story 1.1 e 2.1 operacionais
- Arquivar formalmente `apps/api` (renomear para `apps/api.deprecated`, ADR no repo)
- Confirmar conexão Supabase no ambiente de produção (variáveis de ambiente no Vercel)
- Reorganizar schemas Postgres por domínio (migração dos dados existentes: 204 tasks, 6 colaboradores, 9 decisões)
- Avaliar `aidplug-crm` (I1) — resultado vira insumo para Fase 2

**RESULTADO:** Base técnica limpa. Uma fonte de verdade. Sem ambiguidade de arquitetura.

---

### Fase 1 — "Erick vê o sistema" (3–5 dias)

**Objetivo:** Primeira coisa funcionando que Erick consegue abrir e usar sem ajuda.

**Escopo:**
- Deploy LEVAY OS no Vercel (Story 1.1 + 2.1 já estão done — validar que funcionam)
- Erick faz login via magic link no celular
- Vê o pipeline de leads da Sollu e o dashboard base
- Sessão hands-on: cadastrar os primeiros leads juntos
- Thaynan também recebe acesso com role adequada

**RESULTADO:** Confiança. Erick vê algo funcionando pela primeira vez — não ouve uma promessa.

**Critério de sucesso:** Erick abre no celular sem ajuda, vê um lead com status, e entende o que aquela tela representa para o negócio dele.

---

### Fase 2 — "Para de sangrar R$5k/semana" (2–3 semanas)

**Objetivo:** Industrializar o funil da Sollu — da captação ao follow-up ao recebimento.

**Escopo:**
- Workers follow-up D+0/D+1/D+3 rodando (retomar esqueleto em `apps/workers`, portar para Supabase)
- Webhook: lead do sollubrasil.com.br → entra no CRM automaticamente (N8N ou direto)
- Templates de resposta para WhatsApp — scripts definidos com Erick (manual primeiro)
- Gestão de cobranças / contas a receber básica
- Scripts e fluxos de atendimento orientados à produtização dos serviços Sollu
- Fila visual de pendências de follow-up (o que exige ação hoje)

**RESULTADO:** Gargalo de follow-up e cobrança da Sollu está industrializado.

**KPI:** Redução mensurável de leads sem contato após 72h.

---

### Fase 3 — "Bica Bar tem profissionalismo" (3–4 semanas)

**Objetivo:** Operação noturna (qui–sáb) com suporte digital real na mão da equipe.

**Escopo:**
- Sistema de reservas — gestão de mesas, fila de espera, confirmação
- PWA mobile: Lana, segurança e equipe instalam no celular e usam na operação
- Checklists de abertura e fechamento por função — o que não foi feito fica registrado
- Roles mobile: segurança vê lista de reservas; Lana vê painel geral; cozinha vê demandas
- Controle básico de estoque (sem PDV ainda — só entrada/saída manual)

**RESULTADO:** Operação quinta–sábado tem rastreabilidade, profissionalismo e responsabilidade clara.

---

### Fase 4 — "Bica Bar é um negócio" (4–6 semanas)

**Objetivo:** ERP completo do bar — operação e financeiro.

**Escopo:**
- PDV — garçom tira pedido no celular, comanda vai para cozinha
- Cardápio gerenciável (Erick ou responsável atualiza)
- Estoque integrado ao PDV (baixa automática ao fechar pedido)
- Dashboard de caixa por noite de operação (faturamento, cobertura)
- Gestão de insumos e compras (alertas de estoque mínimo → pedido a fornecedor)
- **BICA CLUB (membership):** cadastro de associados, regras de acesso, benefícios
- Integração WhatsApp via Whascale: confirmação de reserva, alerta de estoque a fornecedor

**RESULTADO:** Bica vira um negócio com dados reais, operação rastreada e membership estruturado.

---

### Fase 5 — "AMP fecha mais eventos" (2–3 semanas)

**Objetivo:** Pipeline comercial e execução operacional de eventos funcionando.

**Escopo — Comercial:**
- Lead pipeline (captação → proposta → fechamento)
- Calendário de disponibilidade com status comercial
- Templates de atendimento rápido (resposta em minutos, não horas)
- Integração com leads de formulários/Google Ads via N8N

**Escopo — Execução:**
- Checklist por evento (setup, cozinha, garçom, limpeza, encerramento)
- Briefing do chef com cardápio confirmado e quantidade de pessoas
- Escala da equipe (quem trabalha em qual evento)
- Registro de presença e responsabilidade por tarefa

**RESULTADO:** AMP para de perder eventos por demora e executa com mais profissionalismo.

---

### Fase 6 — "Erick enxerga o grupo" (2 semanas)

**Objetivo:** LEVAY OS como painel executivo e hub de inteligência do grupo.

**Escopo:**
- KPIs consolidados: Sollu (pipeline, cobranças), Bica (reservas, caixa, estoque), AMP (eventos, agenda, equipe)
- **Cockpit operacional** — visão HOJE / DECIDIR / DELEGAR / QUARENTENA por empresa
- Dashboard cross-business com visão do CEO
- Equipe/time com alocação cross-empresa (quem está em qual evento/operação)
- Alertas de exceção (o que está fora do normal: lead sem contato, estoque crítico, checklist em aberto)
- Histórico e rastreabilidade de decisões tomadas

**RESULTADO:** Erick tem inteligência de negócio. Para de gerir no WhatsApp e na cabeça.

---

## Orquestração XOIA (Framework de Execução)

### Ciclo por Feature

```
PLAN  → @product cria story com AC, tasks e critérios claros
BUILD → @dev implementa (Sonnet executa código)
CHECK → lint + test + typecheck + review manual
SHIP  → deploy Vercel + PR
```

### Para features complexas (PDV, mobile, integrações, ERP)

```
/opusplan [feature]  → Opus arquiteta (deep planning)
→ Plano estruturado aprovado por Gabriel
→ @dev executa fase a fase (Sonnet)
```

### Estrutura de Epics no Projeto

```
docs/stories/
├── fase-0-pre-trabalho-tecnico/
├── fase-1-deploy-crm-sollu/
├── fase-2-followup-workers-sollu/
├── fase-3-bica-reservas-mobile/
├── fase-4-bica-erp-completo/
├── fase-5-amp-comercial-execucao/
└── fase-6-hub-executivo/
```

---

## Inventário de Aproveitamento

### Pronto e Utilizável

| Componente | Status | Onde |
|------------|--------|------|
| Multi-tenancy + Tenant model | ✅ Done | Story 1.1 |
| Auth (magic link Supabase) | ✅ Done | Story 1.1 |
| RBAC por papel (CEO/ADMIN/OPERATOR/COMMERCIAL/FINANCIAL) | ✅ Done | Story 1.1 |
| Audit logging | ✅ Done | Story 1.1 |
| CRM Sollu (pipeline, leads, auditoria de funil) | ✅ Done | Story 2.1 |
| RLS Supabase (workspace isolation) | ✅ Done | supabase/migrations/ |
| Dashboard base (layout, auth, tenant-context, Mesa do Diretor) | ✅ Done | apps/levay-os |
| Cockpit (statusCockpit: HOJE/DECIDIR/DELEGAR/QUARENTENA) | ✅ Done | apps/levay-os |

### Parcial — Portar para Supabase

| Componente | Status | Ação |
|------------|--------|------|
| Workers follow-up D+0/D+1/D+3 | ⚠️ Esqueleto em Prisma | Portar lógica para Supabase service role |
| integrations-whatsapp | ⚠️ Placeholder | Implementar sobre Whascale |

### Investigar Antes de Decidir

| Item | Avaliação necessária |
|------|---------------------|
| `sollu-system/aidplug-crm-main.zip` | Tem base reutilizável para CRM Sollu? (investigação I1) |
| `sollu-system/sistema_de_atendimento_crewai/` | Lógica de atendimento aproveitável — mas stack Python/CrewAI incompatível. Extrair conceito, não código |

### Arquivar (não descartar — apenas mover para fora do fluxo ativo)

| Item | Motivo |
|------|--------|
| `apps/api/` (Fastify) | Sem consumidor real. Arquivar como `apps/api.deprecated` |
| `prisma/schema.prisma` | Valiosa como referência de domínio — mover para `docs/reference/prisma-domain-model.prisma` |
| `bica-bar-system/` | Placeholder vazio — o produto Bica vai dentro do LEVAY OS |

---

## Princípios de Execução

- **Entregar antes de prometer.** Erick está cansado de promessas. Cada fase termina com algo que ele pode abrir e usar.
- **Mobile first nas features de operação.** Equipe do Bica usa celular. PWA é o caminho.
- **Workers determinísticos.** Follow-up, cobrança, alertas — scripts que não erram e têm log.
- **Quality Gates.** Erick aprova, sistema executa. Ele nunca é o executor.
- **Design premium.** Sem padrões genéricos. Interface que combina com a marca do grupo.
- **Cockpit como centro.** O conceito HOJE / DECIDIR / DELEGAR / QUARENTENA é o diferencial operacional do LEVAY OS — aparece desde a Fase 1.

---

*Levay OS — Plano Estratégico v1.1 — 2026-05-13*
*Fonte: Análise Opus + Devolutiva paralela + Sessão Gabriel | Revisado: auditoria de completude e coerência*
