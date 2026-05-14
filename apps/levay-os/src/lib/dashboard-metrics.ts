import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export type CompanySlug = 'sollu' | 'amp213' | 'bicabar'

export interface CompanyMetrics {
  companyId: string
  companySlug: string
  companyName: string
  companyColor: string
  tasks: {
    total: number
    inbox: number
    emMovimento: number
    closed: number
    byCockpit: Record<string, number>
  }
  leads: {
    total: number
    novo: number
    qualificado: number
    negociando: number
    ganho: number
    perdido: number
  }
  finance: {
    receivable: {
      total: number
      pending: number
      overdue: number
      paid: number
    }
  }
  projects: {
    total: number
    ativo: number
    pausado: number
    withAttention: number
  }
  events: {
    total: number
    upcoming: number
  }
}

export interface WorkspaceDashboardMetrics {
  workspaceId: string
  workspaceName: string
  totalTasks: number
  totalProjects: number
  totalDecisions: number
  totalClients: number
  companies: CompanyMetrics[]
  recentActivity: {
    tasks: Tables<'tasks'>[]
    projects: Tables<'projects'>[]
    decisions: Tables<'decisions'>[]
  }
}

export async function getWorkspaceCompanies(workspaceId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name')
  return data || []
}

export async function getCompanyMetrics(
  workspaceId: string,
  companyId: string,
  companySlug: string,
  companyName: string,
  companyColor: string | null
): Promise<CompanyMetrics> {
  const supabase = await createClient()

const [
    { data: tasks },
    { data: crmClients },
    { data: projects },
    { data: events },
  ] = await Promise.all([
    supabase.from('tasks').select('*').eq('workspace_id', workspaceId).eq('company_id', companyId),
    supabase.from('crm_clients').select('*').eq('workspace_id', workspaceId).eq('company_id', companyId),
    supabase.from('projects').select('*').eq('workspace_id', workspaceId).eq('company_id', companyId).eq('status', 'ativo'),
    supabase.from('events').select('*').eq('workspace_id', workspaceId).eq('company_id', companyId),
  ])

  const now = new Date()
  const upcomingEvents = events?.filter(e => e.event_date && new Date(e.event_date) >= now) || []

  return {
    companyId,
    companySlug,
    companyName,
    companyColor: companyColor || '#6b7280',
    tasks: {
      total: tasks?.length || 0,
      inbox: tasks?.filter(t => t.inbox).length || 0,
      emMovimento: tasks?.filter(t => t.status === 'em_andamento').length || 0,
      closed: tasks?.filter(t => t.status === 'ciclo_fechado').length || 0,
      byCockpit: {
        inbox: tasks?.filter(t => t.block === 'inbox').length || 0,
        hoje: tasks?.filter(t => t.block === 'hoje').length || 0,
        decidir: tasks?.filter(t => t.block === 'decidir').length || 0,
        delegar: tasks?.filter(t => t.block === 'delegar').length || 0,
        quarantine: tasks?.filter(t => !t.block).length || 0,
      }
    },
    leads: {
      total: 0,
      novo: 0,
      qualificado: 0,
      negociando: 0,
      ganho: 0,
      perdido: 0,
    },
    finance: {
      receivable: {
        total: crmClients?.length || 0,
        pending: crmClients?.filter(c => c.status === 'ativo').length || 0,
        overdue: 0,
        paid: crmClients?.filter(c => c.status === 'concluido').length || 0,
      }
    },
    projects: {
      total: projects?.length || 0,
      ativo: projects?.filter(p => p.status === 'ativo').length || 0,
      pausado: projects?.filter(p => p.status === 'pausado').length || 0,
      withAttention: projects?.filter(p => p.attention).length || 0,
    },
    events: {
      total: events?.length || 0,
      upcoming: upcomingEvents.length,
    }
  }
}

