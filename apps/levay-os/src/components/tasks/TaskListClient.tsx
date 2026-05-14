'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { STATUS_LABEL } from '@/lib/vocabulary'
import { SmartList } from '@/components/ui/SmartList'
import { TaskCard } from '@/components/cards/TaskCard'
import { FilterBar } from '@/components/filters/FilterBar'
import { TaskDialog } from '@/components/dialogs/TaskDialog'
import { createTask, deleteTask, updateTaskStatus } from '@/app/actions'
import { Plus } from 'lucide-react'

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

interface TaskListClientProps {
  initialTasks: Task[]
  companies: Company[]
}

const STATUS_ORDER = ['em_andamento', 'inbox', 'aguardando', 'fechar_ciclo', 'ciclo_fechado', 'a_fazer', 'standby']

function groupByStatus(tasks: Task[]) {
  const groups: Record<string, Task[]> = {}
  for (const s of STATUS_ORDER) groups[s] = []
  for (const t of tasks) {
    if (groups[t.status || 'a_fazer']) groups[t.status || 'a_fazer'].push(t)
    else groups[t.status || 'a_fazer'] = [t]
  }
  return groups
}

export function TaskListClient({ initialTasks, companies }: TaskListClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const companyMap = new Map(companies.map(c => [c.id, c]))

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.minimum_movement?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(task.status || 'a_fazer')
    
    return matchesSearch && matchesStatus
  })

  const grouped = groupByStatus(filteredTasks)

  const handleRefresh = async () => {
    setLoading(true)
    // Force refetch - em produção seria window.location.reload() ou router.refresh()
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  const handleCreateNew = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleSubmitTask = async (task: TaskFormData) => {
    startTransition(async () => {
      if (editingTask) {
        const fd = new FormData()
        Object.entries(task).forEach(([k, v]) => { if (v) fd.set(k, v) })
        fd.set('id', editingTask.id)
        // await updateTask(editingTask.id, fd)
      } else {
        const fd = new FormData()
        Object.entries(task).forEach(([k, v]) => { if (v) fd.set(k, v) })
        const result = await createTask(fd)
        if (result.error) {
          console.error('Error creating task:', result.error)
          return
        }
        const newTask: Task = {
          id: Date.now().toString(),
          title: task.title,
          minimum_movement: task.minimum_movement,
          company_id: task.company_id || undefined,
          due_at: task.due_at || undefined,
          priority: task.priority,
          status: task.status || 'a_fazer'
        }
        setTasks(prev => [newTask, ...prev])
      }
      setDialogOpen(false)
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    
    startTransition(async () => {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    })
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    })
  }

  const renderTask = (task: Task, index: number) => {
    const company = task.company_id ? companyMap.get(task.company_id) : undefined
    return (
      <TaskCard
        key={task.id}
        task={task}
        company={company}
        onClick={(t) => handleStatusChange(t.id, t.status === 'a_fazer' ? 'em_andamento' : 'a_fazer')}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    )
  }

  const keyExtractor = (task: Task, index: number) => task.id

  return (
    <div className="space-y-8">
      {/* Header com Busca e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Tarefas</h1>
          <p className="text-muted text-sm mt-1">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'} em aberto
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* FilterBar */}
      <FilterBar
        onSearch={setSearchQuery}
        onFilterChange={setStatusFilter}
        placeholder="Buscar tarefas por título ou movimento..."
      />

      {/* SmartList com resultados filtrados por grupo de status */}
      {statusFilter.length > 0 || searchQuery ? (
        // View de lista simples com filtros ativos
        <SmartList
          data={filteredTasks}
          loading={loading}
          emptyType="tasks"
          renderItem={renderTask}
          keyExtractor={keyExtractor}
          onRefresh={handleRefresh}
          onCreateNew={handleCreateNew}
          listClassName="space-y-4"
          skeletonCount={3}
        />
      ) : (
        // View agrupada por status
        <div className="space-y-10">
          {STATUS_ORDER.filter((s) => (grouped[s]?.length ?? 0) > 0).map((status) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  {STATUS_LABEL[status] ?? status}
                </h2>
                <span className="text-[10px] font-black text-muted bg-foreground/[0.03] border border-border px-2 py-0.5 rounded-full">
                  {grouped[status].length}
                </span>
                {/* Status indicator color */}
                <div className={`w-2 h-2 rounded-full ${
                  status === 'em_andamento' ? 'bg-emerald-500' :
                  status === 'aguardando' ? 'bg-amber-500' :
                  status === 'fechar_ciclo' ? 'bg-violet-500' :
                  'bg-slate-400'
                }`} />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {grouped[status].map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {renderTask(task, index)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted max-w-sm mx-auto">
                {searchQuery || statusFilter.length > 0 
                  ? 'Tente ajustar seus filtros de busca.'
                  : 'Inbox vazio — bom sinal. Crie uma nova tarefa para começar.'}
              </p>
              {(searchQuery || statusFilter.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter([]) }}
                  className="mt-6 px-6 py-2 bg-foreground/5 text-foreground rounded-lg font-medium hover:bg-foreground/10 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

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