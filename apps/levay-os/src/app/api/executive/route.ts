import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const TENANTS = ['sollu', 'bicabar', 'amp213']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'operator'
  const isCeo = role === 'ceo' || role === 'owner' || role === 'admin'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenants = isCeo ? TENANTS : ['sollu']

  const [companies, tasks, events, crmClients] = await Promise.all([
    supabase.from('companies').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('events').select('*'),
    supabase.from('crm_clients').select('*')
  ])

  const tenantsData = tenants.map(tenantId => {
    const tenantCompanies = (companies.data || []).filter((c: any) => c.workspace_id === tenantId)
    const tenantTasks = (tasks.data || []).filter((t: any) => t.workspace_id === tenantId)
    const tenantEvents = (events.data || []).filter((e: any) => e.workspace_id === tenantId)
    const tenantCRM = (crmClients.data || []).filter((c: any) => c.workspace_id === tenantId)

    const totalTasks = tenantTasks.length
    const completedTasks = tenantTasks.filter((t: any) => t.status === 'concluido' || t.status === 'fechado').length

    return {
      tenantId,
      total: tenantCompanies.length * 15000,
      pending: Math.floor(tenantCompanies.length * 3000),
      paid: Math.floor(tenantCompanies.length * 12000),
      overdue: Math.floor(tenantCompanies.length * 500),
      leads: {
        total: tenantCRM.length,
        novo: Math.floor(tenantCRM.length * 0.3),
        qualificado: Math.floor(tenantCRM.length * 0.25),
        negociando: Math.floor(tenantCRM.length * 0.2),
        ganho: Math.floor(tenantCRM.length * 0.25)
      },
      occupancy: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
      analytics: {
        revenue: tenantCompanies.length * 15000,
        conversion: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
        efficiency: ((completedTasks / Math.max(totalTasks, 1)) * 100).toFixed(1)
      }
    }
  })

  const totalRevenue = tenantsData.reduce((sum, t) => sum + t.total, 0)
  const totalPending = tenantsData.reduce((sum, t) => sum + t.pending, 0)
  const totalOverdue = tenantsData.reduce((sum, t) => sum + t.overdue, 0)
  const totalLeads = tenantsData.reduce((sum, t) => sum + t.leads.total, 0)
  const totalGanho = tenantsData.reduce((sum, t) => sum + t.leads.ganho, 0)
  const avgOccupancy = tenantsData.reduce((sum, t) => sum + parseFloat(t.occupancy || '0'), 0) / tenantsData.length

  const insights: Array<{ type: string; severity?: string; message: string }> = []

  if (totalOverdue > 0) {
    insights.push({ type: 'alert', severity: 'high', message: `R$ ${totalOverdue.toLocaleString('pt-BR')} em recebíveis vencidos` })
  }
  if (totalPending > totalRevenue * 0.5) {
    insights.push({ type: 'warning', severity: 'medium', message: 'Mais de 50% dos recebíveis estão pendentes' })
  }
  if (tenantsData.some(t => t.leads.ganho > 0)) {
    insights.push({ type: 'opportunity', message: 'Novos clientes ganhos — considere cross-sell entre empresas' })
  }
  if (avgOccupancy < 50) {
    insights.push({ type: 'suggestion', message: 'Ocupação abaixo de 50% — avalie prioridades' })
  }
  if (insights.length === 0) {
    insights.push({ type: 'info', message: 'Tudo em ordem — sem alertas críticos no momento' })
  }

  return Response.json({
    tenants: tenantsData,
    consolidated: {
      revenue: totalRevenue,
      revenueDetails: { total: totalRevenue, pending: totalPending, overdue: totalOverdue },
      leads: { total: totalLeads, ganho: totalGanho, conversion: totalLeads > 0 ? ((totalGanho / totalLeads) * 100).toFixed(1) : '0' },
      occupancy: avgOccupancy.toFixed(1)
    },
    insights,
    metadata: {
      generatedAt: new Date().toISOString(),
      tenantsIncluded: tenants,
      role
    }
  })
}