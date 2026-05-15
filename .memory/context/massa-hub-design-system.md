---
title: Massa Hub — Design System SLC
type: context
created: 2026-05-12
updated: 2026-05-12
tags: [design-system, dark-mode, glassmorphism, SLC, creator-economy]
confidence: low
source: aidplug-massa-hub
---

# Massa Hub — Design System SLC

## SLC Manifesto

**Princípio**: Todo delivery é **Simple, Lovable, Complete** — nunca Minimum Viable Product.

**Teste**: "Se eu mostro isso para um fotógrafo criativo de Recife — ele diz 'wow' ou 'hm, interesting'?"

**Insight**: Profissionais criativos têm olhos treinados. Produto feio ou incompleto os repele imediatamente.

## Dark-First Design System

### Philosophy
"Dark Canvas, Vibrant Energy" — background escuro (#07070f) com cores vibrantes por categoria.

### Color by Category

| Categoria | Gradiente |
|-----------|-----------|
| Fotografia | Blue → Purple (#0135f3 → #7b2fff) |
| Vídeo | Purple → Red (#7b2fff → #e8005a) |
| Design | Pink → Purple (#e8005a → #7b2fff) |
| Estratégia | Yellow → Orange (#f7ab1c → #ff6b35) |
| Conteúdo | Green → Teal (#00c47c → #00b4d8) |
| Jurídico | Gray → Blue (#667085 → #0047ab) |
| Áudio | Orange → Red (#ff6b35 → #e8005a) |
| Assessoria | Purple → Blue (#7b2fff → #0135f3) |

### Typography

| Uso | Font |
|-----|------|
| Display | Bricolage Grotesque |
| Body | Manrope |
| Numeric | JetBrains Mono |

### Corner Radius

- Cards: 24px (rounded-3xl)
- Buttons: 12px (rounded-xl)
- Inputs: 8px (rounded-lg)

### Glassmorphism Effects

```css
/* Background blur + subtle border */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Gradient Overlays

Gradients applied diagonally, overlaying dark background for depth.

## Oportunidade para Levay OS

1. **Adotar SLC test**: Antes de ship, testar com usuário real
2. **Dark mode premium**: Levay OS tem tema claro, poderia ter dark option
3. **Category gradients**: Similar ao tenant color mapping do Levay OS
4. **Glassmorphism**: Implementar em modais e cards sobre background

## Cross-references

- `[[design-system]]` — Levay OS primary design system (our target)

## Links

[[design-system]], [[stack-tecnologico]], [[tres-empresas-dominio]]
