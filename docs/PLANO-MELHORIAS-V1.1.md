# PLANO DE MELHORIAS — LEVAY OS v1.1

> **Versão:** 1.1 (derivada da auditoria Nonô de 12/mai/2026 + sessão Erick+Thaynan 11/mai/2026)
> **Status:** Pendente validação de 5 contradições antes de implementação
> **Origem:** Documento de auditoria Notion 转代码实现指引

---

## 📊 Análise do Estado Atual

### O que já existe (schema + UI):
- ✅ Task com `movimentoMinimo` (Prisma linha 153)
- ✅ Task com `statusCockpit` (HOJE, DECIDIR, DELEGAR, QUARENTENA)
- ✅ Tenant model (multi-tenancy)
- ✅ User + UserTenantRole (RBAC)
- ✅ Lead (CRM)
- ✅ Receivable (financeiro)
- ✅ Reservation (iReserve)
- ✅ Member (colaboradores)
- ✅ MemoryEntry (sistema de conhecimento)
- ✅ Next.js 16 + React 19 + Tailwind v4
- ✅ Supabase SSR integrado
- ✅ AGENTS.md com vocabulário operacional

### O que NÃO existe e é CRÍTICO:
- ❌ Modelo de Projetos com Modalidade ♾️/🎯
- ❌ Modelo de Decisões com "O que muda na prática"
- ❌ Modelo de Colaboradores com Alocações (vínculo + status)
- ❌ Modelo de Empresa completo (DNA, cluster, compartilhamento)
- ❌ Modelo de Lacunas & Melhorias (issue tracker)
- ❌ Two-step capture/triage workflow
- ❌ Cap "Hoje" = 3 itens
- ❌ Integração Whascale
- ❌ KPIs do Erick instrumentados

---

## 🚀 PRIORIDADE 1 — Schema & Modelos Fundamentais

### 1.1 Modelo de Projetos (NÃO EXISTE)
**Impacto:** Médio-alto | **Estimativa:** 2h

**Criar no schema.prisma:**
```prisma
model Project {
  id              String   @id @default(uuid())
  name            String
  description     String?
  modality        String   // ♾️ CONTINUO | 🎯 PONTUAL — INVARIANTE
  focoTrimestral  String?  // 2026-T1, 2026-T2
  status          String   @default("ATIVO") // ATIVO | PAUSADO | CONCLUIDO | CANCELADO
  empresa         String   // SOLLU | BICA | AMP213 — invierte de Select para Relation
  tenantId        String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([modality])
}
```

---

### 1.2 Modelo de Decisões (NÃO EXISTE)
**Impacto:** Alto | **Estimativa:** 1.5h

**Criar no schema.prisma:**
```prisma
model Decision {
  id               String   @id @default(uuid())
  title            String
  contexto         String?  // O que está em jogo
  opcoesConsideradas String? // Quais alternativas foram avaliadas
  impactoPratico   String   // "O que muda na prática" — NOT NULL
  frentesImpactadas String? // Relation com Projetos
  status           String   @default("EM_ANALISE") // EM_ANALISE | APROVADA | REJEITADA | IMPLEMENTADA
  ownerId          String   // Quem decidiu
  decidedAt        DateTime?
  tenantId         String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  tenant Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([status])
}
```

---

### 1.3 Modelo de Colaboradores + Alocações (INCOMPLETO)
**Impacto:** Alto | **Estimativa:** 3h

**O que existe:** `Member` com `role` (string livre)
**O que PRECISA existir:**

```prisma
enum Vinculo {
  CLT
  PJ
  FREELA
  DIARISTA
  ESTAGIO
}

enum StatusColaborador {
  ATIVO
  EM_EXPERIENCIA
  AFASTADO
  BANCO_FREELAS
  DESLIGADO
}

model Colaborador {
  id              String            @id @default(uuid())
  nome            String
  email           String            @unique
  telefone        String?
  vinculo         Vinculo           // CLT, PJ, Freela, Diarista, Estágio
  status          StatusColaborador @default(ATIVO)
  dataAdmissao    DateTime?
  dataDesligamento DateTime?
  tenantId        String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  alocacoes       Alocacao[]
  
  tenant Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([status])
  @@index([vinculo])
}

model Alocacao {
  id          String   @id @default(uuid())
  colaboradorId String
  empresa     String   // SOLLU | BICA | AMP213
  cargo       String
  inicio      DateTime
  fim         DateTime? // Nullable = ativo
  responsavelSubstitutoId String? // Para fallback quando referência utama offline
  createdAt   DateTime @default(now())
  
  colaborador Colaborador @relation(fields: [colaboradorId], references: [id], onDelete: Cascade)
  
  @@index([colaboradorId])
  @@index([empresa])
}
```

