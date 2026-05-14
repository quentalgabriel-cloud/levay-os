// Route: /crm/sollu — Sollu CRM pipeline view
// Called by: Next.js router (page route, no direct code imports)
// Existing pages confirmed: none in /crm/ directory
// Data read: crm_leads + crm_stages(name), fields listed in mapToLead below

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { getSolluPipeline } from '@/app/actions/leads'
import { LeadsDataTable } from '@/components/ui/leads-data-table'
import type { Lead } from '@/components/ui/leads-data-table'
import { Users } from 'lucide-react'

const SOLLU_COLOR = '#2563EB'

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days}d atrás`
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`
  return `${Math.floor(days / 30)}m atrás`
}

function deriveStatus(dbStatus: string, stageName: string): Lead['status'] {
  if (dbStatus === 'won') return 'fechado'
  if (dbStatus === 'lost') return 'perdido'
  const n = stageName.toLowerCase()
  if (n.includes('fechando') || n.includes('proposta') || n.includes('negocia')) return 'fechando'
  if (n.includes('prospect') || n.includes('qualif')) return 'prospect'
  return 'novo'
}

function deriveProbability(raw: string | null): Lead['probability'] {
  if (raw === 'médio' || raw === 'alto') return raw
  return 'baixo'
}

type LeadRow = {
  id: string
  name: string
  email: string | null
  source: string | null
  source_type: string | null
  status: string
  value: number | null
  probability: string | null
  updated_at: string
  crm_stages: { name: string } | null
}

function mapToLead(row: LeadRow): Lead {
  const stageName = row.crm_stages?.name ?? ''
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    source: row.source ?? stageName,
    sourceType: row.source_type === 'campanha' ? 'campanha' : 'organico',
    status: deriveStatus(row.status, stageName),
    size: row.value ?? 0,
    interest: [],
    probability: deriveProbability(row.probability),
    lastAction: relativeDate(row.updated_at),
  }
}

export default async function SolluPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const pipelineResult = await getSolluPipeline()

  let leads: Lead[] = []

  if (pipelineResult.data) {
    const { data } = await supabase
      .from('crm_leads')
      .select('id, name, email, source, source_type, status, value, probability, updated_at, crm_stages(name)')
      .eq('workspace_id', workspaceId)
      .eq('pipeline_id', pipelineResult.data.id)
      .order('created_at', { ascending: false })

    leads = (data ?? []).map((row) => mapToLead(row as LeadRow))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Sollu — CRM</h1>
          <p className="text-sm font-medium text-muted mt-1">Pipeline de vendas e acompanhamento de leads</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px] shadow-current"
            style={{ backgroundColor: SOLLU_COLOR, color: SOLLU_COLOR }}
          />
          <span className="text-xs font-bold text-foreground opacity-80">Sollu</span>
        </div>
      </div>

      {pipelineResult.error ? (
        <div className="glass-card rounded-[2rem] px-6 py-10 text-center">
          <Users className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-muted">Pipeline Sollu não inicializado.</p>
          <p className="text-xs text-muted mt-1">Verifique as configurações do workspace.</p>
        </div>
      ) : (
        <LeadsDataTable leads={leads} tenantColor={SOLLU_COLOR} />
      )}
    </div>
  )
}
