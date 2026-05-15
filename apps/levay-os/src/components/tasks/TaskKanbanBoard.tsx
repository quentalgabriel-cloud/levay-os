'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, 
  MoreHorizontal, 
  GripVertical,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskDialog } from '@/components/dialogs/TaskDialog'
import { createTask, updateTaskStatus, deleteTask } from '@/app/actions'
import { useTransition } from 'react'

interface TaskFormData {
  title: string
  minimum_movement: string
  company_id: string
  due_at: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
}

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

interface TaskKanbanBoardProps {
  initialTasks: Task[]
  companies: Company[]
}

const COLUMNS = [
  { id: 'a_fazer', label: 'A Fazer', icon: Circle, color: 'bg-slate-500' },
  { id: 'em_andamento', label: 'Em Andamento', icon: Clock, color: 'bg-emerald-500' },
  { id: 'aguardando', label: 'Aguardando', icon: AlertCircle, color: 'bg-amber-500' },
  { id: 'fechar_ciclo', label: 'Fechar Ciclo', icon: CheckCircle, color: 'bg-violet-500' },
]

export function TaskKanbanBoard({ initialTasks, companies }: TaskKanbanBoardProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  const companyMap = new Map(companies.map(c => [c.id, c]))

  const getTasksByColumn = (columnId: string) => 
    tasks.filter(t => t.status === columnId || (!t.status && columnId === 'a_fazer'))

  const handleDragEnd = useCallback((columnId: string, taskId: string) => {
    startTransition(async () => {
      await updateTaskStatus(taskId, columnId)
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: columnId } : t
      ))
    })
  }, [])

  const handleCreateTask = (columnId: string) => {
    setActiveColumn(columnId)
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Excluir esta tarefa?')) return
    startTransition(async () => {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    })
  }

  const handleSubmitTask = async (task: TaskFormData) => {
    const fd = new FormData()
    Object.entries(task).forEach(([k, v]) => { if (v) fd.set(k, v) })
    if (activeColumn) fd.set('status', activeColumn)

    startTransition(async () => {
      const result = await createTask(fd)
      if (!result.error && result.data) {
        const newTask: Task = {
          id: result.data.id,
          title: task.title,
          minimum_movement: task.minimum_movement,
          company_id: task.company_id || undefined,
          due_at: task.due_at || undefined,
          priority: task.priority,
          status: activeColumn || 'a_fazer'
        }
        setTasks(prev => [...prev, newTask])
      }
      setDialogOpen(false)
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
          <p className="text-sm text-muted mt-1">{tasks.length} tarefas</p>
        </div>
        <button
          onClick={() => handleCreateTask('a_fazer')}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {COLUMNS.map(column => {
            const columnTasks = getTasksByColumn(column.id)
            const Icon = column.icon
            
            return (
              <div 
                key={column.id} 
                className="w-72 flex-shrink-0 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <Icon className="w-4 h-4 text-muted" />
                  <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
                  <span className="ml-auto text-xs text-muted bg-foreground/5 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Content */}
                <div 
                  className="flex-1 bg-foreground/[0.02] rounded-xl p-2 space-y-2 min-h-[200px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {}}
                >
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task, index) => {
                      const company = task.company_id ? companyMap.get(task.company_id) : undefined
                      const isOverdue = task.due_at && new Date(task.due_at) < new Date()
                      
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.02 }}
                          draggable
                          onDragEnd={(e, info) => {
                            if (info.offset.x > 50) {
                              const nextColumn = COLUMNS.find(c => 
                                COLUMNS.indexOf(c) > COLUMNS.indexOf(column)
                              )
                              if (nextColumn) handleDragEnd(nextColumn.id, task.id)
                            } else if (info.offset.x < -50) {
                              const prevColumn = COLUMNS.find(c => 
                                COLUMNS.indexOf(c) < COLUMNS.indexOf(column)
                              )
                              if (prevColumn) handleDragEnd(prevColumn.id, task.id)
                            }
                          }}
                          className="group bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent/30 transition-colors shadow-sm"
                        >
                          {/* Drag Handle */}
                          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-muted" />
                          </div>
                          
                          {/* Title */}
                          <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                            {task.title}
                          </h4>
                          
                          {/* Minimum Movement */}
                          {task.minimum_movement && (
                            <p className="text-xs text-muted mb-2 line-clamp-1">
                              → {task.minimum_movement}
                            </p>
                          )}
                          
                          {/* Meta */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isOverdue && (
                              <span className="text-[10px] font-medium text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Atrasado
                              </span>
                            )}
                            {company && (
                              <span 
                                className="text-[10px] font-medium text-muted flex items-center gap-1"
                                style={{ color: company.color }}
                              >
                                <Building2 className="w-3 h-3" />
                                {company.name}
                              </span>
                            )}
                            {task.due_at && (
                              <span className="text-[10px] text-muted flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-xs text-muted hover:text-foreground px-2 py-1 rounded hover:bg-foreground/5"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-xs text-muted hover:text-red-500 px-2 py-1 rounded hover:bg-red-500/5"
                            >
                              Excluir
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {/* Add Task Button */}
                  <button
                    onClick={() => handleCreateTask(column.id)}
                    className="w-full py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors flex items-center justify-center gap-1 border border-dashed border-transparent hover:border-border"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar tarefa
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitTask}
        initialData={editingTask || undefined}
        companies={companies}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  )
}