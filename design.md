# Design System — Levay OS (Technical Spec)

Este documento é a **Single Source of Truth** (Fonte Única da Verdade) para o design e a implementação do Levay OS. Ele reflete a industrialização do sistema utilizando **Tailwind CSS v4**, **Variáveis Semânticas** e a estética **Soft UI Evolution**.

---

## 🏗️ 1. Arquitetura de Design (Semântica)

O sistema foi construído sobre uma arquitetura de temas agnóstica. Não utilizamos cores fixas no código, mas sim **Tokens Semânticos**.

### 🎨 1.1 Core Tokens (CSS Variables)

Estes tokens são definidos no `globals.css` e reagem automaticamente ao tema (Light/Dark).

| Token | Descrição | Valor (Light) | Valor (Dark/OLED) |
|-------|-----------|---------------|-------------------|
| `--background` | Fundo principal da página | `Slate 50` | `Slate 950` |
| `--foreground` | Cor principal do texto | `Slate 900` | `Slate 50` |
| `--card` | Fundo de cards e superfícies | `White` | `Slate 900` |
| `--border` | Bordas e divisores sutis | `Slate 200` | `White (5% Opacity)` |
| `--muted` | Texto de apoio e estados inativos | `Slate 500` | `Slate 400` |
| `--accent` | Cor de destaque e ações (Brand) | `Indigo 600` | `Indigo 500` |

### 🛠️ 1.2 Classes Utilitárias Customizadas

| Classe | Efeito | Uso Recomendado |
|--------|--------|-----------------|
| `.glass-card` | Background semi-transparente + Blur | Cards de dashboard, Sidebars, Modais |
| `.animate-fade-in` | Fade suave + Slide Up (0.5s) | Entrada de páginas e novos elementos |
| `.shadow-accent` | Sombra projetada na cor da marca | Botões primários e cards ativos |

---

## 📐 2. Anatomia de Componentes (Densidade Visual)

Para manter o aspecto **Premium & Densa**, seguimos regras rígidas de geometria.

### 🔵 2.1 Corner Radius (The Pill Rule)
- **Botões e Badges:** Sempre `rounded-full` (Pill Shape).
- **Cards e Blocos:** Sempre `rounded-[2rem]` (32px).
- **Inputs e Modais Internos:** Sempre `rounded-2xl` (16px).

### 🖋️ 2.2 Hierarquia Tipográfica (Inter)
- **Títulos de Página:** `3xl`, `font-bold`, `tracking-tight`.
- **Títulos de Card:** `sm`, `font-bold`.
- **Labels (Pill Labels):** `[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`.
- **Valores/Dados:** `lg`, `font-bold`, `leading-snug`.

---

## ✨ 3. Efeitos de Profundidade & Aurora

O Levay OS utiliza o conceito de **Z-Index Visual** através de luz, não apenas sombras.

### 🌌 3.1 Dark Mode "Aurora"
No Dark Mode, o background recebe um **Mesh Gradient** sutil nas extremidades (Radial Gradients de Indigo/Violet a 5% de opacidade). Isso quebra o preto absoluto e traz profundidade de "software de elite".

### 💡 3.2 Glow Borders
Em vez de sombras pretas, usamos bordas de luz no Dark Mode:
```css
border: 1px solid rgba(255, 255, 255, 0.05);
```

---

## 🖱️ 4. Guia de Interação (Micro-animações)

Interfaces modernas devem ser **Vivas e Responsivas**.

1.  **Hover State:** Cards devem ter `hover:bg-foreground/[0.03]` e `hover:shadow-2xl`.
2.  **Active State:** Elementos clicáveis devem usar `active:scale-[0.98]` para feedback tátil.
3.  **Transições:** Todas as mudanças de cor e background devem durar `300ms` com a curva `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 📝 5. Checklist de Implementação para IAs/Devs

Ao criar um novo componente, verifique:
- [ ] Está usando variáveis semânticas (`text-foreground`, `bg-card`)?
- [ ] Segue a regra de arredondamento (`rounded-full` ou `rounded-[2rem]`)?
- [ ] O padding é generoso (mínimo `p-5`)?
- [ ] Possui micro-interação de `hover` e `active`?
- [ ] A hierarquia tipográfica usa `uppercase + tracking` para labels pequenos?

---

**Última Atualização:** Maio 2026
**Status:** Industrializado (v1.0)
