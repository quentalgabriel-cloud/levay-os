'use client'

import { motion } from 'framer-motion'
import { Inbox, Plus, Search, FileText, Users, Building2, FolderKanban, CheckCircle } from 'lucide-react'
import { ReactNode } from 'react'

type EmptyStateType = 'tasks' | 'projects' | 'companies' | 'users' | 'search' | 'success'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const emptyStateConfig: Record<EmptyStateType, { icon: typeof Inbox; title: string; description: string }> = {
  tasks: {
    icon: Inbox,
    title: 'Nenhuma tarefa em aberto',
    description: 'Inbox vazio — bom sinal. Crie uma nova tarefa para começar.',
  },
  projects: {
    icon: FolderKanban,
    title: 'Nenhum projeto encontrado',
    description: 'Comece criando seu primeiro projeto para organizar o trabalho.',
  },
  companies: {
    icon: Building2,
    title: 'Nenhuma empresa cadastrada',
    description: 'Adicione empresas para começar a gerenciar suas operações.',
  },
  users: {
    icon: Users,
    title: 'Nenhum membro na equipe',
    description: 'Convide membros para colaborar no seu workspace.',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente buscar com termos diferentes ou limpe os filtros.',
  },
  success: {
    icon: CheckCircle,
    title: 'Tudo certo!',
    description: 'Operação realizada com sucesso.',
  }
}

const icons = {
  tasks: Inbox,
  projects: FolderKanban,
  companies: Building2,
  users: Users,
  search: Search,
  success: CheckCircle,
  file: FileText,
}

export function EmptyState({ type, title, description, action, secondaryAction }: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-accent" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-muted max-w-sm mb-8">
        {description || config.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function SuccessState({ 
  title = 'Sucesso!', 
  message, 
  action 
}: { 
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1">
        {title}
      </h3>
      
      {message && (
        <p className="text-muted text-sm mb-6">
          {message}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-foreground/5 text-foreground rounded-lg font-medium hover:bg-foreground/10 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}

export function ErrorState({ 
  title = 'Algo deu errado', 
  message, 
  retry 
}: { 
  title?: string
  message?: string
  retry?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1">
        {title}
      </h3>
      
      {message && (
        <p className="text-muted text-sm mb-6 max-w-md">
          {message}
        </p>
      )}
      
      {retry && (
        <button
          onClick={retry}
          className="flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground rounded-lg font-medium hover:bg-foreground/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tentar novamente
        </button>
      )}
    </motion.div>
  )
}