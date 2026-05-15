# SESSÃO DE CONTEXTUALIZAÇÃO — 13/mai/2026

> **O que é:** Registro do aprendizado, nuances e insights da sessão de análise do sistema LEVAY OS.
> **Origem:** Auditoria Notion (Nonô) + sessão Erick + Thaynan (11/mai/2026) + análise de código.

---

## 🎯 O QUE É O LEVAY OS?

É o **sistema interno do Grupo Levay** —Holding que opera 3 empresas + área pessoal do Erick:

| Empresa | Modelo | Especialidade |
|---------|--------|----------------|
| **SOLLU** | Isolado (regra-de-ouro: "Sollu nunca se mistura") | Limpa nome / crédito |
| **BICA (Bica Bar Sensorial)** | Compartilha prédio + cozinha + Lana com AMP | Experiência sensorial premium |
| **AMP213** | Compartilha prédio + cozinha + Lana com Bica | Eventos e patrocínios |
| **Pessoal do Erick** | Separado | Vida pessoal |
| **Geral** | Transversal | Lacunas transversais |

---

## 🔑 INSIGHTS PRINCIPAIS DA AUDITORIA

### 1. Multi-tenancy NÃO é uniforme

**Descoberta-chave:** Sollu é tenant **estritamente isolado** (caixa, time, dados separados). Bica + AMP **compartilham operação** (time, processos admin, ritmo).

**Implicação técnica:**
- RLS no Supabase não pode ser "one-size-fits-all"
- Sollu = tenant isolado puro
- Bica+AMP = cluster compartilhado com sub-tenancy por empresa nas tabelas operacionais
- Tabela `colaboradores` e `alocacoes` devem ser compartilhadas para Bica+AMP

---

### 2. Vocabulário operacional é CONTRATO

**Descoberta-chave:** Termos como "Movimento mínimo", "Foco trimestral", "Modalidade ♾️/🎯", "O que muda na prática" não são rótulos — são **invariantes obrigatórias**.

**Implicação técnica:**
- Cada termo deve ser campo NOT NULL no schema quando aplicável
- "Movimento mínimo" → `movimentoMinimo` em Task (já existe no schema ✅)
- "Modalidade" → `modality` em Project (não existe ainda ❌)
- "O que muda na prática" → `impactoPratico` em Decision (não existe ainda ❌)

---

### 3. Erick é gargalo único em decisões comerciais

**Descoberta-chave:** Toda venda AMP depende do Erick. Decisões irreversíveis Sollu dependem do Erick. Sem motor comercial em nenhuma das três.

**Implicação técnica:**
- Funil de vendas precisa de gate explícito "aprovação Erick" entre "qualified" e "won"
- Workflows que mandam tudo pro Erick vão travar → needing "modo offline"
- Notificações precisam ser agressivamente filtradas

---

### 4. WhatsApp concentra ~90% da operação Sollu

**Descoberta-chave:** Fontes operacionais: WhatsApp + Drive + Consulte Positivo + consulta.consulte.io

**Implicação técnica:**
- Módulo Sollu não é "app web com chat secundário" — é **integração WhatsApp em primeiro lugar**
- Web app = interface de leitura/triagem, não captura primária
- Whascale = ferramenta oficial decidido (ainda não implementado)

---

### 5. DRE inexistente em todas as empresas

**Descoberta-chave:** Nenhum DRE de nenhuma empresa existe. Decisões são baseadas em intuição. Risco financeiro alto.

**Implicação técnica:**
- Qualquer feature financeira (calculadora de pacote AMP, dashboard de margem Bica, projeção Sollu) **vai produzir números fictícios** até DRE existir
- Módulo financeiro começa por **entrada manual de DRE mensal simplificado**

---

### 6. Thaynan é SPOF de comunicação

**Descoberta-chave:** Thaynan concentra ~100% da comunicação histórica AMP213 e operação administrativa Bica+AMP.

**Implicação técnica:**
- Sistema precisa de **modo "Thaynan offline"**
- Fluxos que ela executa devem ter `responsavelSubstituto` modelado
- Notificações urgentes precisam de fallback automático

---

## 📊 REGRAS DE NEGÓCIO CRÍTICAS

### Capacidade

- **Hoje = max 3 itens** (não 4) — regra primária do quadrante Hoje
- Detalhamento 4-itens (estratégico/decisão/destravamento/micro) = metadata opcional

### Classificação universal

Todo item capturado deve ser classificado em **1 das 5**:
1. **Tarefa** — ação concrete
2. **Decisão** — escolha a ser tomada
3. **Delegação** — entregar pra alguém
4. **Referência** — 保存 sem ação imediata
5. **Lixo mental** — close/arquivar (não é gambiarra — é classificação oficial)

### Two-step capture

1. **Captura** — form sem classificar (Input bruto)
2. **Triagem** — definir empresa, projeto, dono, prioridade (SLA 48h)
3. **Movimento mínimo** — preencher antes de fechar

### Pergunta-bloqueio (tarefas do Erick)

Antes de aceitar tarefa nova com `dono = Erick`:
1. Isso só eu consigo fazer?
2. Se sim, por quê?
3. Quem fica mais forte se eu passar?

---

## 🎨 CONVENÇÕES DE DESIGN

### Cores por empresa

**Atual (selects bases):**
- Sollu = 🔵 azul
- Bica = roxo
- AMP = laranja
- Pessoal = cinza
- Geral = marrom

