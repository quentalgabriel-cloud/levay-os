'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { createProcurementRequest } from '@/app/actions/procurement'

export interface CompanyOption {
  id: string
  name: string
  color: string
  escopo: 'BICA' | 'AMP213' | 'SOLLU' | 'PESSOAL_ERICK' | 'GERAL'
}

interface NewProcurementFormProps {
  companies: CompanyOption[]
}

interface ItemDraft {
  description: string
  unit: string
  quantity: string
  estimatedUnitPrice: string
}

const EMPTY_ITEM: ItemDraft = {
  description: '',
  unit: 'un',
  quantity: '',
  estimatedUnitPrice: '',
}

const UNIT_OPTIONS = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'fardo', 'dz'] as const

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function NewProcurementForm({ companies }: NewProcurementFormProps) {
  const router = useRouter()
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [neededBy, setNeededBy] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ItemDraft[]>([{ ...EMPTY_ITEM }])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : 'pending-uuid'
  )

  const updateItem = (index: number, patch: Partial<ItemDraft>) => {
    setItems(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (index: number) =>
    setItems(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validItems = items
      .filter(item => item.description.trim() && item.quantity.trim())
      .map(item => ({
        description: item.description.trim(),
        unit: item.unit,
        quantity_requested: parseFloat(item.quantity),
        estimated_unit_price: item.estimatedUnitPrice ? parseFloat(item.estimatedUnitPrice) : null,
      }))

    if (!validItems.length) {
      setError('Preencha ao menos 1 item com descrição e quantidade.')
      return
    }

    startTransition(async () => {
      const result = await createProcurementRequest({
        idempotency_key: idempotencyKey,
        company_id: companyId,
        title,
        needed_by: neededBy,
        notes: notes || null,
        items: validItems,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/compras')
    })
  }

  const selectedCompany = companies.find(c => c.id === companyId)
  const validItemCount = items.filter(i => i.description.trim() && i.quantity.trim()).length
  const canSubmit = !!title.trim() && validItemCount > 0 && !!companyId && !isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted block mb-2">Unidade</label>
          <div className="grid grid-cols-3 gap-2">
            {companies.map(company => {
              const isSelected = companyId === company.id
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setCompanyId(company.id)}
                  className={`flex items-center justify-center gap-2 min-h-[48px] rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-foreground bg-foreground/[0.03] text-foreground'
                      : 'border-border text-muted hover:text-foreground'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: company.color }}
                    aria-hidden
                  />
                  {company.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="text-xs font-medium text-muted block mb-2">
            Título do pedido
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Ex: Compras quarta — ${selectedCompany?.name ?? ''}`}
            className="w-full min-h-[48px] px-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="needed_by" className="text-xs font-medium text-muted block mb-2">
            Precisa até
          </label>
          <input
            id="needed_by"
            type="date"
            value={neededBy}
            onChange={e => setNeededBy(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Itens</h2>
          <span className="text-xs text-muted">
            {validItemCount} preenchido{validItemCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(index, { description: e.target.value })}
                  placeholder="Ex: Alface americana"
                  className="flex-1 min-h-[44px] px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label="Remover item"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={e => updateItem(index, { quantity: e.target.value })}
                  placeholder="Qtd"
                  className="min-h-[44px] px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted text-center tabular-nums focus:outline-none focus:border-accent"
                />
                <select
                  value={item.unit}
                  onChange={e => updateItem(index, { unit: e.target.value })}
                  className="min-h-[44px] px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  {UNIT_OPTIONS.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.estimatedUnitPrice}
                  onChange={e => updateItem(index, { estimatedUnitPrice: e.target.value })}
                  placeholder="R$ un"
                  className="min-h-[44px] px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted text-center tabular-nums focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar item
        </button>
      </section>

      <section>
        <label htmlFor="notes" className="text-xs font-medium text-muted block mb-2">
          Observação (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Detalhes que ajudem a Thaynan ou o fornecedor..."
          className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </section>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full min-h-[52px] rounded-full bg-foreground text-background font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {isPending ? 'Enviando...' : 'Enviar pedido'}
      </button>
    </form>
  )
}
