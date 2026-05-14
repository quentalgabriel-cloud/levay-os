---
title: Operações Compartilhadas — AMP 213 + Bica Bar
type: context
created: 2026-05-13
updated: 2026-05-13
tags: [operations, AMP213, bicabar, compartilhado, infraestrutura]
confidence: high
---

# Operações Compartilhadas — AMP 213 + Bica Bar

## Contexto

AMP 213 e Bica Bar operam no mesmo imóvel (Rua do Amparo, 213, Olinda) e **compartilham infraestrutura e equipe**, mas são negócios distintos com operações, clientes e métricas próprias.

## Operações Compartilhadas

| Recurso | Descrição |
|---------|-----------|
| **Cozinha Profissional** | Cozinha industrial completa, utilizada para buffet de eventos (AMP) e possível demanda de food do bar |
| **Chef e Auxiliares** | Equipe de cozinha que atende ambos os negócios conforme demanda |
| **Garçom** | Equipe de atendimento que serve tanto eventos no salão/área externa quanto o bar |
| **Limpeza** | Serviço de limpeza e organização do espaço completo |
| **Prédio/Instalações** | Mesmo casarão histórico — salão, quintal, área externa, decideda |

## Distribuição do Imóvel

```
┌─────────────────────────────────────────────────────────────┐
│                        AMP 213                              │
│  Rua do Amparo, 213 — Sítio Histórico de Olinda            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PORTA DE ENTRADA                                           │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SALÃO PRINCIPAL (pós entrada)                       │   │
│  │ - Eventos, casamentos, aniversários, corporativos  │   │
│  │ - Formato: salão aberto com pé-direito alto        │   │
│  └────────────┬────────────────────────────────────────┘   │
│               │                                             │
│               ▼                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ QUINTAL (desemboque do salão)                       │   │
│  │ - Área verde, ambiente externo                      │   │
│  └────────────┬────────────────────────────────────────┘   │
│               │                                             │
│               ▼                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ÁREA EXTERNA TRASEIRA (decida/terreno acidentado)   │   │
│  │ - Reformada e pronta para eventos                   │   │
│  │ - Área externa trasera reservada                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ═══════════════════════════════════════════════════════   │
│                           2º PISO                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BICA BAR SENSORIAL                                  │   │
│  │ - Conceito: Speakeasy                               │   │
│  │ - Lotação: 65 pessoas sentadas minimamente          │   │
│  │           confortáveis                              │   │
│  │ - Operação: Quinta a Sábado, 19h-01h                │   │
│  │ - Ambiente: luz baixa, rustico/chique,              │   │
│  │            contrastes contemporâneos                │   │
│  │ - Potencial: eventos experimentais em outros       │   │
│  │              formatos (não apenas bar tradicional) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Modelo de Dados vs. Operações Reais

### No Levay OS (Banco de Dados)

| Company | Slug | Operações |
|---------|------|-----------|
| AMP 213 | `amp213` | Eventos, buffet, leads, calendário |
| Bica Bar | `bicabar` | Reservas, pedidos, estoque, membership |

### Na Prática (Física)

- Membros da equipe (colaboradores) podem trabalhar em ambos
- Estoque pode ser compartilhado (bebidas, insumos)
- Calendário de eventos precisa conviver com schedule do bar

### Desafio para o Sistema

1. **Membros multi-empresa**: Um colaborador pode estar vinculado a AMP e Bica simultaneamente
2. **Estoque compartilhado**: Inventário de bebidas serve ambos
3. **Agenda integrada**: Eventos no salão afetam operação do bar (2º piso)
4. **Métricas separadas**:尽管 compartilhado, financeiro precisa ser separado

## Decisão de Arquitetura

Para o **LEVAY OS**, manter:
- **Dados separados** por `company_id`
- **Colaboradores com múltiplos `company_ids`** (tabela junction)
- **Estoques separados** inicialmente (evita complexidade)
- **Agenda integrada**: calendário unificado com filtro por empresa

---

## Histórico

- **2026-05-13**: Documentado após sessão com Erick — detalhamento das operações compartilhadas e layout físico do imóvel.

## Links

[[tres-empresas-dominio]], [[tenants-multi-tenancy]], [[bica-bar-operacoes]], [[amp213-operacoes]]