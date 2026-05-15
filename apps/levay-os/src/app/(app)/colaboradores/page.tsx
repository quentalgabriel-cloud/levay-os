import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { ColaboradoresClient } from './ColaboradoresClient'

export default async function ColaboradoresPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const [{ data: collaborators }, { data: companies }] = await Promise.all([
    supabase
      .from('collaborators')
      .select('id, name, email, whatsapp, default_company_id, active, profile_data')
      .order('name'),
    supabase
      .from('companies')
      .select('id, name, slug, color')
      .eq('workspace_id', workspaceId),
  ])

  const collaboratorsList = (collaborators ?? []).map(c => ({
    id: c.id,
    name: c.name,
    email: c.email as string | null,
    whatsapp: c.whatsapp as string | null,
    default_company_id: c.default_company_id as string | null,
    active: c.active as boolean,
    profile_data: c.profile_data as {
      role?: string
      position?: string
      strengths?: string
      specialty?: string
      impact_phrase?: string
    } | null,
  }))

  const companiesList = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color as string | null,
  }))

  return (
    <ColaboradoresClient
      initialCollaborators={collaboratorsList}
      companies={companiesList}
    />
  )
}
