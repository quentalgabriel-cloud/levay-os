'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, Package } from 'lucide-react'
import { ProcurementStatusPill, type ProcurementStatus } from './ProcurementStatusPill'
import { formatBRL, toCents } from '@/lib/money'

export interface ProcurementRequestCardData {
  id: string
  title: string
  company_name: string
  company_color: string
  needed_by: string
  status: ProcurementStatus
  estimated_total: string | null
  items_count: number
  exception_flagged: boolean
  exception_reason: string | null
}

interface ProcurementCardProps {
  request: ProcurementRequestCardData
  onClick?: (id: string) => void
  index?: number
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export function ProcurementCard({ request, onClick, index = 0 }: ProcurementCardProps) {
  const days = daysUntil(request.needed_by)
  const isOverdue = days < 0 && request.status !== 'recebido' && request.status !== 'cancelado'
  const isUrgent = days >= 0 && days <= 1 && request.status === 'solicitado'

  const totalCents = request.estimated_total ? toCents(request.estimated_total) : null

  const handleClick = () => onClick?.(request.id)

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      onClick={handleClick}
      className="w-full text-left relative overflow-hidden bg-card border border-border rounded-2xl p-4 hover:bg-foreground/[0.02] hover:shadow-md transition-all"
    >
      {request.exception_flagged && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: request.company_color }}
              aria-hidden
            />
            <span className="text-[11px] uppercase tracking-wide text-muted font-medium">
              {request.company_name}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">
            {request.title}
          </h3>
        </div>
        <ProcurementStatusPill status={request.status} />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-muted">
          <span className="inline-flex items-center gap-1">
            <Package className="w-3 h-3" />
            {request.items_count} {request.items_count === 1 ? 'item' : 'itens'}
          </span>
          <span
            className={`inline-flex items-center gap-1 ${
              isOverdue ? 'text-red-500 font-medium' : isUrgent ? 'text-amber-500 font-medium' : ''
            }`}
          >
            <Calendar className="w-3 h-3" />
            {formatDate(request.needed_by)}
            {isOverdue && ' • atrasado'}
            {isUrgent && !isOverdue && ' • hoje'}
          </span>
        </div>
        {totalCents !== null && (
          <span className="text-foreground font-medium tabular-nums">
            {formatBRL(totalCents)}
          </span>
        )}
      </div>

      {request.exception_flagged && request.exception_reason && (
        <div className="mt-3 pt-3 border-t border-border flex items-start gap-2 text-xs text-red-500">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{request.exception_reason}</span>
        </div>
      )}
    </motion.button>
  )
}
