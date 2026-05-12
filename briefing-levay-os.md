# BRIEFING LEVAY OS

## 1. Visão Geral e Contexto do Negócio

O "Levay OS" será um sistema de gestão centralizada e execução operacional para um grupo holding composto por três empresas de naturezas distintas. O fundador (Erick) atua hoje como o gargalo operacional central, executando tarefas manuais (compras, cobranças, atendimento via WhatsApp) que resultam em perda direta de receita e escalabilidade.

O objetivo do sistema é industrializar as operações determinísticas e criar "Quality Gates" (Portões de Qualidade) onde os humanos apenas aprovam o trabalho feito pela IA.

## 2. Arquitetura Multi-Tenant (Múltiplas Empresas)

O sistema deve ser construído de forma agnóstica, separando a operação em "Tenants" (inquilinos), permitindo que cada empresa tenha fluxos, automações e dashboards independentes, mas com uma governança unificada no topo.

## 3. Especificações por Tenant (Módulos Iniciais)

### Tenant 1: Sollu (Motor Financeiro / Serviços B2B e B2C)

**Realidade:** Empresa de regularização financeira, aumento de score e higienização digital. Ticket alto, mas perde cerca de R$ 5.000 por semana por falta de follow-up e cobrança.

**Módulos Necessários:** CRM comercial, pipeline de vendas visual, automação de follow-up (D+0, D+1, D+3) e um módulo financeiro focado em automação de cobranças (contas a receber).

**Executores:** Uso massivo de "Workers" (scripts determinísticos) para ler mensagens, triar leads e gerar contratos em PDF sem intervenção humana.

### Tenant 2: AMP 213 (Hub Criativo e Eventos)

**Realidade:** Casa de eventos e experiências. Recebe muitas solicitações via Google Ads e formulários (casamentos, aniversários, corporativo) que esfriam pelo tempo de resposta.

**Módulos Necessários:** Gestor de Leads (captura automatizada de formulários), calendário de eventos proprietários e CRM para atendimento comercial com templates de respostas rápidas.

### Tenant 3: Bica Bar (Experiência Premium / Escassez)

**Realidade:** Cocktail bar premium com lotação máxima de 70 pessoas. O foco é aumentar o ticket médio e a exclusividade, não o volume.

**Módulos Necessários:** Sistema robusto de reservas (gestão de mesas e filas de espera), módulo de membership (BICA CLUB), e um sistema de alertas de estoque mínimo integrado ao WhatsApp para automatizar pedidos a fornecedores.

## 4. Regras de Interface e UX

A interface deve abolir os "padrões genéricos de IA". O design deve seguir uma estética High-Level e minimalista, adaptando a visualização (Dashboard Dinâmico) de acordo com o usuário (visão macro para o CEO, visão de funil para vendas).

## 5. Integrações (Servidores MCP Recomendados)

A arquitetura deve prever conexões MCP (Model Context Protocol) para WhatsApp, Google Workspace (Drive para contratos), N8N (para webhooks de captação) e Gateways de Pagamento.
