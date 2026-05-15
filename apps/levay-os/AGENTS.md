# AGENTS.md — LEVAY OS


## Gotchas conhecidos (2026-05-15)

> Identificados pela vistoria arquitetural (Aria). Corrija ao tocar estes arquivos.

| Arquivo | Problema | Severidade |
|---------|----------|-----------|
| `lib/tenant-context.ts:16,37,92` | `supabase: any` — deve ser `SupabaseServerClient` | ALTO |
| `lib/tenant-context.ts` | Falta `import 'server-only'` | ALTO |
| `lib/dashboard-metrics.ts` | Falta `import 'server-only'` + `getWorkspaceCompanies` duplicado de tenant-context | MÉDIO |
| `lib/agents/intelligence.ts` | Falta `import 'server-only'` + model id hard-coded desatualizado | ALTO |
| `app/actions/tasks.ts:38,76,96,118` | `return { error: error.message }` expõe erros internos do Postgres | ALTO |
| `next.config.ts` | Vazio — falta headers de segurança e optimizePackageImports | ALTO |
| `vercel.json` | Sem HSTS, CSP, X-Frame-Options | ALTO |

## Dead code — NÃO importar, NÃO referenciar

- `src/components/AppNav.tsx` — substituído por Sidebar.tsx
- `src/lib/actions/tasks.ts` — duplicata de `src/app/actions/tasks.ts`
- `src/app/api/executive/route.ts` — endpoint quebrado (filtros JS vs UUID)
- `src/app/(app)/configuracoes/page.tsx` — salva API keys no localStorage (vulnerabilidade)

## Stack obrigatório
- Next.js 16 App Router (nunca Pages Router)
- React 19 Server Components por padrão — `'use client'` só quando necessário
- TypeScript estrito — sem `any`, sem `as unknown as X`
- Tailwind v4 — classes utilitárias, sem CSS modules
- Supabase SSR (`@supabase/ssr`) — nunca `supabase-js` direto no Server Component
- Server Actions para todas as mutações — nunca API routes para CRUD

## Regras críticas Next.js 16
- `cookies()` e `headers()` são async — sempre `await cookies()`
- `params` em layouts/pages são Promise — sempre `const { id } = await params`
- Nunca usar `useRouter().push` em Server Components
- Nunca importar de `next/dist/` diretamente

## Supabase
- Client-side: `createBrowserClient()` de `@/lib/supabase/client`
- Server-side: `createServerClient()` de `@/lib/supabase/server`
- Middleware: `@/middleware.ts` — renova sessão em toda request
- Nunca usar service role key no client-side
- Nunca bypassar RLS

## Vocabulário operacional (UI obrigatória)
- Status tarefa: a_fazer | em_andamento | aguardando | standby | fechando_ciclo | cancelado
- Rótulos: "Pede atenção" (não "Atrasado"), "Fechar ciclo" (não "Concluído"), "Em movimento" (não "Pendente")
- Modalidade projeto: continuo ♾️ | pontual 🎯
- `minimum_movement` obrigatório em toda task — bloquear save sem ele

## Design
- Minimalista high-level — sem gradientes excessivos
- Cores empresa: Sollu #2563EB | Bica #7C3AED | AMP #EA580C
- Cockpit na Mesa do Diretor — não lista CRUD

## Layout Shell (pós Sprint 1 — Sidebar)

O layout usa **Sidebar esquerda colapsável** + coluna principal. **AppNav.tsx é dead code — não importar.**

```
src/app/(app)/layout.tsx   → Server Component, importa Sidebar
src/components/Sidebar.tsx → Client Component, usa useUI() do Zustand
```

```tsx
// layout.tsx — estrutura atual
<div className="flex h-screen overflow-hidden bg-background">
  <Sidebar />
  <div className="flex flex-col flex-1 overflow-hidden">
    <header className="h-14 border-b border-border flex items-center justify-end px-6 bg-card/80 backdrop-blur-md shrink-0 z-30">
      <NewTaskButton companies={companies ?? []} />
    </header>
    <main className="flex-1 overflow-y-auto">{children}</main>
  </div>
</div>
```

**Sidebar:** 240px expandida / 64px colapsada, estado em `useUI()` de `@/hooks/use-app-store`.

## Componentes UX/UI

### Árvore Atual
```
src/components/
├── Sidebar.tsx              # Sidebar colapsável com 5 grupos de nav
├── WorkspaceSwitcher.tsx    # Seletor de workspace (no rodapé da Sidebar)
├── NewTaskButton.tsx        # FAB no header slim
├── icons/index.ts
├── dialogs/TaskDialog.tsx
├── cards/TaskCard.tsx       # Card com status pill, stripe amber, minimum_movement
├── skeletons/index.tsx
├── filters/FilterBar.tsx
├── overlays/
│   ├── CommandPalette.tsx   # ⌘K, renderizado dentro da Sidebar (modo expandido)
│   └── HoverCard.tsx
├── ui/
│   ├── stats-card.tsx       # KPI card — icon + delta pill + hero metric 3xl
│   ├── SmartList.tsx
│   ├── EmptyState.tsx
│   └── leads-data-table.tsx
└── tasks/TaskListClient.tsx
```

