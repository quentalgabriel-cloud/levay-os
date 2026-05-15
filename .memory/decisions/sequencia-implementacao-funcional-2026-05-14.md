---
title: Sequência de Implementação Funcional pós-HUB Operacional (2026-05-14)
type: decision
created: 2026-05-14
updated: 2026-05-14
confidence: high
tags: [decisao, sequencia, mvp, sprint, thaynan-pivot, godmode-2026-05-14]
connections: [[arquitetura-ecossistema-definitivo]], [[equipe-rotina-fornecedores-2026-05-14]], [[erick-gargalo-whatsapp]], [[thaynan-nao-opera-na-pratica]], [[parking-lot-central-financeira]]
related: [[sprint-foundation-v1.1-2026-05-13]]
---

# Sequência de Implementação Funcional pós-HUB Operacional

## Contexto

Em 2026-05-14, após ler 3 documentos convergentes (Briefing Central Financeira, Briefing Compras Insumos, HUB Operacional HTML), foi tomada decisão estratégica sobre a SEQUÊNCIA de implementação no LEVAY OS.

## Princípio decisório

**"Tirar Erick do WhatsApp em UMA dor real, com substrato modular que sirva às outras dores que virão depois."**

Validado por:
- Briefing Compras: "tirar Erick do fluxo, não envolvê-lo melhor"
- Briefing Financeiro: "Filtro de Decisão do Erick" (10.1)
- HUB: 3 riscos críticos (Erick gargalo, Thaynan não opera, Suedney sem decisão)

## Insight crítico — Thaynan é o pivô

**Uma única pessoa atravessa as 3 dores principais:**
- Compras (Quarta — consolida pedidos faturados, contata fornecedores)
- Financeiro (Seg+Qui 14h — monta lote de pagamento, audita Cartão Lana, cobra SOLLU)
- Comunicação operacional (canal único substituindo Erick)

**Sem ferramenta para Thaynan operar, todo o resto é vaporware.**

Por isso a sequência abaixo prioriza Thaynan como usuária ativa da Sprint 1, não Erick.

## Sequência aprovada (4 sprints funcionais + parking lot)

### Sprint 1 (semana 1-2) — "Lista de Compras Digital"

**Por quê primeiro:** maior alavancagem (4 papéis: Suedney/Rafael entrada, Lana/Thaynan execução, Erick aprovação exceção). Briefing dedicado já existe (`docs/briefing-compras-insumos-amp-bica.md`). É a primeira frente onde Thaynan opera de verdade. Quintas deixam de ser "dia da loucura".

**Substrato técnico:**
- Schema `bica.*` ou `amp.*` (depende — ver decisão arquitetura)
- Tabelas: `procurement_requests`, `procurement_items`, `suppliers`, `procurement_history`
- Ainda **NADA financeiro** — só pedidos. Status `solicitado → consolidado → comprado → recebido`

**Gabriel (eu) precisa decidir antes:**
- Schema único ou separação `bica.procurement_*` / `amp.procurement_*`? (Provável: tabela única com `company_id`, porque compras compartilhadas BICA+AMP são realidade)
- Mobile-first (Suedney/Rafael lançam no celular) — PWA ou web responsivo?

**Saída funcional:**
- Suedney lança lista terça em <5 min
- Thaynan vê todos pedidos da semana, aciona fornecedores, fecha compra
- Erick recebe só exceções (acima do teto, fornecedor novo, ruptura iminente)

### Sprint 2 (semana 3-4) — "Pauta Diária + Filtro Mesa"

**Por quê:** bloqueia o restante. Sem canal único substituindo WhatsApp, equipe continua contatando Erick mesmo com Sprint 1 pronto.

**Substrato técnico:**
- Tabela `daily_agendas` com 5 itens/dia (Thaynan → Erick)
- Integração com `/mesa` (já existe no app)
- Estados: `pendente | resolvido | escalado | ignorado`

**Saída funcional:**
- Thaynan envia 5 itens/dia para a Mesa do Erick
- Erick abre Mesa mobile pela manhã, resolve em 15 min
- Comunicação fora da Pauta vira exceção rastreável (não fluxo padrão)

### Sprint 3 (semana 5-7) — "Retiradas Erick" (Conexão #1 do briefing financeiro)

**Por quê:** primeira tabela financeira. Resolve a dor #1 declarada do Erick ("dinheiro some entre PJ e PF"). Abre caminho para todas as outras conexões.

**Substrato técnico:**
- 4 tabelas `*_payables` (sollu, bica, amp, personal) — uma por caixa para isolamento estrutural
- Tabela `personal_inflows` (Retiradas Recebidas)
- Server Action transacional `register_withdrawal` que cria 2 linhas atomicamente
- `numeric(14,2)` no DB, BigInt em JS (decisão pré-requisito)
- `idempotency_key` em toda action financeira (decisão pré-requisito)

