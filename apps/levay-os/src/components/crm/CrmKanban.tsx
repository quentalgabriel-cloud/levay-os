'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Plus, X, ChevronDown } from 'lucide-react'
import { updateLeadStage, createLead, getSolluStages, type CreateLeadInput } from '@/app/actions/leads'
import { useTransition } from 'react'

export interface KanbanStage {
  id: string
  name: string
  color: string
  position: number
}

export interface KanbanLead {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  source?: string | null
  notes?: string | null
  next_follow_up_at?: string | null
  stageId?: string
}

interface CrmKanbanProps {
  stages: KanbanStage[]
  leads: KanbanLead[]
  pipelineId: string
  tenantColor?: string
}

export function CrmKanban({ stages, leads, pipelineId, tenantColor = '#2563EB' }: CrmKanbanProps) {
  const [isPending, startTransition] = useTransition()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [draggedLead, setDraggedLead] = useState<string | null>(null)

  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(lead => lead.stageId === stage.id)
    return acc
  }, {} as Record<string, KanbanLead[]>)

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = useCallback((stageId: string) => {
    if (draggedLead) {
      startTransition(async () => {
        await updateLeadStage({ leadId: draggedLead, stageId })
      })
      setDraggedLead(null)
    }
  }, [draggedLead])

  const openCreateModal = (stageId: string) => {
    setSelectedStage(stageId)
    setShowCreateModal(true)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex-shrink-0 w-[280px] bg-card/50 rounded-2xl border border-border/50 flex flex-col max-h-[calc(100vh-200px)]"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(stage.id)}
        >
          <div className="p-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-sm font-semibold text-foreground">{stage.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted bg-muted/30 px-2 py-0.5 rounded-full">
                {leadsByStage[stage.id]?.length ?? 0}
              </span>
              <button
                onClick={() => openCreateModal(stage.id)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {(leadsByStage[stage.id] ?? []).map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  draggable
                  onDragStart={() => handleDragStart(lead.id)}
                  className="p-3 bg-background rounded-xl border border-border hover:border-foreground/20 hover:shadow-md cursor-grab active:cursor-grabbing transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-muted/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                      {lead.phone && (
                        <p className="text-xs text-muted truncate mt-0.5">{lead.phone}</p>
                      )}
                      {lead.source && (
                        <p className="text-[10px] font-medium text-muted/70 mt-1 truncate">
                          {lead.source}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {(leadsByStage[stage.id]?.length ?? 0) === 0 && (
              <div className="text-center py-8 text-muted/50">
                <p className="text-xs">Nenhum lead</p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border/50">
            <button
              onClick={() => openCreateModal(stage.id)}
              className="w-full py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar lead
            </button>
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {showCreateModal && selectedStage && (
          <CreateLeadModal
            stageId={selectedStage}
            pipelineId={pipelineId}
            onClose={() => setShowCreateModal(false)}
            tenantColor={tenantColor}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CreateLeadModal({
  stageId,
  pipelineId,
  onClose,
  tenantColor
}: {
  stageId: string
  pipelineId: string
  onClose: () => void
  tenantColor: string
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      await createLead({
        name: name.trim(),
        stageId,
        pipelineId,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        source: source.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onClose()
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Novo Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Nome do lead"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Origem</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Website, indicação, evento..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              placeholder="Observações sobre o lead..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full py-2.5 bg-accent text-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Criando...' : 'Criar Lead'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}