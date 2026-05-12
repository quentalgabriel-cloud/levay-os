# Levay OS Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Industrializar operações repetitivas das empresas do grupo para remover gargalos manuais do fundador.
- Reduzir perdas operacionais por atraso de resposta, follow-up e cobrança com automações determinísticas.
- Implementar arquitetura multi-tenant com autonomia operacional por empresa e governança central na holding.
- Estruturar Quality Gates para que times humanos validem entregas da IA em vez de executar tarefas operacionais.
- Criar base escalável para expansão de módulos por tenant sem retrabalho estrutural.

### Background Context

O grupo Levay opera hoje com três negócios distintos (Sollu, AMP 213 e Bica Bar), com demandas operacionais, comerciais e financeiras diferentes, porém concentradas manualmente em um ponto único de execução. Esse modelo cria lentidão de resposta, baixa previsibilidade operacional e perda direta de receita.

O Levay OS nasce para transformar a operação em um sistema orientado a workflows determinísticos, onde workers e automações executam tarefas repetíveis, enquanto humanos atuam em aprovação, exceções e decisões estratégicas. O resultado esperado é ganho de escala, padronização e aumento da captura de receita.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-19 | 0.1 | PRD inicial gerado a partir do briefing Levay OS | Morgan (PM) |

## Requirements

### Functional

1. FR1: O sistema deve suportar arquitetura multi-tenant com isolamento lógico de dados, fluxos e dashboards por tenant.
2. FR2: O sistema deve permitir governança central para visão consolidada e gestão cross-tenant pela liderança da holding.
3. FR3: O sistema deve disponibilizar gerenciamento de usuários com perfis e permissões por papel (ex.: CEO, Comercial, Operações, Financeiro).
4. FR4: O tenant Sollu deve possuir CRM comercial com pipeline visual de estágios configuráveis.
5. FR5: O tenant Sollu deve executar automação de follow-up em D+0, D+1 e D+3 para leads sem resposta.
6. FR6: O tenant Sollu deve possuir módulo de contas a receber com régua de cobrança automatizada.
7. FR7: O tenant Sollu deve permitir geração automática de contratos em PDF com dados do lead/cliente.
8. FR8: O tenant AMP 213 deve capturar leads automaticamente a partir de formulários e canais integrados.
9. FR9: O tenant AMP 213 deve oferecer calendário de eventos proprietários com controle de disponibilidade e status comercial.
10. FR10: O tenant AMP 213 deve oferecer templates de resposta rápida para atendimento comercial.
11. FR11: O tenant Bica Bar deve oferecer sistema de reservas com gestão de mesas, capacidade máxima e fila de espera.
12. FR12: O tenant Bica Bar deve oferecer módulo de membership (BICA CLUB) com regras de acesso e benefícios.
13. FR13: O tenant Bica Bar deve gerar alertas de estoque mínimo e disparar solicitação automatizada via WhatsApp para fornecedores.
14. FR14: O sistema deve integrar canais de WhatsApp para leitura/classificação de mensagens e envio automatizado com trilha de auditoria.
15. FR15: O sistema deve integrar Google Workspace/Drive para armazenamento e recuperação de contratos e anexos.
16. FR16: O sistema deve integrar N8N para ingestão de webhooks de captação e acionamento de workflows.
17. FR17: O sistema deve integrar gateway(s) de pagamento para conciliação e status de cobrança quando aplicável.
18. FR18: O sistema deve registrar eventos operacionais em log auditável por tenant, usuário e automação.
19. FR19: O sistema deve permitir configuração de Quality Gates por fluxo, com aprovação humana antes de ações críticas.
20. FR20: O sistema deve disponibilizar dashboard dinâmico por perfil, com visão executiva para CEO e visão de funil para times comerciais.

### Non Functional

1. NFR1: O sistema deve garantir segregação de dados entre tenants em todas as consultas, APIs e relatórios.
2. NFR2: O sistema deve operar com disponibilidade mínima de 99,5% em horário comercial.
3. NFR3: O tempo de resposta para operações críticas de CRM e reservas deve ser inferior a 2 segundos em p95.
4. NFR4: Toda automação deve ter observabilidade mínima (status, tempo de execução, erro e responsável).
5. NFR5: Fluxos automatizados críticos devem ser idempotentes e resilientes a reprocessamento.
6. NFR6: O sistema deve manter trilha de auditoria para aprovações em Quality Gates.
7. NFR7: A solução deve seguir princípios de segurança por padrão (least privilege, segredo gerenciado, criptografia em trânsito e repouso).
8. NFR8: O design deve seguir linguagem high-level minimalista, sem padrões visuais genéricos de IA.
9. NFR9: O front-end deve ser responsivo para desktop e mobile sem perda de capacidade operacional.
10. NFR10: A arquitetura deve suportar inclusão de novos tenants e módulos sem acoplamento forte entre domínios.

