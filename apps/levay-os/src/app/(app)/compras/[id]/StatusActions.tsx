'use client'

import { useState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, ShoppingBag, Package, X } from 'lucide-react'
import { updateProcurementStatus } from '@/app/actions/procurement'
import type { ProcurementStatus } from '@/components/procurement/ProcurementStatusPill'

interface StatusActionsProps {
  requestId: string
  currentStatus: ProcurementStatus
}

const NEXT_ACTION: Partial<Record<ProcurementStatus, { label: string; nextStatus: 'consolidado' | 'comprado' | 'recebido'; icon: React.ReactNode }>> = {
  solicitado: { label: 'Consolidar pedido', nextStatus: 'consolidado', icon: <CheckCircle2 className="w-4 h-4" /> },
  consolidado: { label: 'Registrar compra', nextStatus: 'comprado', icon: <ShoppingBag className="w-4 h-4" /> },
  comprado: { label: 'Confirmar recebimento', nextStatus: 'recebido', icon: <Package className="w-4 h-4" /> },
}

export function StatusActions({ requestId, currentStatus }: StatusActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const nextAction = NEXT_ACTION[currentStatus]
  const canCancel = currentStatus !== 'recebido' && currentStatus !== 'cancelado'

  if (!nextAction && !canCancel) return null

  const handleAdvance = () => {
    if (!nextAction) return
    setError(null)
    startTransition(async () => {
      const result = await updateProcurementStatus(requestId, nextAction.nextStatus)
      if (result.error) setError(result.error)
    })
  }

  const handleCancel = () => {
    if (!confirming) { setConfirming(true); return }
    setError(null)
    setConfirming(false)
    startTransition(async () => {
      const result = await updateProcurementStatus(requestId, 'cancelado')
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {nextAction && (
          <button
            onClick={handleAdvance}
            disabled={isPending}
            className="flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-foreground text-background text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {nextAction.icon}
            {isPending ? 'Salvando...' : nextAction.label}
          </button>
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className={`flex items-center gap-2 min-h-[44px] px-4 rounded-full border text-sm font-medium transition-all disabled:opacity-40 ${
              confirming
                ? 'border-red-500 text-red-500 bg-red-500/10'
                : 'border-border text-muted hover:text-foreground hover:border-foreground/30'
            }`}
          >
            <X className="w-4 h-4" />
            {confirming ? 'Confirmar cancelamento' : 'Cancelar'}
          </button>
        )}
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Voltar
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