**Decisões arquiteturais bloqueadoras a resolver antes:**
- Migrations: consolidar em `/supabase/migrations` raiz ou em `apps/levay-os/supabase/`?
- Tipo numérico financeiro: `numeric(14,2)` confirmado
- Idempotência: padrão a definir (UUID client-side + unique constraint)

**Saída funcional:**
- Erick lança 1 retirada mobile, vê PESSOAL e empresa atualizarem
- Card "Saldo Projetado por Caixa" na Mesa (lê das 4 tabelas, mostra SOLLU isolada visualmente)

### Sprint 4 (semana 8-9) — "Janela de Pagamento Manual"

**Por quê:** resolve a dor "decisão de pagamento dispersa". Sem cron, sem scheduler — Thaynan opera manualmente como primeira versão.

**Substrato técnico:**
- Tabela `payment_windows` (versionável: `valid_from/valid_to`)
- UI "Modo Janela" (Thaynan): tela específica, lista payables com vencimento <= próxima janela, multi-select, botão "Enviar para Erick aprovar"
- UI Erick mobile: lista resumida + 1 botão "Aprovar lote"

**Saída funcional:**
- Seg 13h Thaynan abre Modo Janela, monta lote, envia
- Seg 14h Erick aprova mobile em 5 min
- Seg 14h05 Erick executa pagamentos no banco e marca como pago

## O que fica no parking lot (Sprints 5+)

Ver [[parking-lot-central-financeira]] para detalhes. Resumo:

| Item | Conexão briefing | Quando faz sentido |
|------|------------------|-------------------|
| Cartão Lana mini-painel próprio | #5 (briefing) + 10.8 | Sprint 5+ — depois que Lana adotar lançamento manual |
| Eventos AMP de 1ª classe + Pacotes | #2 + 10.5 | Sprint 6+ — depois que AMP fechar 3 eventos pelo sistema |
| CMV BICA automatizado | #3 | Sprint 7+ — depois de 60 dias de A Pagar BICA |
| Custo de Vida + Pró-labore formal | #4 | Sprint 8+ — exige 90 dias de retiradas registradas |
| Insight Mensal arquivado | #6 + 10.10 | Sprint 9+ — exige Auditoria Semanal como ritual |
| OCR de boleto | (não no briefing) | Nunca no MVP. Captures→inbox manual já resolve. |
| Painel Lana com login próprio | 10.8 | Sprint 10+ |
| Funil leads AMP qualificação automática | 10.5 + 10.7 | Sprint 11+ |

## Riscos arquiteturais ativos (do briefing financeiro, ainda não endereçados)

- R1: Cliente compartilhado fura SOLLU — **resolvido pela arquitetura**: schemas `sollu.*` / `bica.*` / `amp.*` isolam estruturalmente
- R2: `events.value` como Number único é dívida — **endereçar na Sprint 6**
- R3: `workspace_config` JSONB para janelas — **endereçar na Sprint 4** (tabela própria)
- R4: Tipo numérico financeiro — **endereçar antes da Sprint 3** (numeric(14,2))
- R5: Captures→A Pagar sem OCR — **estratégia adotada na Sprint 1**
- R6: Idempotência IA — **endereçar antes da Sprint 3**
- R7: Migrations fragmentadas — **endereçar antes da Sprint 3**
- R8: View `event_margin_v` performance — **deferido**

## Próximos passos imediatos

1. Aprovar esta sequência com Erick (90 min, com seção E do briefing financeiro impressa — 13 perguntas em aberto)
2. Resolver decisões arquiteturais bloqueadoras (migrations, numeric, idempotência) — 1 dia técnico
3. Iniciar Sprint 1 — Lista de Compras Digital

## Trade-offs aceitos

- **Adiar Central Financeira completa:** os 4 caixas + 6 conexões viram Sprint 3-9, não MVP. Em troca, Thaynan opera de verdade já na Sprint 1-2.
- **Adiar SOLLU:** apesar do "sangrar 5k/semana" do roadmap original, SOLLU não tem ferramenta operacional pendente — tem comercial (cobrança automática Sprint 8+, follow-up bot Sprint 12+). A dor operacional imediata é BICA+AMP via compras.
- **Pessoa Lana sem login no MVP:** Cartão Lana é só flag em payable lançado pela Thaynan. Painel próprio Lana fica para Sprint 10+.
- **Sem OCR de boleto:** capture→inbox→lançamento manual cobre 100% do MVP. OCR é Fase 2 ou nunca.

## Como reverter esta decisão

Esta decisão pode ser revertida apenas com nova decisão documentada que apresente:
- Evidência de que a Sprint 1 (Compras) não é mais a maior alavancagem
- Evidência de que outra frente bloqueia mais
- Aprovação Erick + Thaynan + Gabriel