## User Interface Design Goals

### Overall UX Vision

Interface premium, minimalista e orientada a decisão. O foco não é “mostrar tudo”, e sim expor claramente o que exige ação e o que está sob controle por automação.

### Key Interaction Paradigms

- Dashboard por perfil (role-aware UI).
- Funis e filas operacionais com estado visual claro.
- Ações críticas protegidas por Quality Gates (aprovar, ajustar, rejeitar).
- Templates e automações configuráveis por tenant sem necessidade técnica.

### Core Screens and Views

- Visão Executiva da Holding (cross-tenant)
- Dashboard Operacional por Tenant
- CRM e Pipeline (Sollu / AMP 213)
- Módulo de Cobranças e Recebíveis (Sollu)
- Agenda e Gestão de Eventos (AMP 213)
- Reservas e Fila de Espera (Bica Bar)
- Membership Manager (BICA CLUB)
- Centro de Automações e Quality Gates
- Integrações e Health Status (WhatsApp, N8N, Drive, Pagamentos)

### Accessibility: WCAG AA

Aplicar padrão WCAG AA para contraste, navegação por teclado e semântica básica nos fluxos principais.

### Branding

Estética high-level minimalista com comunicação visual sóbria e exclusiva por tenant, mantendo unidade da holding no topo.

### Target Device and Platforms: Web Responsive

Plataforma web responsiva, priorizando desktop operacional e suporte completo para mobile em fluxos de acompanhamento/aprovação.

## Technical Assumptions

### Repository Structure: Monorepo

Monorepo para compartilhar componentes de plataforma (auth, tenancy, observabilidade, workers, integrações) e manter separação clara entre apps/módulos por domínio.

### Service Architecture

Arquitetura modular orientada a domínio com núcleo de plataforma multi-tenant, serviços de aplicação por contexto (CRM, Reservas, Financeiro, Membership) e camada de automações/workers para execução determinística.

### Testing Requirements

Estratégia Unit + Integration com cobertura de cenários críticos de automação, integrações externas e isolamento de tenant, complementada por smoke tests E2E nos fluxos de maior impacto financeiro.

### Additional Technical Assumptions and Requests

- Mecanismo de policy enforcement para `tenant_id` obrigatório em operações de dados.
- Event bus interno para acionar workers e registrar estados de execução.
- Conectores MCP para WhatsApp, Google Workspace, N8N e gateway de pagamento com retries e dead-letter.
- Geração de PDF para contratos com templates versionados.
- Feature flags para rollout gradual por tenant e por módulo.
- Catálogo de templates de mensagens e régua de follow-up configurável por tenant.

## Epic List

- Epic 1: Foundation, Tenancy & Governance: Estabelecer a base multi-tenant, autenticação, RBAC e observabilidade mínima com primeiro dashboard operacional.
- Epic 2: Sollu Revenue Engine: Entregar CRM, pipeline, automações de follow-up e cobrança para recuperar receita perdida.
- Epic 3: AMP 213 Lead-to-Event Flow: Estruturar captura de leads, CRM de atendimento e calendário de eventos com SLA de resposta.
- Epic 4: Bica Bar Premium Operations: Implementar reservas, fila, membership e alertas de estoque com pedido automatizado.
- Epic 5: Cross-Tenant Automations & Quality Gates: Consolidar motores de workflow determinístico e aprovações humanas para ações críticas.
- Epic 6: Executive Intelligence & Scale: Entregar visão executiva consolidada, indicadores de performance e base para expansão de novos tenants.

## Epic 1 Foundation, Tenancy & Governance

Objetivo expandido: Criar o alicerce técnico e operacional do Levay OS para garantir isolamento por tenant, segurança de acesso e governança central. Este épico entrega a infraestrutura mínima que habilita os módulos de negócio subsequentes com baixo risco de retrabalho.

### Story 1.1 Setup de Tenancy, Auth e RBAC

As a administrador da holding,
I want configurar tenants, usuários e permissões por papel,
so that cada empresa opere isoladamente com governança central segura.

#### Acceptance Criteria

1. Estrutura de tenants criada com isolamento lógico de dados por `tenant_id`.
2. Autenticação implementada com associação de usuário a tenant e papéis.
3. RBAC aplicado em APIs e navegação de interface.
4. Auditoria registra criação/alteração de usuários e permissões.

### Story 1.2 Observabilidade Base e Logs Auditáveis

