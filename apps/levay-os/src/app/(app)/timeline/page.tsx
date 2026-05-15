import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { DecisionTimeline } from '@/components/decisions/DecisionTimeline'
import { PageTransition } from '@/components/layout/PageTransition'
import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'

export default async function TimelinePage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: decisions } = await supabase
    .from('decisions')
    .select('*, companies(name, color)')
    .eq('workspace_id', workspaceId)
    .order('decided_at', { ascending: false })
    .limit(100)

  const decisionsList = (decisions ?? []).map(d => ({
    id: d.id,
    title: d.title,
    decision_type: d.decision_type,
    reversibility: d.reversibility,
    decided_at: d.decided_at,
    practical_change: d.practical_change,
    companies: d.companies as { name: string; color: string | null } | null
  }))

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Timeline de Decisões</h1>
            <p className="text-sm text-muted mt-1">
              {decisionsList.length} decisões registradas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/decisoes"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Lista
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <DecisionTimeline decisions={decisionsList} />
      </div>
    </PageTransition>
  )
}