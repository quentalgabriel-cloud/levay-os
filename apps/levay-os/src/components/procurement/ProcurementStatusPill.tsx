/**
 * ProcurementStatusPill — badge de status para procurement_requests
 *
 * Mapeia o status do CHECK constraint (ver supabase/migrations/20260514_100_procurement_sprint1.sql)
 * para cor + label semântico em PT-BR.
 *
 * Padrão visual: segue TaskCard (rounded-full, bg/10 + text + border/20).
 */

export type ProcurementStatus =
  | 'solicitado'
  | 'consolidado'
  | 'comprado'
  | 'recebido'
  | 'cancelado'
  | 'rupture'

const STATUS_CONFIG: Record<
  ProcurementStatus,
  { label: string; classes: string }
> = {
  solicitado: {
    label: 'Solicitado',
    classes: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  },
  consolidado: {
    label: 'Consolidado',
    classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  comprado: {
    label: 'Comprado',
    classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  recebido: {
    label: 'Recebido',
    classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  cancelado: {
    label: 'Cancelado',
    classes: 'bg-muted/10 text-muted border-muted/20',
  },
  rupture: {
    label: 'Ruptura',
    classes: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

interface ProcurementStatusPillProps {
  status: ProcurementStatus
  size?: 'sm' | 'md'
}

export function ProcurementStatusPill({
  status,
  size = 'sm',
}: ProcurementStatusPillProps) {
  const cfg = STATUS_CONFIG[status]
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${sizeClass} ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  )
}

export const PROCUREMENT_STATUS_LABELS: Record<ProcurementStatus, string> =
  Object.fromEntries(
    Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])
  ) as Record<ProcurementStatus, string>