As a líder operacional,
I want visualizar status de execuções e logs por tenant,
so that eu consiga identificar falhas e gargalos rapidamente.

#### Acceptance Criteria

1. Logs estruturados por tenant, módulo e tipo de execução.
2. Dashboard técnico exibe falhas recentes e tempo de processamento.
3. Eventos críticos de segurança e aprovação são auditáveis.

### Story 1.3 Dashboard Dinâmico por Perfil

As a CEO/comercial/operações,
I want ver dashboards diferentes conforme meu papel,
so that eu tenha contexto relevante para tomada de decisão.

#### Acceptance Criteria

1. Perfil CEO visualiza visão macro cross-tenant.
2. Perfil comercial visualiza funil e pendências de follow-up.
3. Perfil operações visualiza filas e automações pendentes de aprovação.

## Epic 2 Sollu Revenue Engine

Objetivo expandido: Atacar imediatamente o vazamento de receita da Sollu com automação comercial e financeira. A entrega deve reduzir perda por falta de follow-up e cobrança já nas primeiras semanas de uso.

### Story 2.1 CRM e Pipeline Comercial Sollu

As a atendente comercial da Sollu,
I want gerenciar leads em pipeline visual,
so that eu acompanhe oportunidades com previsibilidade.

#### Acceptance Criteria

1. Pipeline com estágios configuráveis e atualização por drag-and-drop.
2. Lead possui histórico de interações e status comercial.
3. Métricas básicas de conversão por estágio disponíveis.

### Story 2.2 Régua de Follow-up D+0/D+1/D+3

As a gestor comercial,
I want automatizar follow-up por janela de tempo,
so that nenhum lead esfrie por atraso de resposta.

#### Acceptance Criteria

1. Motor agenda e executa follow-up em D+0, D+1 e D+3.
2. Mensagens usam templates aprovados por tenant.
3. Falha de envio gera alerta e reprocessamento controlado.

### Story 2.3 Cobrança Automatizada e Recebíveis

As a financeiro da Sollu,
I want automatizar cobranças e monitorar recebíveis,
so that eu reduza inadimplência e tempo de cobrança.

#### Acceptance Criteria

1. Contas a receber com vencimento/status em painel dedicado.
2. Disparo automático de cobrança por regras configuráveis.
3. Registro de retorno de pagamento quando integração estiver ativa.

### Story 2.4 Geração de Contrato em PDF por Worker

As a operação Sollu,
I want gerar contratos automaticamente com dados do cliente,
so that eu elimine retrabalho manual e acelere fechamento.

#### Acceptance Criteria

1. Worker gera PDF a partir de template versionado.
2. Documento é salvo no repositório integrado (Drive).
3. Processo passa por Quality Gate para revisão final quando necessário.

## Epic 3 AMP 213 Lead-to-Event Flow

Objetivo expandido: Reduzir tempo de resposta comercial e aumentar conversão de demandas de eventos. O fluxo deve ir da captura de lead até a organização de agenda com rastreabilidade.

### Story 3.1 Captura de Leads via Formulários/Webhooks

As a time comercial AMP 213,
I want captar leads automaticamente dos canais digitais,
so that nenhuma oportunidade se perca entre sistemas.

#### Acceptance Criteria

1. Webhooks (N8N) ingerem leads com validação básica.
2. Lead é criado com origem/campanha e timestamp de entrada.
3. Erros de ingestão são registrados e reprocessáveis.

### Story 3.2 CRM de Atendimento com Templates Rápidos

As a atendente de eventos,
I want responder com templates padronizados,
so that eu ganhe velocidade sem perder consistência.

#### Acceptance Criteria

1. Templates versionados por tipo de evento.
2. Respostas podem ser personalizadas antes do envio.
3. Histórico de comunicação fica associado ao lead.

### Story 3.3 Calendário de Eventos Proprietários

As a coordenação AMP 213,
I want gerenciar agenda de eventos e disponibilidade,
so that evite conflitos e aumente previsibilidade operacional.

#### Acceptance Criteria

1. Calendário exibe eventos por status e data.
2. Conflitos de agenda são sinalizados automaticamente.
3. Mudanças de data/status geram trilha de auditoria.

## Epic 4 Bica Bar Premium Operations

Objetivo expandido: Otimizar ocupação qualificada e ticket médio do Bica Bar com foco em exclusividade. O sistema prioriza experiência premium, controle de capacidade e relacionamento com membros.

### Story 4.1 Reservas, Mesas e Fila de Espera

As a host do Bica Bar,
I want gerenciar reservas e fila com limite de lotação,
so that eu mantenha exclusividade sem perder receita.

