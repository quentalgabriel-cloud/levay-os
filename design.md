# Design System — Levay OS (Technical Spec)

Este documento é a **Single Source of Truth** (Fonte Única da Verdade) para o design e a implementação do Levay OS. Ele reflete a industrialização do sistema utilizando **Tailwind CSS v4**, **Variáveis Semânticas** e a estética **Warm Productivity** — inspirada em sistemas como Taskly, Crextio e Intelly.

---

## 🎯 0. Direção Visual

**Arquétipo de UI:** Productivity Tool + B2B SaaS Enterprise com personalidade quente.

O Levay OS opera no espaço de **sistemas internos de gestão de alto desempenho**. As referências validadas pelo Erick (Taskly, Crextio, Intelly) compartilham um DNA específico que adotamos como norte:

| Princípio | Como se aplica |
|-----------|----------------|
| **Luz como modo primário** | Light mode é o padrão; dark mode é complementar, não o centro |
| **Amarelo como energia** | Accent warm yellow (#FBBF24) — transmite ação, foco, produtividade |
| **Alta densidade sem ruído** | Mais informação por tela, hierarquia visual forte como filtro |
| **Sidebar esquerda** | Navegação contextual e persistente, não interrupcional |
| **Cards como átomo** | Cards com progresso, avatares e status são a unidade visual base |
| **Calendário como âncora** | Widget de calendário presente como companion em features operacionais |

---

## 🏗️ 1. Arquitetura de Design (Semântica)

O sistema é construído sobre tokens semânticos agnósticos ao tema. Não usamos cores fixas no código.

### 🎨 1.1 Core Tokens (CSS Variables)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#FFFEF7` (branco quente) | `#020617` (Slate 950) |
| `--foreground` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) |
| `--card` | `#FFFFFF` | `#0F172A` (Slate 900) |
| `--border` | `#E8E4D9` (borda quente) | `rgba(255,255,255,0.08)` |
| `--muted` | `#78716C` (Stone 500) | `#94A3B8` (Slate 400) |
| `--accent` | `#FBBF24` (Amber 400) | `#F59E0B` (Amber 500) |
| `--accent-foreground` | `#1C1917` (Stone 900) | `#1C1917` |
| `--accent-hover` | `#F59E0B` (Amber 500) | `#D97706` (Amber 600) |
| `--surface-warm` | `#FFFBEB` (Amber 50) | `#1C1917` (Stone 900) |
| `--destructive` | `#EF4444` | `#F87171` |
| `--success` | `#10B981` | `#34D399` |
| `--warning` | `#F97316` | `#FB923C` |

### 🛠️ 1.2 Tokens de Status de Tarefa

| Token | Cor | Uso |
|-------|-----|-----|
| `--status-em_andamento` | `#10B981` (Emerald) | Em execução |
| `--status-aguardando` | `#F59E0B` (Amber) | Aguardando input |
| `--status-standby` | `#6366F1` (Indigo) | Pausado |
| `--status-fechar_ciclo` | `#8B5CF6` (Violet) | Para fechar |
| `--status-a_fazer` | `#64748B` (Slate) | Backlog |

### 🛠️ 1.3 Classes Utilitárias

| Classe | Efeito | Uso |
|--------|--------|-----|
| `.glass-card` | Background semi-transparente + Blur | Cards, Sidebars, Modais |
| `.warm-card` | Background `surface-warm` com borda quente | Cards de destaque em light mode |
| `.accent-pill` | Pill amarelo com texto escuro | CTA primário, badges de acento |
| `.animate-fade-in` | Fade suave + Slide Up 0.5s | Entrada de páginas e elementos |
| `.shadow-accent` | Sombra na cor de acento | Botões primários e cards ativos |

---

## 📐 2. Layout & Navegação

### 2.1 Estrutura de Layout

O layout principal usa **sidebar esquerda** + **main content**, não header horizontal.

```
┌──────────┬────────────────────────────────────┐
│          │  [Breadcrumb / Page Header]         │
│ Sidebar  │                                     │
│  240px   │  Main Content Area                  │
│ (64px    │                                     │
│collapsed)│                                     │
└──────────┴────────────────────────────────────┘
```

**Sidebar:**
- Largura expandida: `240px`
- Largura colapsada: `64px` (apenas ícones)
- Background: `bg-card` com `border-r border-border`
- Logo no topo, workspace selector no rodapé
- Nav items: ícone + label, active state com accent pill

**Main Content:**
- Padding: `p-6 lg:p-8`
- Max width: `max-w-7xl mx-auto` (nas pages de cockpit)
- Sem max-width em pages de detalhe full-width (Colaboradores, CRM)

### 2.2 Padrões de Layout por Feature

