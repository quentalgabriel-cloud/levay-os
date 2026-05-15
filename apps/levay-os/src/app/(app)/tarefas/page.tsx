import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { TaskListClient } from '@/components/tasks/TaskListClient'
import { PageTransition } from '@/components/layout/PageTransition'
import { MiniCalendar } from '@/components/ui/MiniCalendar'

export default async function TarefasPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const [{ data: tasks }, { data: companies }] = await Promise.all([
    supabase.from('tasks').select('*').eq('workspace_id', workspaceId).neq('status', 'ciclo_fechado').order('priority', { ascending: false }).order('created_at').limit(100),
    supabase.from('companies').select('id, name, slug, color').eq('workspace_id', workspaceId),
  ])

  const tasksList = (tasks ?? []).map(t => ({
    id: t.id,
    title: t.title,
    minimum_movement: t.minimum_movement,
    company_id: t.company_id ?? undefined,
    due_at: t.due_at ?? undefined,
    priority: t.priority != null ? String(t.priority) : undefined,
    status: t.status
  }))

  const companiesList = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    color: c.color ?? '#6b7280'
  }))

  const taskEvents = tasksList
    .filter(t => t.due_at)
    .map(t => ({ date: t.due_at!.slice(0, 10) }))

  const overdueCount = tasksList.filter(t => {
    if (!t.due_at) return false
    return new Date(t.due_at) < new Date()
  }).length

  return (
    <PageTransition>
      <div className="p-8 max-w-[90rem] mx-auto flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <TaskListClient
            initialTasks={tasksList}
            companies={companiesList}
          />
        </div>

        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0 sticky top-6">
          <MiniCalendar events={taskEvents} />
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Resumo</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums text-foreground">{tasksList.length}</span>
              <span className="text-xs text-muted">tarefas</span>
            </div>
            {overdueCount > 0 && (
              <p className="text-xs text-destructive font-semibold">
                {overdueCount} {overdueCount === 1 ? 'vencida' : 'vencidas'}
              </p>
            )}
            <p className="text-xs text-muted">
              {taskEvents.length} com prazo definido
            </p>
          </div>
        </aside>
      </div>
    </PageTransition>
  )
}