---

### 1.4 Modelo de Empresa Completo (NÃO EXISTE)
**Impacto:** Alto | **Estimativa:** 2.5h

```prisma
enum EscopoEmpresa {
  SOLLU
  BICA
  AMP213
  PESSOAL_ERICK
  GERAL
}

model Empresa {
  id                  String        @id @default(uuid())
  nome                String
  slug                String        @unique
  escopo              EscopoEmpresa // 5 escopos
  cluster             String?       // null = isolada (Sollu), "bica+amp" = compartilhada
  
  dnaOneLiner         String?
  promessa            String?
  tomVoz              String?
  antiPublico         String?
  
  principalDesafio    String?
  principalOportunidade String?
  proximoMarco        String?
  
  compartilhaPredioCom    String?
  compartilhaCozinhaCom   String?
  
  corHex              String?       // #2563EB (Sollu), #7C3AED (Bica), #EA580C (AMP)
  
  tenantId            String
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  
  tenant Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([escopo])
}
```

---

### 1.5 Modelo de Lacunas & Melhorias (NÃO EXISTE)
**Impacto:** Médio | **Estimativa:** 1.5h

```prisma
enum TipoLacuna {
  LACUNA
  PERGUNTA
  MELHORIA_UX_UI
  RISCO
  IDEIA
  DEPENDENCIA
}

enum ImpactoLacuna {
  ALTO
  MEDIO
  BAIXO
}

enum StatusLacuna {
  ABERTA
  EM_ANALISE
  EM_IMPLEMENTACAO
  RESOLVIDA
  ARQUIVADA
}

model Lacuna {
  id                String          @id @default(uuid())
  titulo            String
  tipo              TipoLacuna
  status            StatusLacuna    @default(ABERTA)
  impacto           ImpactoLacuna
  empresa           String?
  contexto          String?
  proximoMovimento  String?
  bloqueia          String?
  dono              String?
  resolvidaEm       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([tipo])
  @@index([status])
  @@index([impacto])
  @@index([empresa])
}
```

---

## 🚀 PRIORIDADE 2 — Workflows & Regras de Negócio

### 2.1 Two-Step Capture/Triage
**Impacto:** Alto | **Estimativa:** 4h

**Criar:**
1. Nova tabela `CapturaBruta` (recebe do form de captura sem classificar)
2. View de Triagem (equivalente à view Notion "🧩 Sem projeto")
3. SLA de triagem: 48h → transforma em Task/Decision/Delegation
4. UI: wizard de triagem com empresa, projeto, dono, prioridade

