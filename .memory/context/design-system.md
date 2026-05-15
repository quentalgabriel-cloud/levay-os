---
title: Design System — Tokens e Brand
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [design, UI, tokens, brand, colors, typography]
confidence: medium
gaps: [dark-mode, component-storybook, design-tokens-export]
---

# Design System — Tokens e Brand

## Arquivos

- `design.md` — Design principal
- `tokens/tokens.yaml` — Tokens core
- `docs/design/levay-premium-design-guidelines.md` — Guidelines

## Brand Colors por Tenant

| Tenant | Cor Primária | Hex |
|--------|-------------|-----|
| Sollu | Blue | `#2563EB` |
| Bica Bar | Purple | `#7C3AED` |
| AMP 213 | Orange | `#EA580C` |
| Global | Champagne Gold | `--color-brand-primary` |

## Core Tokens

```
brand-champagne (primary)
tenant-sollu-blue
tenant-bica-purple
tenant-amp-orange
neutral-0 → neutral-950 (grayscale)
semantic-*
```

## Typography

| Uso | Font | Weight |
|-----|------|--------|
| Display/Heading | Manrope | semibold/bold |
| Body/UI | Inter | regular/medium |
| Numeric/Operational | JetBrains Mono | regular |

## Corner Radius Rules

| Elemento | Radius |
|----------|--------|
| Buttons/Badges | `rounded-full` (Pill) |
| Cards | `rounded-[2rem]` (32px) |
| Inputs/Modals | `rounded-2xl` (16px) |

## Micro-animations

```css
/* Hover */
hover:bg-foreground/[0.03]
hover:shadow-2xl

/* Active */
active:scale-[0.98]

/* Transition */
transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Design Principles

1. **Premium clarity**: Cada tela prioriza decisão e ação
2. **Strong hierarchy**: Métricas críticas primeiro, detalhes por progressive disclosure
3. **Role-first UX**: Vista muda por papel (CEO, Comercial, Operações)
4. **Tenant personality**: Assinatura visual sutil por tenant
5. **Human gate**: Flows de aprovação com prominence visual

## Component Tokens

```
card
pipeline-lead
quality-gate-card
cockpit-block
task-card
```

## Cross-references

- `[[massa-hub-design-system]]` — SLC dark-first design inspiration

## Links

[[stack-tecnologico]], [[tres-empresas-dominio]], [[vocabulary-labels]]
