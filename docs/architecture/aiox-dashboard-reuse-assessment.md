# Avaliacao de Reaproveitamento: AIOS Dashboard Teste -> Levay OS

## Objetivo
Avaliar a viabilidade de trazer informacoes, padroes e recursos de `/Users/gabrielquental/Documents/AIOS/projects/AIOS-projeto-teste/apps/dashboard` para o projeto Levay OS, priorizando impacto operacional imediato na Sollu.

## Resumo Executivo
- Viabilidade geral: alta para reaproveitamento de padroes arquiteturais e componentes de observabilidade.
- Viabilidade de copiar integralmente o dashboard: baixa, por alto acoplamento a estrutura `.aios` (agentes/squads/stories/Bob).
- Recomendacao: reaproveitamento seletivo, com foco em monitoramento operacional (workers/cobranca/follow-up), shell visual premium e utilitarios robustos de API/file safety.

## Compatibilidade Atual
- Projeto teste (dashboard): Next.js 16 + React 19 + TypeScript + Tailwind + Zustand + servidor Bun/SQLite para eventos.
- Projeto Levay atual: monorepo com `apps/api` (Fastify), `apps/workers` (jobs follow-up), `apps/web` com modulos JS de view-model e testes; sem app Next estruturado ainda.
- Gap tecnico principal: frontend atual do Levay ainda nao esta no mesmo runtime/arquitetura do dashboard teste.

## Matriz de Reaproveitamento

### Reaproveitar Direto (baixo risco)
1. Padrao de stream em tempo real (SSE/WS)
- Fonte: `src/app/api/events/route.ts`, `src/app/api/bob/events/route.ts`, `src/hooks/use-monitor-events.ts`
- Uso no Levay: stream de eventos de workers (D+0/D+1/D+3), cobranca, quality gates e falhas de integracao.
- Ganho: visibilidade operacional imediata para reduzir perda de follow-up/cobranca.

2. Store pattern com Zustand para estado de monitoramento
- Fonte: `src/stores/monitor-store.ts`, `src/stores/ui-store.ts`
- Uso no Levay: estado global para painel executivo e painis por tenant/perfil.
- Ganho: implementacao rapida de dashboard dinamico por papel.

3. Utilitarios de seguranca para manipular caminhos de arquivo
- Fonte: `src/lib/squad-api-utils.ts` (especialmente `sanitizeRelativePath`, `resolvePathWithin`)
- Uso no Levay: leitura segura de templates, anexos e contratos (Drive/Storage) evitando traversal.
- Ganho: hardening de API com baixo esforco.

### Reaproveitar com Adaptacao (medio risco, alto valor)
1. App Shell premium (sidebar + status bar + layout persistente)
- Fonte: `src/components/layout/*`, `src/app/(dashboard)/layout.tsx`
- Adaptacao: trocar views AIOS por modulos Levay (`CRM`, `Financeiro`, `Automacoes`, `Quality Gates`, `Analytics`), mantendo tokens premium.
- Observacao: aderir ao guideline Levay (tenant color apenas em destaque).

2. Monitor server (Bun + SQLite)
- Fonte: `server/server.ts`, `server/db.ts`, `server/types.ts`
- Adaptacao: substituir eventos do Claude por eventos de dominio Levay (`lead_followup_due`, `collection_triggered`, `gate_pending`, `contract_uploaded`, `stock_alert_sent`).
- Decisao recomendada: portar conceito para Node/Fastify no `apps/api` ou criar `apps/monitor` separado para evitar runtime misto desnecessario.

3. Infra de API route com validacao defensiva
- Fonte: `src/app/api/status/route.ts`, `src/app/api/stories/*`
- Adaptacao: aplicar estrategia de validacao em endpoints sensiveis (`billing`, `contracts`, `quality-gates`).

4. Diagrama de fluxos em Mermaid
- Fonte: `src/lib/yaml-to-mermaid.ts`
- Adaptacao: visualizar workflows de Quality Gates e automacoes por tenant, sem dependencia de squads AIOS.

### Nao Reaproveitar (alto acoplamento / baixo valor ao Levay)
1. Views e APIs de `squads`, `agents`, `bob`, `stories`, `qa metrics` do framework AIOS
- Motivo: dependem da estrutura `.aios`, sem relacao direta com operacao Levay.

2. Integracao GitHub panel do dashboard teste
- Motivo: funcionalidade secundaria para o objetivo atual (estancar perda financeira Sollu).

3. Taxonomia de dominios do AIOS
- Fonte: `src/lib/domain-taxonomy.ts`
- Motivo: taxonomia nao representa tenants/processos do grupo Levay.

## Recursos/Insights Relevantes para Trazer Ja (Foco Sollu)
1. Painel de Operacao ao Vivo (MVP)
- Base tecnica: padrao SSE/WS + monitor store.
- Conteudo: fila de follow-up, cobrancas em atraso, tentativas de contato, gates pendentes.

2. Trilha de eventos unificada (auditoria operacional)
- Base tecnica: modelagem de eventos do monitor server.
- Conteudo: cada automacao gera evento com `tenantId`, `flow`, `status`, `actorType` (`worker`/`human`).

3. Guard rails de path para contratos/documentos
- Base tecnica: sanitizacao e resolucao segura de path.
- Conteudo: proteger upload/download de contratos e anexos.

## Plano de Incorporacao em 3 Etapas

### Etapa 1 (1-2 dias) - Reuso de padrao sem refator grande
- Criar endpoint de stream operacional no `apps/api` (SSE) para eventos de workers e quality gates.
- Introduzir modelo padrao de evento operacional no backend.
- Reutilizar estrategia de store para consumo no frontend atual (ou modulo web provisiorio).

### Etapa 2 (2-4 dias) - Shell visual premium Levay
- Subir estrutura base de app web em Next + TS (alinhada ao plano arquitetural).
- Portar App Shell/layout do dashboard teste com adaptacao de navegação Levay.
- Aplicar tokens do guideline premium ja definido em `docs/design/levay-premium-design-guidelines.md`.

### Etapa 3 (3-5 dias) - Observabilidade de negocio
- Portar/adaptar monitor server para eventos de dominio (nao eventos AIOS).
- Dashboard por perfil: CEO (macro), Comercial (funil/follow-up), Operacoes (execucao e gates).
- Alertas de impacto financeiro para Sollu (foco em perdas de follow-up/cobranca).

## Riscos e Mitigacoes
- Risco: introduzir dependencia desnecessaria de Bun.
- Mitigacao: priorizar implementacao no stack atual Node/Fastify.

- Risco: copiar UI com nomenclatura AIOS e herdar complexidade irrelevante.
- Mitigacao: migrar apenas shell e padroes visuais, nao features de squads/agents.

- Risco: desvio de foco da Sollu para features de observabilidade generica.
- Mitigacao: backlog de incorporacao vinculado a historias 2.x (CRM/follow-up/cobranca).

## Decisao Arquitetural Recomendada
Prosseguir com reaproveitamento seletivo imediato. Nao clonar o dashboard inteiro.

### Regra de decisao
- Se reduzir tempo para entregar valor na Sollu em <= 1 semana: incorporar.
- Se for acoplado a `.aios` ou nao impactar cobranca/follow-up: adiar.
