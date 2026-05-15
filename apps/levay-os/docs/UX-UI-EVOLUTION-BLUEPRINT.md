# Levay OS - UX/UI Evolution Blueprint

## Visão Geral

Este documento mapeia as soluções de UX/UI para elevar o Levay OS de um sistema funcional para uma experiência operacional premium.

---

## 1. Sistema de Ícones

### Problema Atual
- Uso de emojis como ícones (contra regras de UX)
- Inconsistência visual
- Sem acessibilidade

### Solução: Lucide React
```bash
npm install lucide-react
```

### Implementação
```tsx
// src/components/icons/index.ts
import { 
  LayoutGrid,      // Mesa
  CheckSquare,    // Tarefas
  FolderKanban,   // Projetos
  Scale,          // Decisões
  Building2,      // Empresas
  Users,          // Equipe
  TrendingUp,     // CEO/Executive
  Hexagon,        // Logo
  Plus,           // Novo
  ChevronRight,   // Expandir
  Calendar,       // Data
  AlertCircle,    // Atenção
  Clock,          // Tempo
  CheckCircle,    // Concluído
  Circle,         // Pendente
  ArrowRight,     // Movimento
  X,              // Fechar
  Search,         // Busca
  Filter,         // Filtro
  Settings,       // Config
  Bell,           // Notificação
  RefreshCw,      // Sincronizar
} from 'lucide-react'
```

---

## 2. Componentes de Dialog/Modal Inteligente

### Problema Atual
- Sem modais
- Formulários inline sem contexto
- Experiência fragmentada

### Solução: Dialog Compounds

### Componente: TaskDialog
```tsx
// src/components/dialogs/TaskDialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Building2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: TaskFormData) => Promise<void>
  initialData?: Partial<Task>
  mode: 'create' | 'edit'
}

export function TaskDialog({ isOpen, onClose, onSubmit, initialData, mode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    minimum_movement: initialData?.minimum_movement || '',
    company_id: initialData?.company_id || '',
    due_at: initialData?.due_at || '',
    priority: initialData?.priority || 'medium'
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold">
                  {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </header>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="O que precisa ser feito?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">
                    Próximo Movimento
                    <span className="text-accent ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">→</span>
                    <input
                      type="text"
                      value={formData.minimum_movement}
                      onChange={(e) => setFormData(p => ({ ...p, minimum_movement: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                      placeholder="Ação mínima para avancer"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Empresa</label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData(p => ({ ...p, company_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="">Selecionar...</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Prazo</label>
                    <input
                      type="date"
                      value={formData.due_at}
                      onChange={(e) => setFormData(p => ({ ...p, due_at: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl border border-border hover:bg-foreground/5 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Tarefa' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## 3. Skeleton Loading States

### Problema Atual
- Sem feedback visual durante carregamento
- Layout shift ao carregar dados
- Experiência "quebrada"

### Solução: Skeleton Components
```tsx
// src/components/skeletons/TaskCardSkeleton.tsx
export function TaskCardSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-5 bg-card/50 border border-border rounded-[2rem] animate-pulse">
      <div className="w-3 h-3 rounded-full bg-border mt-1.5" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-border rounded-lg w-3/4" />
        <div className="h-4 bg-border rounded-lg w-1/2" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-5 w-20 bg-border rounded-full" />
        <div className="h-4 w-16 bg-border rounded" />
      </div>
    </div>
  )
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-10 w-32 bg-border rounded-lg animate-pulse" />
        <div className="h-8 w-24 bg-border rounded-full animate-pulse" />
      </div>
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <div className="h-4 w-32 bg-border rounded animate-pulse" />
            <div className="h-5 w-8 bg-border rounded-full animate-pulse" />
          </div>
          <TaskListSkeleton count={3} />
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Compound Components - Task Card

### Problema Atual
- Cards sem estados sofisticados
- Sem ações contextuais
- Layout repetitivo