#### Acceptance Criteria

1. Sistema respeita capacidade máxima configurada (70 pessoas).
2. Gestão de mesas com estados (livre, reservada, ocupada, no-show).
3. Fila de espera ordenada com promoção automática por regra.

### Story 4.2 BICA CLUB Membership

As a gestor de relacionamento,
I want administrar membership e benefícios,
so that eu fortaleça recorrência e percepção premium.

#### Acceptance Criteria

1. Cadastro de membros com status e validade.
2. Regras de benefício aplicadas nas reservas elegíveis.
3. Painel de membros ativos, renovações e histórico.

### Story 4.3 Alertas de Estoque e Pedido via WhatsApp

As a operação do bar,
I want receber alerta de estoque mínimo e enviar pedido automaticamente,
so that eu reduza ruptura de insumos críticos.

#### Acceptance Criteria

1. Níveis mínimos configuráveis por item crítico.
2. Alerta dispara automaticamente ao atingir limiar.
3. Pedido ao fornecedor é montado e enviado via WhatsApp com confirmação de envio.

## Epic 5 Cross-Tenant Automations & Quality Gates

Objetivo expandido: Unificar o motor de automações e aprovação humana para escalar confiabilidade operacional. Este épico formaliza a camada de controle que separa execução determinística de decisão humana.

### Story 5.1 Motor de Workers Determinísticos

As a administrador de automações,
I want orquestrar workers padronizados por tenant,
so that fluxos repetíveis executem com previsibilidade.

#### Acceptance Criteria

1. Workers com estados claros (pendente, executando, sucesso, falha).
2. Regras de retry e idempotência configuráveis.
3. Histórico de execução consultável por tenant e fluxo.

### Story 5.2 Quality Gates Configuráveis por Fluxo

As a gestor de operação,
I want definir pontos de aprovação humana,
so that ações críticas não ocorram sem validação.

#### Acceptance Criteria

1. Quality Gate pode ser adicionado em etapas críticas do fluxo.
2. Aprovação/rejeição exige usuário autorizado e justificativa.
3. Decisão de gate é auditável e vinculada ao evento executado.

### Story 5.3 Centro de Exceções Operacionais

As a time de operações,
I want tratar exceções em uma fila única,
so that eu resolva falhas sem perder contexto.

#### Acceptance Criteria

1. Exceções exibidas por criticidade e impacto financeiro.
2. Interface permite reprocessar, escalar ou arquivar ocorrência.
3. Tempo médio de resolução e backlog de exceções são monitorados.

## Epic 6 Executive Intelligence & Scale

Objetivo expandido: Transformar dados operacionais em inteligência acionável para decisões de crescimento e expansão. A camada executiva deve mostrar resultado por tenant e apontar alavancas de receita e eficiência.

### Story 6.1 Indicadores Executivos Cross-Tenant

As a CEO,
I want visualizar KPIs consolidados por empresa,
so that eu priorize ações de maior impacto.

#### Acceptance Criteria

1. Dashboard consolida receita, conversão e eficiência por tenant.
2. Filtros por período e tenant com comparação histórica.
3. Alertas destacam desvios críticos de metas.

### Story 6.2 Insights de Performance Comercial e Operacional

As a liderança do grupo,
I want identificar gargalos e oportunidades por fluxo,
so that eu ajuste estratégia com base em dados.

#### Acceptance Criteria

1. Relatórios mostram tempos médios de resposta e conversão por etapa.
2. Insights sinalizam perda estimada por atraso/falha de processo.
3. Recomendações de otimização por tenant são listadas.

### Story 6.3 Onboarding de Novos Tenants

As a administrador da plataforma,
I want provisionar novos tenants com templates padrão,
so that eu escale o sistema para novas operações rapidamente.

#### Acceptance Criteria

1. Wizard cria tenant com módulos base e configurações iniciais.
2. Permissões, templates e integrações podem ser herdados por perfil de negócio.
3. Provisionamento é auditável e reversível.

## Checklist Results Report

Checklist PM pendente para rodada de validação com stakeholders. Este PRD está pronto para revisão executiva e refinamento técnico.

## Next Steps

### UX Expert Prompt

Use este PRD para desenhar a experiência end-to-end do Levay OS com foco em interface high-level minimalista, dashboard dinâmico por perfil e fluxos críticos de CRM, reservas e Quality Gates por tenant.

### Architect Prompt

Use este PRD para propor arquitetura multi-tenant modular com workers determinísticos, camada de integrações MCP (WhatsApp, Drive, N8N, pagamentos), estratégia de isolamento de dados e plano técnico por épico.