export async function getWorkspaceDashboardMetrics(workspaceId: string): Promise<WorkspaceDashboardMetrics> {
  const supabase = await createClient()

  const companies = await getWorkspaceCompanies(workspaceId)

  const [
    { data: allTasks, count: totalTasks },
    { data: allProjects, count: totalProjects },
    { data: allDecisions, count: totalDecisions },
    { data: allClients, count: totalClients },
  ] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact' }).eq('workspace_id', workspaceId),
    supabase.from('projects').select('*', { count: 'exact' }).eq('workspace_id', workspaceId),
    supabase.from('decisions').select('*', { count: 'exact' }).eq('workspace_id', workspaceId),
    supabase.from('crm_clients').select('*', { count: 'exact' }).eq('workspace_id', workspaceId),
  ])

  const companyMetrics = await Promise.all(
    companies.map(company => 
      getCompanyMetrics(
        workspaceId,
        company.id,
        company.slug,
        company.name,
        company.color
      )
    )
  )

  const recentTasks = allTasks
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || []

  const recentProjects = allProjects
    ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5) || []

  const pendingDecisions = allDecisions
    ?.filter(d => d.format === 'open')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || []

  return {
    workspaceId,
    workspaceName: 'Grupo Levay',
    totalTasks: totalTasks || 0,
    totalProjects: totalProjects || 0,
    totalDecisions: totalDecisions || 0,
    totalClients: totalClients || 0,
    companies: companyMetrics,
    recentActivity: {
      tasks: recentTasks as Tables<'tasks'>[],
      projects: recentProjects as Tables<'projects'>[],
      decisions: pendingDecisions as Tables<'decisions'>[],
    }
  }
}

// Cockpit block data for Mesa do Diretor
export interface CockpitBlock {
  id: string
  title: string
  count: number
  color: string
  items: {
    id: string
    title: string
    subtitle?: string
    priority?: number
    attention?: boolean
    companySlug?: string
  }[]
}

export async function getCockpitBlocks(
  workspaceId: string,
  companySlug?: CompanySlug
): Promise<CockpitBlock[]> {
  const supabase = await createClient()

  const companies = await getWorkspaceCompanies(workspaceId)
  const companyId = companySlug 
    ? companies.find(c => c.slug === companySlug)?.id 
    : undefined

  const query = supabase
    .from('tasks')
    .select('*, companies(name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (companyId) {
    query.eq('company_id', companyId)
  }

  const { data: tasks } = await query

  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  return [
    {
      id: 'inbox',
      title: 'Capturar',
      count: tasks?.filter(t => t.inbox).length || 0,
      color: 'border-slate-300',
      items: tasks
        ?.filter(t => t.inbox)
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          companySlug: (t as Tables<'tasks'> & { companies?: { slug: string } | null }).companies?.slug,
          priority: t.priority || undefined,
        })) || []
    },
    {
      id: 'today',
      title: 'Hoje',
      count: tasks?.filter(t => 
        t.status === 'em_andamento' && 
        t.due_at && 
        new Date(t.due_at) <= todayEnd
      ).length || 0,
      color: 'border-amber-500/30',
      items: tasks
        ?.filter(t => 
          t.status === 'em_andamento' && 
          t.due_at && 
          new Date(t.due_at) <= todayEnd
        )
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          subtitle: t.due_at ? new Date(t.due_at).toLocaleDateString('pt-BR') : undefined,
          priority: t.priority || undefined,
          attention: t.due_at ? new Date(t.due_at) < now : undefined,
          companySlug: (t as Tables<'tasks'> & { companies?: { slug: string } | null }).companies?.slug,
        })) || []
    },
    {
      id: 'decidir',
      title: 'Decidir',
      count: tasks?.filter(t => t.block === 'decidir').length || 0,
      color: 'border-purple-500/30',
      items: tasks
        ?.filter(t => t.block === 'decidir')
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority || undefined,
          companySlug: (t as Tables<'tasks'> & { companies?: { slug: string } | null }).companies?.slug,
        })) || []
    },
    {
      id: 'delegar',
      title: 'Delegar',
      count: tasks?.filter(t => t.block === 'delegar').length || 0,
      color: 'border-orange-500/30',
      items: tasks
        ?.filter(t => t.block === 'delegar')
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          companySlug: (t as Tables<'tasks'> & { companies?: { slug: string } | null }).companies?.slug,
        })) || []
    },
    {
      id: 'no-movement',
      title: 'Sem Movimento',
      count: tasks?.filter(t => !t.minimum_movement && t.status !== 'ciclo_fechado').length || 0,
      color: 'border-red-500/30',
      items: tasks
        ?.filter(t => !t.minimum_movement && t.status !== 'ciclo_fechado')
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          attention: true,
          companySlug: (t as Tables<'tasks'> & { companies?: { slug: string } | null }).companies?.slug,
        })) || []
    },
  ]
}