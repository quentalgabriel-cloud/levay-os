import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertTriangle, Calendar, Package,
  ClipboardList, History,
} from 'lucide-react'
import { ProcurementStatusPill, type ProcurementStatus } from '@/components/procurement/ProcurementStatusPill'
import { StatusActions } from './StatusActions'
import { formatBRL, toCents } from '@/lib/money'

function fmtDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', opts ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
  } catch { return iso }
}

function fmtDatetime(iso: string | null | undefined): string {
  return fmtDate(iso, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const EVENT_LABELS: Record<string, string> = {
  created: 'Pedido criado',
  item_added: 'Item adicionado',
  item_removed: 'Item removido',
  consolidated: 'Pedido consolidado',
  sent_to_supplier: 'Enviado ao fornecedor',
  supplier_confirmed: 'Fornecedor confirmou',
  received: 'Recebimento confirmado',
  exception_flagged: 'Exceção sinalizada',
  exception_resolved: 'Exceção resolvida',
  cancelled: 'Pedido cancelado',
  rupture_detected: 'Ruptura detectada',
}

type ProcurementItem = {
  id: string
  description: string
  unit: string
  quantity_requested: number
  quantity_received: number | null
  estimated_unit_price: number | null
  actual_unit_price: number | null
  line_total: number | null
  item_status: string
  notes: string | null
}

type HistoryEvent = {
  id: string
  event_type: string
  created_at: string
}

type DetailRow = {
  id: string
  title: string
  status: string
  needed_by: string
  notes: string | null
  estimated_total: number | null
  actual_total: number | null
  exception_flagged: boolean
  exception_reason: string | null
  requested_at: string
  request_number: number | null
  companies: { name: string; color: string } | { name: string; color: string }[] | null
  procurement_items: ProcurementItem[]
  procurement_history: HistoryEvent[]
}

export default async function ProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: raw, error } = await supabase
    .from('procurement_requests')
    .select(`
      id, title, status, needed_by, notes,
      estimated_total, actual_total,
      exception_flagged, exception_reason,
      requested_at, request_number,
      companies (id, name, color),
      procurement_items (
        id, description, unit, notes,
        quantity_requested, quantity_received,
        estimated_unit_price, actual_unit_price, line_total,
        item_status
      ),
      procurement_history (
        id, event_type, created_at
      )
    `)
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .order('created_at', { referencedTable: 'procurement_history', ascending: false })
    .single()

  if (error || !raw) notFound()

  const request = raw as DetailRow
  const company = Array.isArray(request.companies) ? request.companies[0] : request.companies
  const items: ProcurementItem[] = Array.isArray(request.procurement_items) ? request.procurement_items : []
  const history: HistoryEvent[] = Array.isArray(request.procurement_history) ? request.procurement_history : []

  const totalLinesCents = items.reduce((sum, item) => {
    if (item.line_total != null) return sum + toCents(String(item.line_total))
    const price = item.actual_unit_price ?? item.estimated_unit_price
    if (!price) return sum
    const qty = item.quantity_received ?? item.quantity_requested
    return sum + toCents(String(price * qty))
  }, BigInt(0))

  const displayTotal = request.actual_total
    ? toCents(String(request.actual_total))
    : request.estimated_total
      ? toCents(String(request.estimated_total))
      : totalLinesCents

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="space-y-4">
        <Link
          href="/compras"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Compras
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {company && (
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: company.color }}
                  aria-hidden
                />
                <span className="text-xs uppercase tracking-wide text-muted font-medium">
                  {company.name}
                  {request.request_number != null && (
                    <span className="ml-2 opacity-50">#{request.request_number}</span>
                  )}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground tracking-tight">{request.title}</h1>
          </div>
          <ProcurementStatusPill status={request.status as ProcurementStatus} size="md" />
        </div>

        {request.exception_flagged && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Exceção sinalizada</p>
              {request.exception_reason && (
                <p className="text-xs mt-0.5 opacity-80">{request.exception_reason}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Precisa até {fmtDate(request.needed_by)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
          {displayTotal > BigInt(0) && (
            <span className="font-medium text-foreground tabular-nums">
              {formatBRL(displayTotal)}
            </span>
          )}
        </div>

        <StatusActions requestId={request.id} currentStatus={request.status as ProcurementStatus} exceptionFlagged={request.exception_flagged} />
      </div>

      {/* Itens */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold text-foreground">Itens</h2>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Descrição</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted">Qtd</th>
                <th className="text-left px-2 py-2.5 text-xs font-medium text-muted">Un</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted hidden sm:table-cell">R$/un</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const unitPrice = item.actual_unit_price ?? item.estimated_unit_price
                const lineCents = item.line_total != null
                  ? toCents(String(item.line_total))
                  : unitPrice
                    ? toCents(String(unitPrice * (item.quantity_received ?? item.quantity_requested)))
                    : null

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-card/30' : ''}`}
                  >
                    <td className="px-4 py-3 text-foreground">
                      <span className="font-medium">{item.description}</span>
                      {item.notes && (
                        <p className="text-xs text-muted mt-0.5">{item.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {item.quantity_received != null
                        ? `${item.quantity_received} / ${item.quantity_requested}`
                        : item.quantity_requested}
                    </td>
                    <td className="px-2 py-3 text-muted">{item.unit}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted hidden sm:table-cell">
                      {unitPrice ? formatBRL(toCents(String(unitPrice))) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {lineCents ? formatBRL(lineCents) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {totalLinesCents > BigInt(0) && (
              <tfoot>
                <tr className="border-t border-border bg-card/50">
                  <td colSpan={4} className="px-4 py-3 text-xs font-medium text-muted text-right">
                    Total estimado
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                    {formatBRL(totalLinesCents)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* Observações */}
      {request.notes && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Observações</h2>
          <p className="text-sm text-muted bg-card border border-border rounded-xl px-4 py-3 whitespace-pre-wrap">
            {request.notes}
          </p>
        </section>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
          </div>
          <ul>
            {history.map((event, i) => (
              <li key={event.id} className="flex gap-3 relative">
                {i < history.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" aria-hidden />
                )}
                <div className="w-3.5 h-3.5 rounded-full bg-card border-2 border-border mt-1 shrink-0 z-10" />
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">
                    {EVENT_LABELS[event.event_type] ?? event.event_type}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{fmtDatetime(event.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