### Solução: TaskCard Compound
```tsx
// src/components/cards/TaskCard.tsx
import { CheckCircle, Circle, Clock, AlertTriangle, Building2, Calendar, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskCardProps {
  task: Task
  company?: Company
  onEdit?: (task: Task) => void
  onStatusChange?: (taskId: string, status: string) => void
  onClick?: (task: Task) => void
}

export function TaskCard({ task, company, onEdit, onStatusChange, onClick }: TaskCardProps) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date()
  
  const StatusIcon = {
    em_andamento: CheckCircle,
    a_fazer: Circle,
    aguardando: Clock,
    standby: Circle,
    fechar_ciclo: CheckCircle,
  }[task.status] || Circle

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group flex items-start gap-4 px-6 py-5 bg-card/50 hover:bg-foreground/[0.03] border border-border rounded-[2rem] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-black/5 active:scale-[0.99]"
      onClick={() => onClick?.(task)}
    >
      {/* Company Color Dot */}
      {company && (
        <span
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_12px] shadow-current"
          style={{ backgroundColor: company.color }}
        />
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
          {task.title}
        </p>
        {task.minimum_movement && (
          <p className="text-sm font-medium text-muted mt-1 italic flex items-center gap-1">
            <span className="text-accent">→</span>
            {task.minimum_movement}
          </p>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-warning bg-warning/10 px-2.5 py-1.5 rounded-full border border-warning/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Atenção
            </span>
          )}
          {company && (
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted bg-card px-2.5 py-1.5 rounded-full border border-border flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {company.name}
            </span>
          )}
        </div>
        {task.due_at && (
          <span className="text-[11px] font-black uppercase tracking-tighter text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(task.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
          </span>
        )}
      </div>
    </motion.div>
  )
}
```

---

## 5. Animações de Transição

### Instalação
```bash
npm install framer-motion
```

### Page Transitions
```tsx
// src/components/layout/PageTransition.tsx
'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
    >
      {children}
    </motion.div>
  )
}

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    }
  })
}
```

---

## 6. Interactive States - Hover Cards

```tsx
// src/components/cards/HoverCard.tsx
interface HoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function HoverCard({ children, content, side = 'top' }: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }
  
  return (
    <div className="relative inline-flex" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 ${positions[side]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-card border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## 7. Toast Notifications

```tsx
// src/components/toast/Toast.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'border-green-500/50 bg-green-500/10 text-green-500',
  error: 'border-red-500/50 bg-red-500/10 text-red-500',
  info: 'border-blue-500/50 bg-blue-500/10 text-blue-500',
  warning: 'border-orange-500/50 bg-orange-500/10 text-orange-500',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Exposed via useToast hook
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles[toast.type]} backdrop-blur-md`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
```

---

## 8. Design Tokens Expansion

```css
/* globals.css additions */
@theme inline {
  /* Status Colors */
  --color-status-em_andamento: #10B981;  /* Emerald 500 */
  --color-status-aguardando: #F59E0B;   /* Amber 500 */
  --color-status-standby: #6366F1;       /* Indigo 500 */
  --color-status-fechar_ciclo: #8B5CF6;   /* Violet 500 */
  --color-status-a_fazer: #64748B;       /* Slate 500 */
  
  /* Priority Colors */
  --color-priority-critical: #EF4444;
  --color-priority-high: #F97316;
  --color-priority-medium: #EAB308;
  --color-priority-low: #22C55E;
  
  /* Shadows */
  --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-elevated: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-glow-accent: 0 0 20px rgba(79, 70, 229, 0.3);
}

/* Utility classes */
.status-badge {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider;
}

.priority-critical {
  @apply text-red-500 bg-red-500/10 border border-red-500/20;
}
```

---

## Checklist de Implementação

- [ ] 1. Instalar Lucide React
- [ ] 2. Substituir emojis por ícones Lucide
- [ ] 3. Criar TaskDialog com Framer Motion
- [ ] 4. Implementar Skeleton components
- [ ] 5. Criar TaskCard compound component
- [ ] 6. Adicionar PageTransition wrapper
- [ ] 7. Implementar Toast system
- [ ] 8. Expandir design tokens
- [ ] 9. Adicionar HoverCard para tooltips
- [ ] 10. Configurar prefers-reduced-motion

---

## Priorização

| Prioridade | Componente | Impacto | Esforço |
|------------|------------|---------|---------|
| 🔴 Alta | Sistema de ícones | UX consistency | Baixo |
| 🔴 Alta | TaskDialog | Core interaction | Médio |
| 🔴 Alta | Skeleton Loading | Perceived performance | Baixo |
| 🟡 Média | TaskCard Compounds | UI polish | Médio |
| 🟡 Média | Page Transitions | Delight factor | Baixo |
| 🟢 Baixa | Toast System | Feedback | Médio |
| 🟢 Baixa | HoverCards | Tooltips | Baixo |