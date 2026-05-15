'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Inbox, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react'
import { ReactNode, useState, useEffect } from 'react'

// Types
type ListState = 'loading' | 'empty' | 'error' | 'success'
type EmptyType = 'tasks' | 'projects' | 'companies' | 'users' | 'search' | 'custom'

interface SmartListProps<T> {
  // Data
  data: T[]
  loading?: boolean
  error?: string | null
  
  // State
  state?: ListState
  emptyType?: EmptyType
  customEmpty?: { title: string; description: string }
  
  // Rendering
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  
  // Actions
  onRefresh?: () => void
  onCreateNew?: () => void
  onRetry?: () => void
  
  // Options
  animationDelay?: number
  showSkeleton?: boolean
  skeletonCount?: number
  
  // UI Options
  className?: string
  listClassName?: string
}

const emptyConfig: Record<EmptyType, { icon: typeof Inbox; title: string; description: string }> = {
  tasks: {
    icon: Inbox,
    title: 'Nenhuma tarefa em aberto',
    description: 'Inbox vazio — bom sinal. Crie uma nova tarefa para começar.',
  },
  projects: {
    icon: Inbox,
    title: 'Nenhum projeto encontrado',
    description: 'Comece criando seu primeiro projeto.',
  },
  companies: {
    icon: Inbox,
    title: 'Nenhuma empresa cadastrada',
    description: 'Adicione empresas para começar.',
  },
  users: {
    icon: Inbox,
    title: 'Nenhum membro na equipe',
    description: 'Convide membros para colaborar.',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente buscar com outros termos.',
  },
  custom: {
    icon: Inbox,
    title: 'Nenhum item encontrado',
    description: 'Não há dados para exibir.',
  }
}

// Skeleton Component
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-4 px-6 py-5 bg-card/50 border border-border rounded-[2rem]"
        >
          <div className="w-3 h-3 rounded-full bg-border/50 mt-1.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-border/50 rounded-lg w-3/4" />
            <div className="h-4 bg-border/30 rounded-lg w-1/2" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-5 w-20 bg-border/30 rounded-full" />
            <div className="h-4 w-16 bg-border/20 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Empty State Component
function EmptyState({ 
  type, 
  custom,
  onCreateNew 
}: { 
  type: EmptyType
  custom?: { title: string; description: string; icon?: React.ComponentType<{ className?: string }> }
  onCreateNew?: () => void
}) {
  const baseConfig = emptyConfig[type]
  const config = custom ? { ...baseConfig, ...custom } : baseConfig
  const Icon = config.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-accent" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
      <p className="text-muted max-w-sm mb-8">{config.description}</p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Criar novo
        </button>
      )}
    </motion.div>
  )
}

// Error State Component
function ErrorState({ error, onRetry, onRefresh }: { 
  error: string
  onRetry?: () => void
  onRefresh?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Algo deu errado</h3>
      <p className="text-muted max-w-sm mb-8">{error}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-foreground/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors"
          >
            Atualizar
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Loading State Component
function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
      <p className="text-muted">{message}</p>
    </motion.div>
  )
}

// Main SmartList Component
export function SmartList<T>({
  data,
  loading = false,
  error = null,
  emptyType = 'tasks',
  customEmpty,
  renderItem,
  keyExtractor,
  onRefresh,
  onCreateNew,
  onRetry,
  animationDelay = 0.05,
  skeletonCount = 5,
  className = '',
  listClassName = ''
}: SmartListProps<T>) {
  // Determine state
  const state: ListState = error 
    ? 'error' 
    : loading 
      ? 'loading' 
      : data.length === 0 
        ? 'empty' 
        : 'success'

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.metaKey || e.ctrlKey) && onRefresh) {
        e.preventDefault()
        onRefresh()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRefresh])

  return (
    <div className={`smart-list ${className}`}>
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ListSkeleton count={skeletonCount} />
          </motion.div>
        )}
        
        {state === 'empty' && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState 
              type={emptyType} 
              custom={customEmpty}
              onCreateNew={onCreateNew}
            />
          </motion.div>
        )}
        
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorState 
              error={error as string} 
              onRetry={onRetry}
              onRefresh={onRefresh}
            />
          </motion.div>
        )}
        
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={listClassName}
          >
            <AnimatePresence mode="popLayout">
              {data.map((item, index) => (
                <motion.div
                  key={keyExtractor(item, index)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * animationDelay }}
                  layout
                >
                  {renderItem(item, index)}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Export sub-components for customization
export const SmartListSkeleton = ListSkeleton
export const SmartListEmpty = EmptyState
export const SmartListError = ErrorState
export const SmartListLoading = LoadingState