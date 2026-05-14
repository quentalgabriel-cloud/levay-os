import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { CompanyListClient } from '@/components/companies/CompanyListClient'
import { PageTransition } from '@/components/layout/PageTransition'

export default async function EmpresasPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const [{ data: companies }, { data: projects }, { data: tasks }] = await Promise.all([
    supabase.from('companies').select('*').eq('workspace_id', workspaceId).order('name'),
    supabase.from('projects').select('company_id, status').eq('workspace_id', workspaceId),
    supabase.from('tasks').select('company_id, status').eq('workspace_id', workspaceId).neq('status', 'ciclo_fechado'),
  ])

  const companiesList = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline ?? undefined,
    color: c.color ?? '#6b7280'
  }))

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <CompanyListClient
          initialCompanies={companiesList}
          projects={(projects ?? []).filter((p): p is { company_id: string; status: string } => p.company_id !== null)}
          tasks={(tasks ?? []).filter((t): t is { company_id: string; status: string } => t.company_id !== null)}
        />
      </div>
    </PageTransition>
  )
}