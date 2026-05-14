import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { ProjectListClient } from '@/components/projects/ProjectListClient'
import { PageTransition } from '@/components/layout/PageTransition'

export default async function ProjetosPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const [{ data: projects }, { data: companies }] = await Promise.all([
    supabase.from('projects').select('*').eq('workspace_id', workspaceId).neq('status', 'arquivado').order('status').order('name'),
    supabase.from('companies').select('id, name, slug, color').eq('workspace_id', workspaceId),
  ])

  const projectsList = (projects ?? []).map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    company_id: p.company_id ?? undefined,
    next_milestone: p.next_milestone ?? undefined,
    attention: p.attention ?? undefined,
    blocking: p.blocking ?? undefined,
    health_score: p.health_score ?? undefined
  }))

  const companiesList = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    color: c.color ?? '#6b7280'
  }))

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <ProjectListClient initialProjects={projectsList} companies={companiesList} />
      </div>
    </PageTransition>
  )
}