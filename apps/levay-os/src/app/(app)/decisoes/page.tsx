import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import type { Tables } from '@/types/database'

type Decision = Tables<'decisions'>

export default async function DecisoesPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: decisions } = await supabase
    .from('decisions')
    .select('*, companies(name, color)')
    .eq('workspace_id', workspaceId)
    .order('decided_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Decisões</h1>
        <span className="text-sm text-muted">{decisions?.length ?? 0} registradas</span>
      </div>

      <div className="space-y-3">
        {decisions?.map((d) => {
          const co = (d as Decision & { companies: { name: string; color: string | null } | null }).companies

          return (
            <div
              key={d.id}
              className="px-5 py-4 bg-card border border-border rounded-[2rem] hover:bg-foreground/[0.03] cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {co && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: co.color ?? '#6b7280' }}
                    />
                  )}
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted">
                  <span>{d.decision_type}</span>
                  <span>·</span>
                  <span>{d.reversibility}</span>
                  <span>·</span>
                  <span>{new Date(d.decided_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                </div>
              </div>
              {d.practical_change && (
                <p className="text-xs text-muted ml-5 pl-0">{d.practical_change}</p>
              )}
            </div>
          )
        })}

        {!decisions?.length && (
          <p className="text-center text-muted py-16">Nenhuma decisão registrada.</p>
        )}
      </div>
    </div>
  )
}