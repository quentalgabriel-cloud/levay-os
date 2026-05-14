# Componentes Levay OS - Índice

## Pages Client Wrappers
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `TaskListClient` | `components/tasks/TaskListClient.tsx` | Lista de tarefas com filtros + busca |
| `ProjectListClient` | `components/projects/ProjectListClient.tsx` | Lista de projetos com filtros + busca |
| `CompanyListClient` | `components/companies/CompanyListClient.tsx` | Grid de empresas com stats |

## Navegação
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `AppNav` | `components/AppNav.tsx` | Navbar com ícones Lucide + CommandPalette |
| `WorkspaceSwitcher` | `components/WorkspaceSwitcher.tsx` | Troca de tenant/workspace |

## Dialogs & Modais
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `TaskDialog` | `components/dialogs/TaskDialog.tsx` | Modal de criar/editar tarefas com validação |
| `CommandPalette` | `components/overlays/CommandPalette.tsx` | ⌘K menu de navegação rápida |

## Cards & Listas
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `TaskCard` | `components/cards/TaskCard.tsx` | Card de tarefa com motion, hover states |
| `TaskListClient` | `components/tasks/TaskListClient.tsx` | Lista client com filtros e busca |
| `SmartList` | `components/ui/SmartList.tsx` | Lista "batteries included" (loading/empty/error/success) |

## Filters & Search
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `FilterBar` | `components/filters/FilterBar.tsx` | Busca + filtros por status |

## Feedback & Estados
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `EmptyState` | `components/ui/EmptyState.tsx` | Estados vazios/sucesso/erro |
| `Toast` | `components/toast/Toast.tsx` | Notificações via contexto React |
| `ListSkeleton` | `components/skeletons/index.tsx` | Skeleton loading states |

## Overlays
| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `HoverCard` | `components/overlays/HoverCard.tsx` | Tooltip, ContextMenu, InfoTip |
| `PageTransition` | `components/layout/PageTransition.tsx` | Animações de entrada de página |

## Ícones
| Recurso | Caminho | Descrição |
|---------|---------|-----------|
| `icons/index.ts` | `components/icons/index.ts` | Biblioteca Lucide React exportada |

## State Management (Zustand)

| Recurso | Caminho | Descrição |
|---------|---------|-----------|
| `app-store` | `stores/app-store.ts` | Store global com persistência |
| `use-app-store` | `hooks/use-app-store.ts` | Hooks para UI e cache |
| `use-data-sync` | `hooks/use-data-sync.ts` | Sync de dados com cache |

### Como usar o store

```tsx
import { useAppStore } from '@/stores/app-store'

// No componente
const { sidebarCollapsed, toggleSidebar } = useUI()

// Cache de dados
const { cachedTasks, setCachedTasks, isCacheValid } = useTasksCache()
```

### Sync de dados
```tsx
import { useSyncTasks } from '@/hooks/use-data-sync'

//自动缓存 + refetch quando expirado
const { tasks, isLoading, refresh } = useSyncTasks(workspaceId)
```

---

## Quick Reference

### Criar nova tarefa
```tsx
// 1. No Server Component (page.tsx)
import { TaskDialog } from '@/components/dialogs/TaskDialog'
import { useState } from 'react'

export default function Page() {
  const [open, setOpen] = useState(false)
  return <TaskDialog isOpen={open} onClose={() => setOpen(false)} onSubmit={submit} companies={companies} mode="create" />
}
```

### Usar Command Palette
```tsx
import { CommandPalette } from '@/components/overlays/CommandPalette'
import { useRouter } from 'next/navigation'

const items = [
  { id: 'goto', title: 'Ir para...', icon: ArrowRight, action: () => router.push('/tarefas'), category: 'navigation' }
]
<CommandPalette items={items} />
```

### SmartList completo
```tsx
<SmartList
  data={items}
  loading={loading}
  error={error}
  emptyType="tasks"
  renderItem={(item) => <Card data={item} />}
  keyExtractor={(item) => item.id}
  onRefresh={refresh}
  onCreateNew={create}
/>
```

### Filtrar com FilterBar
```tsx
<FilterBar
  onSearch={setQuery}
  onFilterChange={setActiveFilters}
  filters={[
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'aguardando', label: 'Aguardando' }
  ]}
/>
```

---

## Dependencies
- `lucide-react` - Ícones
- `framer-motion` - Animações

## Design Tokens
Ver `src/app/globals.css` para tokens de cor, status e prioridade.