| Feature | Padrão | Referência |
|---------|--------|-----------|
| **Mesa** | Grid 3 colunas + mini calendar | Taskly #1 |
| **Tarefas** | Lista + mini calendar lateral | Taskly #2 |
| **Colaboradores** | Lista esquerda + calendário central + perfil direito | Crextio Salary |
| **Executivo** | Hero metric + KPI strip + tabela densa | Intelly Billing |
| **Projetos** | Grid de cards com progress bars | Taskly #2 dashboard |
| **CRM** | Lista/kanban + painel de detalhe | Intelly Schedule |

---

## 📐 3. Anatomia de Componentes

### 3.1 Corner Radius (The Pill Rule)
- **Botões e Badges:** `rounded-full`
- **Cards e Blocos principais:** `rounded-2xl` (16px)
- **Inputs e Modais internos:** `rounded-xl` (12px)
- **Progress bars:** `rounded-full`
- **Sidebar items ativos:** `rounded-xl`

### 3.2 Hierarquia Tipográfica (Inter)
- **Títulos de Página:** `2xl–3xl`, `font-bold`, `tracking-tight`
- **Hero Metric:** `4xl–5xl`, `font-bold`, numeral puro
- **Títulos de Card/Bloco:** `sm`, `font-semibold`
- **Labels e Pill Labels:** `[10px]–[11px]`, `font-black`, `uppercase`, `tracking-[0.15em]`
- **Texto de dado:** `sm`, `font-medium`
- **Texto de apoio/subtítulo:** `xs`, `text-muted`, `font-medium`

### 3.3 Cards de Tarefa/Projeto (Atomic Unit)

Cada card deve ter:
```
[dot empresa] [título] [...] [status badge]
              [próximo passo / milestone]
[avatares]    [progress bar ████░░ 60%]
```

### 3.4 Progress Bar
- Altura: `4px`
- Track: `bg-border`
- Fill: `bg-accent` (amarelo)
- Arredondamento: `rounded-full`
- Sempre acompanhada de valor percentual `text-[11px] font-bold text-accent`

### 3.5 Avatar Cluster
- Avatares empilhados com `ring-2 ring-card` e `ml-[-8px]`
- Máximo 4 visíveis + contador `+N` no mesmo estilo
- Tamanho: `w-6 h-6` (small) ou `w-8 h-8` (medium)

### 3.6 Hero Metric
- Número grande centralizado ou à esquerda
- Unidade monetária menor ao lado: `text-muted text-sm`
- Subtext de contexto: `text-xs text-muted uppercase tracking-wider`
- Presente em: Executivo, detalhes de Colaborador, CRM

### 3.7 Mini Calendar Widget
- Companion de views operacionais (Mesa, Tarefas, Colaboradores)
- Mês compacto com grid de dias
- Dia atual: `bg-accent text-accent-foreground rounded-full`
- Dias com eventos: ponto amarelo abaixo do número
- Localizado no painel direito ou como card no grid

---

## ✨ 4. Efeitos de Profundidade

### 4.1 Light Mode (primário)
- Background quente: `#FFFEF7` — não branco puro, não slate frio
- Cards com sombra sutil: `shadow-sm` ou `shadow-md`
- Gradient de fundo no header do Sidebar: amarelo muito suave 5%
- Accent cards (KPI ativos): `bg-amber-50 border-amber-200`

### 4.2 Dark Mode OLED (complementar)
- Aurora Indigo/Violet: radial gradients 5% nas extremidades (mantido)
- Cards: `bg-slate-900` com borda `rgba(255,255,255,0.08)`
- Accent pills: amarelo com `text-stone-900` (mantém contraste)

### 4.3 Accent Cards (destaque)
Cards de KPI ativo ou item selecionado na sidebar usam:
- Background: `bg-accent` (amarelo)
- Texto: `text-accent-foreground` (preto quente `#1C1917`)
- Sem sombra escura, apenas `shadow-amber-200/50`

---

## 🖱️ 5. Guia de Interação

1. **Hover em cards:** `hover:bg-foreground/[0.03]` + `hover:shadow-md` — transição 200ms
2. **Active/Press:** `active:scale-[0.98]` — feedback tátil imediato
3. **Sidebar item hover:** `hover:bg-accent/10` + `text-accent`
4. **Sidebar item ativo:** `bg-accent` + `text-accent-foreground` (pill amarelo)
5. **Progress bar:** animar width de 0 para valor real em 600ms no mount
6. **Transições:** `duration-200` a `300ms` com `ease-out`
7. **Entrada de página:** `animate-fade-in` (fade + slide up 10px)

---

## 🗂️ 6. Vocabulário de Componentes por Feature

### Mesa (Cockpit do Diretor)
- 6 blocos no grid `grid-cols-3`
- Mini calendar no painel lateral direito
- KPI strip de 4 métricas no topo
- QuickCapture como FAB ou barra fixa no topo do main