**Fase 4 — Widgets a criar em `src/components/ui/`:**
- `MiniCalendar.tsx` — grid mensal compacto, dia atual `bg-accent rounded-full`
- `HeroMetric.tsx` — número `text-4xl font-bold tabular-nums` + unidade + label
- `ProgressBar.tsx` — `h-1`, fill `bg-accent`, animado 600ms Framer Motion
- `AvatarCluster.tsx` — máximo 4 + `+N`, ring `ring-2 ring-card`, stacking `-ml-2`

### Anatomia dos Componentes Chave

#### TaskCard (`cards/TaskCard.tsx`)
```tsx
<TaskCard
  task={task}           // { id, title, minimum_movement?, company_id?, due_at?, priority?, status? }
  company={company}     // { id, name, color }
  onClick={handleClick}
  onEdit={handleEdit}
  compact={false}       // compact=true: sem minimum_movement, priority, edit action
/>
```
Status labels: `em_andamento→"Em movimento"`, `a_fazer→"A fazer"`, `aguardando→"Aguardando"`, `standby→"Standby"`, `fechar_ciclo→"Fechar ciclo"`, `ciclo_fechado→"Fechado"`.
Stripe amber 3px à esquerda para `em_andamento`.

#### StatsCard (`ui/stats-card.tsx`)
```tsx
<StatsCard
  title="Receita"
  value="R$ 23.4k"
  icon={<TrendingUp />}
  change="+12%"
  changeType="up"        // 'up' | 'down' | 'neutral'
  tenantColor="#2563EB"  // opcional
  index={0}              // stagger de animação
/>
```

### Regras de Design (SSoT completa: `design.md`)
- Accent é **amarelo** `#FBBF24` — nunca índigo para ações primárias
- Sem cores hardcoded — sempre variáveis semânticas (`bg-accent`, `text-muted`, `border-border`)
- Corner radius: botões/badges `rounded-full`, cards `rounded-2xl`, inputs `rounded-xl`
- Hover em cards: `hover:bg-foreground/[0.02]` + `hover:shadow-md`
- Sem `glass-card` class — usar `bg-card border border-border`
- Light mode é primário; dark mode complementar

### Animações (Framer Motion)
```tsx
// Entrada de lista com stagger
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
```

### Atalhos de Teclado
- `⌘+K` / `Ctrl+K` — Command Palette
- `↑/↓` — Navegar na palette
- `Enter` — Selecionar
- `Esc` — Fechar modais/palette

## Server Actions (CRUD)

As Server Actions estão em `src/app/actions/` para mutações de dados:

```bash
src/app/actions/
├── index.ts      # Exports centralizados
├── tasks.ts      # createTask, updateTask, deleteTask, updateTaskStatus
├── projects.ts   # createProject, updateProject, deleteProject
└── companies.ts  # createCompany, updateCompany, deleteCompany
```

### Como usar
```tsx
import { createTask } from '@/app/actions'
import { useTransition } from 'react'

function MyComponent() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTask(formData)
    })
  }

  return <form action={handleSubmit}>...</form>
```

## State Management (Zustand)

O Levay OS usa Zustand para estado global com persistência local.

### Estrutura
```
src/
├── stores/
│   └── app-store.ts     # Store global com cache + UI state
└── hooks/
    ├── use-app-store.ts   # Hooks para UI e cache
    └── use-data-sync.ts   # Sync automático de dados
```

### Store (app-store.ts)
```typescript
import { useAppStore } from '@/stores/app-store'

// UI State
const { sidebarCollapsed, toggleSidebar } = useUI()

// Cache de dados
const { cachedTasks, setCachedTasks, isCacheValid } = useTasksCache()
```

### Hooks disponíveis
- `useCurrentWorkspace()` - Workspace/tenant atual
- `useUI()` - Estado da UI (sidebar, modals, palette)
- `useTasksCache()` - Cache de tarefas
- `useProjectsCache()` - Cache de projetos
- `useCompaniesCache()` - Cache de empresas
- `useForceRefresh()` - Forçar refresh completo

### Sync automático (use-data-sync.ts)
```typescript
import { useSyncTasks } from '@/hooks/use-data-sync'

//自动 cache + refetch após 5 minutos
const { tasks, isLoading, refresh } = useSyncTasks(workspaceId)
```

### Cache Duration
- 5 minutos por padrão
- Persistência local (localStorage)
- Selective state persistido (workspace, sidebar)

## Proibições
- Sem comentários óbvios
- Sem `useEffect` para dados — Server Components + Server Actions
- Sem Material UI / Chakra / Ant Design
- Sem `any` TypeScript
- Sem emojis como ícones — usar Lucide React
- Sem effects que chamam setState sincronamente — usar useCallback/event handlers