```prisma
model CapturaBruta {
  id          String   @id @default(uuid())
  titulo      String
  origem      String   // "WhatsApp" | "Email" | "Captura Manual" | "Apple Reminders"
  tipo        String?  // Fill after triage: tarefa | decisao | delegacao | referencia | lixo_mental
  triadaEm    DateTime?
  tenantId    String
  createdAt   DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

---

### 2.2 Pergunta-Bloqueio de 3 Etapas
**Impacto:** Alto | **Estimativa:** 2h

**Regra:** Antes de aceitar tarefa nova com `dono=Erick`, sistema precisa responder:
1. Isso só eu consigo fazer?
2. Se sim, por quê?
3. Quem fica mais forte se eu passar?

**Implementação:**
- Adicionar campos opcionais na Task: `razaoCentralizacao`, `candidatoDelegacao`
- No controller de criação de Task: se `dono = 'erick-id'`, injetar as 3 perguntas no flow
- Gerar relatório de delegação para coaching

---

### 2.3 Cap "Hoje" = 3 Itens
**Impacto:** Alto | **Estimativa:** 1h

**Implementação:**
- Query com `LIMIT 3` para view HOJE
- Se já tem 3 e tentar adicionar 4ª → modal "Qual sai?"
- Detalhamento (estratégico/decisão/destravamento/micro) = metadata opcional

---

### 2.4 Quarentena vs Inbox Separados
**Impacto:** Médio | **Estimativa:** 2h

**Falta:**
- Modelo explícito de `Quarentena`
- Workflow de 3 perguntas: "por que apareceu?", "precisa de ação?", "cabe onde?"
- UI de "aceitar em estrutura" vs "criar nova página"

---

## 🚀 PRIORIDADE 3 — Integrações Externas

### 3.1 Roadmap de Integrações
**Prioridade de implementação:**

1. **WhatsApp via Whascale** — PRIORIDADE 1
   - Adapter layer: `WhatsAppProvider` interface com implementação Whascale

2. **Apple Reminders** — PRIORIDADE 2
   - Integração via CalDAV/EventKit
   - Sync bidirecional inicial

3. **iReserve** — PRIORIDADE 3
   - Widget "Reservas próximo fim de semana vs lotação máxima"
   - Campo `lotacaoMaxima` em Empresa (Bica)

4. **Anota.ai** — PRIORIDADE 4
   - Faturamento Bica
   - Entidades derivadas: cardápio, estoque, CMV, escala

5. **Autentique** (AMP) — PRIORIDADE 5
   - Contratos e propostas
   - Webhook para status de assinatura

6. **Consulte Positivo / consulta.consulte.io** (Sollu) — PRIORIDADE 6
   - Fluxo de limpa nome
   - Sem API pública → considerar RPA

---

## 🚀 PRIORIDADE 4 — UI & Experiência

### 4.1 Mesa do Diretor como Cockpit Primário
**Impacto:** Alto | **Estimativa:** 6h

**6 quadrantes fixos:**
- 📥 Capturar
- 🔥 Hoje (cap 3)
- 🧠 Decidir
- 👥 Delegar
- 🏢 Empresas
- ⚠️ Alertas

**Widget configurável (3 modos):**
- Suporte a 3 modos: enxuto | completo | conversacional
- Cada widget tem `densidade` toggleável

---

### 4.2 Vocabulário Operacional - Linter
**Impacto:** Médio | **Estimativa:** 2h

**Implementar:**
1. `.memory/glossary.md` canônico (7 termos替换 + 4 anti-clichês)
2. CI check: PR com termo banido = build fail
3. Tabela `glossario_canonico` no schema

```prisma
model GlossarioCanonico {
  id              String   @id @default(uuid())
  termoEvitado    String
  termoOficial    String
  status          String   // "APROVO" | "MUDO" | "REMOVER"
  validadoPor     String?
  validadoEm      DateTime?
  createdAt       DateTime @default(now())
  
  @@unique([termoEvitado])
}
```

---

### 4.3 Identidade Visual - Conflito de Cores
**Impacto:** Médio | **Estimativa:** 1h

**Conflito vivo:**
- Selects bases (legado): Sollu azul, Bica roxo, AMP laranja, Pessoal cinza, Geral marrom
- Fase 3 (proposta): Sollu azul escuro, Bica preto+dourado, AMP terracota

**Ação:** Aguardar Erick validar Fase 3, depois migration

---

## 🚀 PRIORIDADE 5 — Sistema de KPIs & Observabilidade

### 5.1 KPIs do Erick
**Impacto:** Alto | **Estimativa:** 3h

**Métricas obrigatórias:**
1. `% de tarefas que SAEM da mão do Erick` (delegação)
2. Decisões por semana
3. Ratio estratégico/operacional
4. Tempo até 1ª decisão do dia
5. Horas/dia em movimentos estratégicos vs operacionais (meta: -2h/dia em 90 dias)

**Implementação:**
- Campo `tipoMovimento` em Task: ESTRATEGICO | OPERACIONAL | DECISAO | DELEGACAO
- Histórico de mudança de dono (`historicoDonoTarefa`)
- Dashboard semanal consolidado

---

### 5.2 Painel de Saúde do Sistema
**Impacto:** Médio | **Estimativa:** 2h

**7 views auditoriais:**
- Quantas tarefas sem movimento mínimo?
- Quantos projetos sem foco trimestral?
- Quantas decisões sem impacto prático?
- Notificação semanal a Gabriel com drift detectado

---

### 5.3 Bússola do Diretor
**Impacto:** Médio | **Estimativa:** 1.5h

```prisma
model BussolaDiretor {
  id          String   @id @default(uuid())
  usuarioId   String
  trimestre   String   // 2026-T1, 2026-T2
  
  ganhoQueImporta   String
  travaPrincipal    String
  direcaoSistema    String
  
  audioOrigem   String?
  dataCaptura   DateTime @default(now())
  versao        String   @default("1.0")
  
  @@unique([usuarioId, trimestre])
}
```

---

## 🚀 PRIORIDADE 6 — IA & Automação

### 6.1 Badge "Rascunho" Obrigatório
**Impacto:** Alto | **Estimativa:** 1h

**Implementação:**
- Campo `statusValidacao` em MemoryEntry: RASCUNHO | VALIDADO | REJEITADO
- KPI: tempo médio de validação — se muito curto = "sim educado"

---

### 6.2 Tom do Nonô Configurável
**Impacto:** Médio | **Estimativa:** 2h

**6 dimensões + 4 anti-padrões:**
- Tom: DIRETO | COACH | PARCEIRO | FRIO_ANALITICO | PROVOCADOR | RESUMO_SECO
- Anti: sem_cliches | sem_rodeio | sem_moralismo | sem_pergunta_retorica

---

### 6.3 Devolutiva de Sessão - Template
**Impacto:** Médio | **Estimativa:** 1h

```prisma
model DevolutivaSessao {
  id              String   @id @default(uuid())
  sessaoOrigem    String
  participantes   String   // JSON array
  
  bussola         String?
  manifesto       String?
  top3Tarefas     String?  // JSON array
  movimentos90d   String?  // JSON array
  ritualDiario    String?
  linhaTempo      String?
  perguntaAberta  String?
  
  createdAt       DateTime @default(now())
}
```

---

## 📋 RESUMO DE MIGRATIONS NECESSÁRIAS

| # | Migration | Impacto | Precedência |
|---|-----------|---------|-------------|
| 1 | Adicionar Project, Decision, Colaborador, Alocacao, Empresa, Lacuna, Glossario, Bussola, Devolutiva, CapturaBruta, HistoricoDono | ALTO | ASAP |
| 2 | Adicionar campos razaoCentralizacao, candidatoDelegacao em Task | ALTO | Depende #1 |
| 3 | Integração Whascale (layer adapter) | ALTO | #1 completo |
| 4 | Apple Reminders sync | MÉDIO | #3 completo |
| 5 | UI Mesa do Diretor (6 quadrantes) | ALTO | #1 completo |
| 6 | Vocabulário linter | MÉDIO | #1 completo |
| 7 | KPIs dashboard | ALTO | #1 + #2 completo |
| 8 | iReserve widget | MÉDIO | #1 completo |
| 9 | Anota.ai integração | MÉDIO | #8 completo |

---

## ⚠️ CONTRADIÇÕES A VALIDAR ANTES DE IMPLEMENTAR

| # | Contradição | Status | Ação |
|---|-------------|--------|------|
| 1 | Cap "Hoje": 3 vs 4 itens | **Pendente** | Definir antes de codificar |
| 2 | Paleta de cores | **Pendente** | Aguardar Erick validar Fase 3 |
| 3 | Bica e AMP são 1 cluster ou 2 separadas? | **Pendente** | Confirmar: "2 empresas separadas com compartilhamento de prédio+cozinha+Lana" |
| 4 | HOME vs Mesa do Diretor | **Pendente** | Confirmar: Mesa é porta oficial |
| 5 | Quem responde Sollu WhatsApp? | **Pendente** | Confirmar: Jade (não Tainã) |

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Confirmar cap "Hoje" (3 ou 4)
- [ ] Confirmar paleta de cores final
- [ ] Confirmar modelo Bica+AMP (cluster vs separado)
- [ ] Confirmar porta de entrada (Mesa vs HOME)
- [ ] Confirmar responsável WhatsApp Sollu
- [ ] Executar Migration #1 (schema completo)
- [ ] Executar Migration #2 (campos pergunta-bloqueio)
- [ ] Implementar workflow capture/triage
- [ ] Implementar UI Mesa do Diretor
- [ ] Instrumentar KPIs
- [ ] Implementar integração Whascale
- [ ] Implementar Apple Reminders sync

---

## 📅 Log de Atualizações

| Data | Versão | Alteração |
|------|--------|-----------|
| 13/mai/2026 | 1.1 | Versão inicial do plano derivada da auditoria Nonô + sessão Erick+Thaynan |

---

*Documento registrado em: `/docs/PLANO-MELHORIAS-V1.1.md`*
*Para continuidade: revisar este documento antes de cada sessão de implementação*