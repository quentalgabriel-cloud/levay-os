'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  ArrowRight,
  Edit3,
} from 'lucide-react'

interface Task {
  id: string
  title: string
  minimum_movement?: string
  company_id?: string
  due_at?: string
  priority?: string
  status?: string
}

interface Company {
  id: string
  name: string
  color: string
}

interface TaskCardProps {
  task: Task
  company?: Company
  onEdit?: (task: Task) => void
  onStatusChange?: (taskId: string, status: string) => void
  onClick?: (task: Task) => void
  onDelete?: (taskId: string) => void
  compact?: boolean
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  em_andamento: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  a_fazer: { color: 'text-slate-500', bg: 'bg-slate-500/10' },
  aguardando: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  standby: { color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  fechar_ciclo: { color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ciclo_fechado: { color: 'text-green-500', bg: 'bg-green-500/10' },
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Crítica', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
  high: { label: 'Alta', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
  medium: { label: 'Média', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  low: { label: 'Baixa', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
}

const statusLabel: Record<string, string> = {
  em_andamento: 'Em movimento',
  a_fazer: 'A fazer',
  aguardando: 'Aguardando',
  standby: 'Standby',
  fechar_ciclo: 'Fechar ciclo',
  ciclo_fechado: 'Fechado',
}

export function TaskCard({ task, company, onEdit, onClick, compact = false }: TaskCardProps) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date()
  const statusCfg = statusConfig[task.status || 'a_fazer'] || statusConfig.a_fazer
  const priorityCfg = task.priority ? priorityConfig[task.priority] : null
  const isActive = task.status === 'em_andamento'

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(task)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      className={`group relative flex items-start gap-3 ${compact ? 'px-4 py-3' : 'px-5 py-4'} bg-card hover:bg-foreground/[0.02] border border-border rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden`}
      onClick={() => onClick?.(task)}
    >
      {/* Stripe lateral — somente tarefas em andamento */}
      {isActive && (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-accent" />
      )}

      {/* Status pill */}
      <div className="mt-0.5 shrink-0">
        <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
          {statusLabel[task.status || 'a_fazer'] ?? task.status}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold text-foreground group-hover:text-accent transition-colors leading-snug ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {task.title}
          </p>
          {priorityCfg && !compact && (
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${priorityCfg.bg} ${priorityCfg.color} shrink-0`}>
              {priorityCfg.label}
            </span>
          )}
        </div>

        {/* Minimum movement — campo hero, principal call to action */}
        {task.minimum_movement && !compact && (
          <div className="flex items-start gap-1.5 mt-2">
            <ArrowRight className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-foreground/70 leading-snug">
              {task.minimum_movement}
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2.5">
          {company && (
            <span className="flex items-center gap-1.5 text-[10px] text-muted font-medium">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: company.color }} />
              {company.name}
            </span>
          )}
          {task.due_at && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-muted'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
              {isOverdue && <AlertTriangle className="w-3 h-3 ml-0.5" />}
            </span>
          )}
        </div>
      </div>

      {/* Ação rápida no hover */}
      {!compact && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start mt-0.5">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
            title="Editar"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

// Compound component parts for specialized use
export const TaskCardHeader = TaskCard.Header = function Header({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>
}

export const TaskCardContent = TaskCard.Content = function Content({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted">{children}</div>
}

export const TaskCardFooter = TaskCard.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">{children}</div>
}

// Add static properties for compound pattern
TaskCard.Header = TaskCardHeader
TaskCard.Content = TaskCardContent
TaskCard.Footer = TaskCardFooter