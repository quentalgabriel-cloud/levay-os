import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { ProcurementCard, type ProcurementRequestCardData } from '@/components/procurement/ProcurementCard'
import { ShoppingCart, Plus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { ProcurementStatus } from '@/components/procurement/ProcurementStatusPill'

const STATUS_ORDER: ProcurementStatus[] = ['solicitado', 'consolidado', 'comprado', 'recebido']

const STATUS_LABELS: Record<ProcurementStatus, string> = {
  solicitado: 'Solicitados',
  consolidado: 'Consolidados',
  comprado: 'Comprados',
  recebido: 'Recebidos',
  cancelado: 'Cancelados',
  rupture: 'Rupturas',
}

export default async function ComprasPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: rows } = await (supabase as any)
    .from('procurement_requests')
    .select(`
      id, title, status, needed_by, estimated_total,
      exception_flagged, exception_reason,
      companies (name, color),
      procurement_items (id)
    `)
    .eq('workspace_id', workspaceId)
    .neq('status', 'cancelado')
    .order('needed_by', { ascending: true })

  type ProcurementRow = {
    id: string
    title: string
    status: string
    needed_by: string
    estimated_total: number | null
    exception_flagged: boolean | null
    exception_reason: string | null
    companies: { name: string; color: string } | { name: string; color: string }[] | null
    procurement_items: { id: string }[] | null
  }

  const requests: ProcurementRequestCardData[] = (rows ?? []).map((row: ProcurementRow) => {
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies
    return {
      id: row.id,
      title: row.title,
      company_name: (company as { name: string; color: string } | null)?.name ?? '—',
      company_color: (company as { name: string; color: string } | null)?.color ?? '#94a3b8',
      needed_by: row.needed_by,
      status: row.status as ProcurementStatus,
      estimated_total: row.estimated_total ? String(row.estimated_total) : null,
      items_count: Array.isArray(row.procurement_items) ? row.procurement_items.length : 0,
      exception_flagged: row.exception_flagged ?? false,
      exception_reason: row.exception_reason ?? null,
    }
  })

  const byStatus = STATUS_ORDER.reduce<Record<string, ProcurementRequestCardData[]>>(
    (acc, s) => ({ ...acc, [s]: requests.filter(r => r.status === s) }),
    {}
  )

  const total = requests.length
  const exceptions = requests.filter(r => r.exception_flagged).length

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Compras</h1>
          <p className="text-sm text-muted mt-0.5">
            {total > 0 ? `${total} pedido${total !== 1 ? 's' : ''} em aberto` : 'Sem pedidos no momento'}
            {exceptions > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-500 font-medium">
                <AlertTriangle className="w-3 h-3" />
                {exceptions} exceção{exceptions > 1 ? 'ões' : ''}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/compras/nova"
          className="flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo pedido
        </Link>
      </div>

      {total === 0 ? (
        <div className="text-center py-24">
          <ShoppingCart className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted">Nenhum pedido em aberto</p>
          <p className="text-xs text-muted mt-1 opacity-60">
            Lance o primeiro pedido pelo botão acima
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_ORDER.map(status => {
            const cards = byStatus[status] ?? []
            return (
              <section key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                    {STATUS_LABELS[status]}
                  </h2>
                  {cards.length > 0 && (
                    <span className="text-xs font-bold text-muted bg-muted/20 px-2 py-0.5 rounded-full">
                      {cards.length}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {cards.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-8 text-center">
                      <p className="text-xs text-muted/40">Nenhum</p>
                    </div>
                  ) : (
                    cards.map((req, i) => (
                      <ProcurementCard key={req.id} request={req} index={i} />
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
