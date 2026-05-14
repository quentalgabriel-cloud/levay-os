import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { AlertTriangle, Zap, Target, Lightbulb, Info } from 'lucide-react'
import { HeroMetric } from '@/components/ui/HeroMetric'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface ExecutiveData {
  tenants: Array<{
    tenantId: string
    total: number
    pending: number
    paid: number
    overdue: number
    leads: { total: number; novo: number; qualificado: number; negociando: number; ganho: number }
    occupancy: string
    analytics: { revenue: number; conversion: number; efficiency: number }
  }>
  consolidated: {
    revenue: number
    revenueDetails: { total: number; pending: number; overdue: number }
    leads: { total: number; ganho: number; conversion: string }
    occupancy: string
  }
  insights: Array<{ type: string; severity?: string; message: string }>
  metadata: { generatedAt: string; tenantsIncluded: string[]; role: string }
}

async function getExecutiveData(): Promise<ExecutiveData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaceCtx = await getWorkspaceContext(supabase)
  if (!workspaceCtx) return null

  const role = workspaceCtx.userRole || 'operator'

  const response = await fetch(`/api/executive?role=${role}`, {
    next: { revalidate: 30 }
  })

  if (!response.ok) return null
  return response.json()
}

const TENANT_LABELS: Record<string, string> = {
  sollu: 'Sollu',
  bicabar: 'Bica Bar',
  amp213: 'AMP 213'
}

const TENANT_HEX: Record<string, string> = {
  sollu: '#2563EB',
  bicabar: '#7C3AED',
  amp213: '#EA580C'
}

type InsightType = 'alert' | 'warning' | 'opportunity' | 'suggestion' | 'info'

const INSIGHT_CONFIG: Record<InsightType, { icon: typeof AlertTriangle; styles: string }> = {
  alert: { icon: AlertTriangle, styles: 'bg-red-500/10 border-red-500/30 text-red-400' },
  warning: { icon: Zap, styles: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  opportunity: { icon: Target, styles: 'bg-green-500/10 border-green-500/30 text-green-400' },
  suggestion: { icon: Lightbulb, styles: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  info: { icon: Info, styles: 'bg-foreground/5 border-border text-muted' },
}

function InsightCard({ insight }: { insight: { type: string; severity?: string; message: string } }) {
  const cfg = INSIGHT_CONFIG[insight.type as InsightType] ?? INSIGHT_CONFIG.info
  const Icon = cfg.icon
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${cfg.styles}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm font-medium">{insight.message}</p>
    </div>
  )
}

function TenantCard({ tenant }: { tenant: ExecutiveData['tenants'][0] }) {
  const label = TENANT_LABELS[tenant.tenantId] || tenant.tenantId
  const color = TENANT_HEX[tenant.tenantId] || '#6b7280'
  const occupancyValue = parseFloat(tenant.occupancy || '0')

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-bold text-foreground">{label}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <HeroMetric
            label="Receita"
            value={`R$ ${(tenant.total || 0).toLocaleString('pt-BR')}`}
            size="md"
            index={0}
          />
          {tenant.overdue > 0 && (
            <p className="text-xs text-destructive mt-1">
              R$ {tenant.overdue.toLocaleString('pt-BR')} vencido
            </p>
          )}
        </div>
        <div>
          <HeroMetric
            label="Leads"
            value={tenant.leads.total}
            unit={`${tenant.leads.ganho} ganhos`}
            size="md"
            index={1}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Ocupação</p>
        <ProgressBar value={occupancyValue} showLabel />
      </div>
    </div>
  )
}

export default async function ExecutivePage() {
  const data = await getExecutiveData()

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted">Apenas CEOs podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Levay OS</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard Executivo</h1>
        <p className="text-muted text-sm mt-2">
          Visão consolidada das {data.tenants.length} empresas · Atualizado{' '}
          {new Date(data.metadata.generatedAt).toLocaleString('pt-BR')}
        </p>
      </header>

      {/* Consolidado */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">Consolidado</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-accent/30 rounded-2xl p-6">
            <HeroMetric
              label="Receita Total"
              value={`R$ ${data.consolidated.revenue.toLocaleString('pt-BR')}`}
              size="lg"
              index={0}
            />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <HeroMetric
              label="Pendente"
              value={`R$ ${(data.consolidated.revenueDetails?.pending || 0).toLocaleString('pt-BR')}`}
              size="md"
              index={1}
            />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <HeroMetric
              label="Leads"
              value={data.consolidated.leads.total}
              unit={`${data.consolidated.leads.conversion}% conv.`}
              size="md"
              index={2}
            />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <HeroMetric
              label="Ocupação"
              value={`${data.consolidated.occupancy}%`}
              size="md"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Por Empresa */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">Por Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.tenants.map((tenant) => (
            <TenantCard key={tenant.tenantId} tenant={tenant} />
          ))}
        </div>
      </section>

      {/* Insights */}
      {data.insights.length > 0 && (
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
