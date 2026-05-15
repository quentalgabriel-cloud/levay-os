import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/tenant-context'
import { CheckSquare, Building2, Users } from 'lucide-react'
import { StatsCard } from '@/components/ui/stats-card'

export default async function ExecutivePage() {
  const supabase = await createClient()
  const ctx = await requireAuth(supabase)
  const { workspaceId } = ctx

  const [
    { count: tasksCount },
    { count: companiesCount },
    { count: leadsCount },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
    supabase
      .from('crm_clients')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
  ])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Levay OS</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard Executivo</h1>
        <p className="text-muted text-sm mt-2">{ctx.workspaceName}</p>
      </header>

      <section>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Tarefas"
            value={tasksCount ?? 0}
            icon={<CheckSquare />}
            index={0}
          />
          <StatsCard
            title="Empresas"
            value={companiesCount ?? 0}
            icon={<Building2 />}
            index={1}
          />
          <StatsCard
            title="Leads (CRM)"
            value={leadsCount ?? 0}
            icon={<Users />}
            index={2}
          />
        </div>
      </section>
    </div>
  )
}
