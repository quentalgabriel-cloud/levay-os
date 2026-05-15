'use client'

import { useState } from 'react'
import { createTask } from '@/app/actions'

interface Props {
  companies: { id: string; name: string; color: string | null }[]
  onClose: () => void
}

export default function NewTaskForm({ companies, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createTask(new FormData(e.currentTarget))
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 transition-all duration-500">
      <div className="bg-card border border-border rounded-[2rem] w-full max-w-lg space-y-4 p-8 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Nova tarefa</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/5 text-muted hover:text-foreground transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Título</label>
            <input
              name="title"
              required
              placeholder="O que precisa ser feito?"
              autoFocus
              className="w-full bg-foreground/[0.03] border border-border rounded-2xl px-5 py-4 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
              Movimento mínimo <span className="text-red-500">*</span>
            </label>
            <input
              name="minimum_movement"
              required
              placeholder="Menor ação possível para destravar (< 30min)"
              className="w-full bg-foreground/[0.03] border border-border rounded-2xl px-5 py-4 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Empresa</label>
              <select
                name="company_id"
                className="w-full bg-foreground/[0.03] border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                <option value="">Selecione...</option>
                {companies.map((co) => (
                  <option key={co.id} value={co.id}>{co.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Prazo</label>
              <input
                name="due_at"
                type="date"
                className="w-full bg-foreground/[0.03] border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-full border border-border text-sm font-bold text-muted hover:bg-foreground/5 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-full bg-accent hover:opacity-90 disabled:opacity-50 text-sm text-white font-bold shadow-lg shadow-accent/25 transition-all active:scale-95"
            >
              {loading ? 'Salvando...' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