**Proposta (Fase 3 - pendente validação):**
- Sollu = azul escuro / 💼
- Bica = preto + dourado / 🥃
- AMP = terracota / 🏛️

**Implicação:** Aguardar validação antes de codificar tokens de cor.

---

### Vocabulário banned

Termos a **EVITAR** (substituir por):
- "Atrasado" → "Fora do tempo"
- "Pendente" → "Em movimento"
- "Prioridade alta" → "Merece sua mão hoje"
- "Urgente" → "Não pode esperar amanhã"
- "Reunião" → "Conversa de decisão"
- "Cliente" → "Conta"
- "Equipe" → "Time"
- "Meta" → "Direção"

Anti-clichês: ~~jornada~~, ~~transformação~~, ~~potencializar~~, ~~elevar~~

---

## 🔌 SISTEMAS EXTERNOS CATALOGADOS

| Sistema | Empresa | Uso |
|---------|---------|-----|
| WhatsApp (Whascale) | Sollu/Bica/AMP | Comunicação primária |
| iReserve | Bica | Reservas — Erick verifica DIARIAMENTE |
| Anota.ai | Bica | Faturamento — verificação SEMANAL (segunda) |
| Autentique | AMP | Contratos e propostas |
| Consulte Positivo / consulta.consulte.io | Sollu | Consulta crédito |
| Apple Reminders | Pessoal | **Fonte de verdade de tarefas pessoais do Erick** |
| Google Drive | Todas | Armazenamento |

---

## 📈 PRIORIDADES DE INTEGRAÇÃO

1. **WhatsApp via Whascale** — Já decidido, implementação pendente
2. **Apple Reminders** — Sync bidirecional inicial (non-breaking)
3. **iReserve** — Widget reservas vs lotação máxima
4. **Anota.ai** — Faturamento + funcionalidades não usadas (cardápio, estoque, CMV, escala)
5. **Autentique** — Webhooks de assinatura
6. **Consulte Positivo** — Fluxo limpa nome (sem API → RPA?)

---

## 🏗️ DECISÕES ARQUITETURAIS REGISTRADAS

### Modelo DEV → MIGRAÇÃO → PROD

- **Massa Influ** = DEV/LAB (onde arquitetura evolui)
- **Workspace Erick** = PROD (dados operacionais reais)
- Regra: arquitetura só evolui no Massa Influ → Pacote de Migração → aplica no Erick

**Implicação:** Schema migrations versionadas com changelog (ex: v0.2.0)

---

### Limite duro — máximo 3 ferramentas custom vivas

- Máximo de 3 ferramentas vivas simultâneas
- Acima disso, aposentar/consolidar uma antes de criar nova
- Critério **3 sins** obrigatório: (1) Notion-nativo já doeu? (2) tem usuário/frequência? (3) substitui destino existente?

---

## 📋 LIÇÕES APRENDIDAS (BOAS PRÁTICAS)

### Para agentes novos

1. **Não assumir "todo mundo sabe"** — muitos processos estão em prosa de página, não em bases estruturadas
2. **Validar schema contra dados reais** — o sistema operacionalmente vazio (Descoberta #22)
3. **Confirmar tenant model** — Sollu ≠ Bica+AMP
4. **Respeitar vocabulário** — sinonímia = bug
5. **Criar métrica de uso instrumentada desde day 1** — pré-requisito do limite-hard de 3 ferramentas

### Armadilhas identificadas

1. **Modelo uniforme de tenancy** — quebra um dos modelos
2. **Task sem movimento mínimo** — viola princípio do manifesto
3. **Projeto sem modalidade** — quebra metade do uso
4. **Dashboard financeiro sem DRE** — produz números fictícios
5. **Notificações sem filtro** — Erick sobrecarregado

---

## 📚 FONTES CONSULTADAS

### Notion
- `LEVAY OS` (raiz)
- `Sessão Erick + Thaynan — 11/mai/2026`
- `Mesa do Diretor — Erick`
- `Onboarding Erick` (Fases 0-4)
- `Vocabulário operacional — Levay`
- `Plano de Gestão — Gabriel`
- `Pacote v0.2.0` (Releases & Migração)

### Código
- `/prisma/schema.prisma` (315 linhas)
- `/apps/levay-os/AGENTS.md`
- `/package.json` (workspace config)
- `/apps/levay-os/package.json` (Next.js 16, React 19, Tailwind v4)

---

## 🚧 ESTADO ATUAL DO CÓDIGO

### ✅ Implementado
- Task com `movimentoMinimo`
- Task com `statusCockpit` (HOJE, DECIDIR, DELEGAR, QUARENTENA)
- Tenant model (multi-tenancy)
- User + UserTenantRole (RBAC)
- Lead, Receivable, Reservation, Member, MemoryEntry

### ❌ NÃO implementado
- Project com modality (♾️/🎯)
- Decision com `impactoPratico`
- Colaborador com vínculo/status + Alocacao
- Empresa completo (DNA, cluster)
- Lacunas & Melhorias
- Workflow capture/triage
- Integração Whascale
- KPIs instrumentados

---

## 📅 Log

| Data | Versão | Alteração |
|------|--------|-----------|
| 13/mai/2026 | 1.0 | Versão inicial — aprendizado da sessão |

---

*Documento registrado em: `/docs/SESSAO-CONTEXTO-E-APRENDIZADOS.md`*
*Uso: contexto para continuidade de sessões futuras*