### Tarefas
- Lista principal com filtros (tab: Recentes | Hoje | Próximas | Futuras)
- Card de tarefa com: empresa dot, título, assignee avatar, progress, status badge
- Painel direito: mini calendar + próximo evento

### Colaboradores
- Painel esquerdo: lista com avatar + nome + cargo + progress bar de carga
- Painel central: calendário mensal com eventos mapeados
- Painel direito: perfil completo com documentos, estatísticas, dados básicos

### Executivo
- Hero metric principal (ex: `R$ 23.4k receita mês`)
- 3 KPI cards abaixo (received, pending, overdue)
- Tabela densa com filtros por empresa/tipo
- Gráfico de tendência na lateral

### CRM Sollu
- Pipeline como colunas kanban ou lista agrupada por stage
- Card de lead: empresa, valor, responsável, próxima ação, dias no stage
- Detalhe lateral com histórico de interações

---

## 📝 7. Checklist de Implementação

Ao criar ou atualizar um componente:
- [ ] Usa variáveis semânticas (`text-foreground`, `bg-card`, `bg-accent`)?
- [ ] Accent é amarelo, não índigo, para ações primárias?
- [ ] Segue a regra de arredondamento da seção 3.1?
- [ ] Card de tarefa/projeto tem dot de empresa + progress bar + avatar cluster?
- [ ] Sidebar item ativo usa pill amarelo `bg-accent text-accent-foreground`?
- [ ] Light mode é o estado primário e visualmente prioritário?
- [ ] Micro-interações de hover e active estão presentes?
- [ ] Typography usa hierarquia da seção 3.2?

---

## 🔄 8. Roadmap de Migração

| Fase | O que muda | Arquivos | Status |
|------|-----------|---------|--------|
| **1 — Cor** | Accent Indigo → Amber, Background → quente | `globals.css` + 4 hardcoded fixes | ✅ Concluído |
| **2 — Nav** | Header horizontal → Sidebar esquerda colapsável | `layout.tsx` + novo `Sidebar.tsx` | ✅ Concluído |
| **3 — Átomos** | StatsCard + TaskCard com anatomia premium | `ui/stats-card.tsx`, `cards/TaskCard.tsx` | ✅ Concluído |
| **4 — Widgets** | MiniCalendar + HeroMetric + ProgressBar + AvatarCluster | Novos em `ui/` | 🔲 Próximo |
| **5 — Features** | Layouts por feature (Mesa, Tarefas, Colaboradores, Executivo, Projetos) | Pages individuais | 🔲 Pendente |

### Fase 4 — Especificação (Próximo Sprint)

**MiniCalendar** (`ui/MiniCalendar.tsx`)
- Grid de dias 7×N, mês compacto
- Dia atual: `bg-accent text-accent-foreground rounded-full`
- Dias com eventos: ponto `w-1 h-1 bg-accent rounded-full` abaixo do número
- Props: `selectedDate`, `events: { date: string }[]`, `onDateClick`

**HeroMetric** (`ui/HeroMetric.tsx`)
- Número `text-4xl font-bold tabular-nums tracking-tight`
- Unidade `text-muted text-sm` ao lado
- Label `text-xs text-muted uppercase tracking-wider` abaixo
- Tendência opcional: ChangeIcon + delta %

**ProgressBar** (`ui/ProgressBar.tsx`)
- `h-1`, track `bg-border rounded-full`, fill `bg-accent rounded-full`
- Width animado de 0 → valor em 600ms via Framer Motion `animate={{ width: value% }}`
- Props: `value: number` (0–100), `className?`

**AvatarCluster** (`ui/AvatarCluster.tsx`)
- Max 4 avatares visíveis + badge `+N` em mesmo estilo
- `ring-2 ring-card`, `ml-[-8px]` para stacking efeito
- Tamanhos: `sm` (w-6 h-6), `md` (w-8 h-8)

### Fase 5 — Feature Layouts

| Feature | Layout | Widgets Necessários |
|---------|--------|------------------------|
| Mesa | Grid 3-col + painel dir c/ MiniCalendar | MiniCalendar, ProgressBar, AvatarCluster |
| Tarefas | Lista principal + MiniCalendar à dir | MiniCalendar |
| Colaboradores | 3-panel: lista \| calendário \| perfil | MiniCalendar, HeroMetric, AvatarCluster |
| Executivo | HeroMetric + 3 KPI + tabela densa | HeroMetric, StatsCard |
| Projetos | Grid cards com progress | ProgressBar, AvatarCluster |

---

**Última Atualização:** Maio 2026
**Status:** v2.1 — Fases 1-3 implementadas; Fases 4-5 especificadas e prontas para execução
**Baseado em:** Referências Taskly · Crextio · Intelly · Nikitin (validadas pelo Erick)
