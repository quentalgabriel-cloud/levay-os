---
title: Avaliação Técnica — Sessão 2026-05-13
type: context
created: 2026-05-13
updated: 2026-05-13
tags: [avaliacao, tecnica, decisao, erick, arquitetura]
confidence: medium
---

# Avaliação Técnica — Sessão 2026-05-13

## Contexto

Sessão de avaliação de arquitetura e viabilidade técnica do LEVAY OS, solicitado por Erick (dono do Grupo Levay) para tomar decisão sobre estrutura do ecossistema de sistemas.

## Informações Coletadas

### Empresas do Grupo

| Empresa | Modelo no LEVAY OS | Características |
|---------|-------------------|-----------------|
| **Sollu** | Sistema isolado/específico | Totalmente separada, operações diferentes |
| **AMP 213** | Multi-tenant compartilhado | Eventos, buffet, casa de eventos |
| **Bica Bar** | Multi-tenant compartilhado | Speakeasy 65 pessoas, 2º piso do AMP |

### Operações Compartilhadas

AMP 213 + Bica Bar compartilham:
- Cozinha profissional
- Chef e auxiliares
- Equipe de garçom
- Serviço de limpeza
- Prédio (imóvel)

### Detalhes do Imóvel (AMP 213)

- **Localização**: Rua do Amparo, 213, Sítio Histórico de Olinda
- **Layout**:
  - Salão principal (após porta de entrada)
  - Quintal (desemboque do salão)
  - Área externa trasera (decida/terreno acidentado reformada)
  - 2º piso: Bica Bar Sensorial

### Conceito Bica Bar

- Speakeasy
- Luz baixa
- Estética: rustico/chique com contrastes contemporâneos
- Lotação: **65 pessoas** (dado corrigido de 70)
- Potencial identificado: "bastante potencial para eventos experimentais em outros formatos"

## Perguntas Feitas ao Erick

### 1. Operações Compartilhadas

> O que exatamente seria "compartilhado"?
> - Estoque de insumos (bebidas, food)?
> - Equipe de cozinha/serviço?
> - Financeiro (receitas misturadas ou separadas)?
> - Contratos com fornecedores?

> E o que seria "individual"?
> - Calendário de eventos específicos de cada um?
> - Leads/clientes específicos?
> - Métricas separadas?

### 2. Arquitetura de Plataforma Aberta

> O LEVAY OS seria uma API central que expõe dados para consumo?
> Ou seria uma plataforma com interface própria que também serve como hub?
> Os outros sistemas (Sollu system, etc) seriam consumidores de API ou teria outra forma de integração?

### 3. Domínio

> PENSOU em `os.levay.com.br` — isso significa que o LEVAY OS seria uma sub-rotina dentro do domínio principal `levay.com.br`?

### 4. Sistemas Externos Existentes

> O site da **Sollu** (sollubrasil.com.br) — é um site estático ou já tem sistema por trás?
> Existe algo do **AMP 213** online hoje?
> Você usa **n8n** ou outra ferramenta de automação hoje?

---

## Análise Inicial (Pendente Resposta)

### Pontos Fortes Identificados

| Componente | Status |
|------------|--------|
| Multi-tenancy via `Tenant` | ✅ Schema Prisma pronto |
| Autenticação (Magic Link) | ✅ Supabase Auth |
| RBAC por papel | ✅ Roles definidas |
| Audit logging | ✅ Completo |
| Dashboard dinâmico por perfil | ✅ Base pronta |
| CRM Pipeline Sollu | ✅ API implementada |

### Pontos de Atenção

| Item | Status |
|------|--------|
| Dualidade de modelos (Tenant vs workspaces/companies) | ⚠️ Precisa unificação |
| Integrações externas (WhatsApp, Drive, n8n) | ❌ Não implementado |
| Sistema de reservas Bica Bar | ❌ Story 4.1 pendente |
| Membership BICA CLUB | ❌ Story 4.2 pendente |
| Calendário AMP 213 | ❌ Story 3.2 pendente |

## Próximos Passos

1. Aguardar respostas do Erick às perguntas acima
2. Completar avaliação de viabilidade técnica
3. Definir arquitetura final do ecossistema

---

## Arquivos Criados/Atualizados Nesta Sessão

- `.memory/context/operacoes-compartilhadas-amp-bica.md` (NOVO)
- `.memory/context/bica-bar-conceito-sensorial.md` (NOVO)
- `.memory/context/vocabulary-labels.md` (ATUALIZADO — lotação 65)
- `.memory/context/tres-empresas-dominio.md` (ATUALIZADO — lotação)
- `.memory/decisions/arquitetura-ecossistema-definitivo.md` (ATUALIZADO — plataforma aberta)

## Links

[[operacoes-compartilhadas-amp-bica]], [[bica-bar-conceito-sensorial]], [[vocabulary-labels]], [[tres-empresas-dominio]], [[avaliacao-tecnica-2026-05-13]]