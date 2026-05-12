# Levay OS - Premium Design Guidelines

## 1. Brand Foundation

### Positioning

Levay OS deve comunicar controle executivo, exclusividade e precisao operacional.
A interface nao deve parecer "painel generico SaaS".

### Design Principles

1. Premium clarity: cada tela prioriza decisao e acao, sem ruido visual.
2. Hierarquia forte: metricas criticas primeiro, detalhes por progressive disclosure.
3. Role-first UX: visao muda por perfil (CEO, Comercial, Operacoes).
4. Tenant personality: cada tenant tem assinatura visual sutil sem quebrar consistencia da holding.
5. Human gate over AI output: fluxos de aprovacao precisam destaque e confianca visual.

## 2. Visual Language

### Core Aesthetic

- Base escura sofisticada (charcoal/graphite) para reforcar premium e foco.
- Superficies com contraste controlado e tipografia de alta legibilidade.
- Accent metalico (champagne gold) para elementos estrategicos e estados de destaque.
- Sem gradientes chamativos em areas de trabalho criticas.

### Typography Direction

- Display/Heading: `Manrope` (semibold/bold)
- Body/UI: `Inter` (regular/medium)
- Numeric/Operational data: `JetBrains Mono`

### Density and Rhythm

- Grid base: 12 colunas desktop, 4 colunas mobile.
- Spacing system: escala 4px.
- Cards com respiracao ampla (padding minimo 16px, ideal 20-24px).

## 3. Role-based Structure

### CEO View (Macro)

- Hero KPI strip no topo (receita, conversao, risco operacional, SLA).
- Blocos de comparacao cross-tenant.
- Alertas criticos com severidade e impacto financeiro estimado.

### Comercial View (Funnel)

- Pipeline dominante em largura total.
- Lista lateral de follow-up pendente (D+0 / D+1 / D+3).
- Estado de prioridade por lead com codificacao visual simples.

### Operacoes View (Execution)

- Fila de excecoes + status de workers em tempo real.
- Quality Gates pendentes no topo da coluna principal.
- Timeline de eventos auditaveis por tenant.

## 4. Tenant Visual Signatures

- Holding (default): Champagne Gold (`--color-brand-primary`)
- Sollu: Emerald (`--color-tenant-sollu`)
- AMP 213: Amber/Coral (`--color-tenant-amp213`)
- Bica Bar: Copper (`--color-tenant-bica`)

Regra: tenant color aparece em badges, highlights e graficos; nunca domina backgrounds estruturais.

## 5. Interaction and Motion

- Transicoes curtas (160ms-240ms) com easing suave.
- Animacoes apenas para:
  - entrada de cards/dados,
  - mudanca de estado de automacao,
  - confirmacao de aprovacao em Quality Gate.
- Evitar animacao decorativa sem funcao operacional.

## 6. Accessibility Baseline

- Meta minima: WCAG AA.
- Contraste minimo: 4.5:1 para texto normal.
- Estados de foco visiveis e consistentes.
- Nao depender apenas de cor para status (usar icone + label).

## 7. Component Direction

### Core components

- KPI Card (macro e tenant)
- Pipeline Column + Lead Card
- Automation Run Row
- Quality Gate Approval Card
- Timeline Event Row
- Reservation Table Matrix

### Component behavior rules

- Todo componente de decisao deve expor: estado, impacto e proxima acao.
- Estados obrigatorios: default, loading, empty, error, blocked.
- Feedback de acao critica sempre com confirmacao explicita.

## 8. Implementation Notes

- Fonte unica de cor: `tokens/tokens.yaml`.
- Nao hardcodar hex/oklch em componentes.
- Tema por tenant aplicado por classe de contexto (`data-tenant`).
- Estrutura visual deve manter consistencia entre desktop e mobile.

## 9. Visual Structure Blueprint

### App Shell

- Top bar: tenant switch, global search, alerts, profile.
- Left nav: modulo por contexto (CRM, Reservas, Financeiro, Automacoes, Analytics).
- Main area: blocos priorizados por perfil.
- Right rail (contextual): tarefas pendentes e acoes rapidas.

### Layout hierarchy

1. Strategic layer: KPIs e alertas criticos.
2. Operational layer: filas, funis e calendarios.
3. Detail layer: tabelas, historicos, auditoria.

### Responsive behavior

- Desktop: 3 zonas (nav + main + rail)
- Tablet: rail colapsa em drawer
- Mobile: navegacao inferior por modulos + cards empilhados
