import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard'
import { PageTransition } from '@/components/layout/PageTransition'

export default async function KanbanPage() {
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

  return (
    <PageTransition>
      <div className="h-[calc(100vh-8rem)] p-6">
        <TaskKanbanBoard initialTasks={tasksList} companies={companiesList} />
      </div>
    </PageTransition>
  )
}