'use client'

import { useState } from 'react'
import { List, Kanban } from 'lucide-react'
import { motion } from 'framer-motion'
import { CrmKanban, type KanbanStage, type KanbanLead } from '@/components/crm/CrmKanban'
import { LeadsDataTable, type Lead } from '@/components/ui/leads-data-table'

interface CrmKanbanBoardProps {
  stages: KanbanStage[]
  leads: Lead[]
  pipelineId: string
  tenantColor: string
}

type ViewMode = 'kanban' | 'table'

export function CrmKanbanBoard({ stages, leads, pipelineId, tenantColor }: CrmKanbanBoardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  const leadsForKanban: KanbanLead[] = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    phone: lead.email || null,
    email: lead.email,
    source: lead.source,
    notes: null,
    stageId: lead.stageId
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tabela
          </button>
        </div>
      </div>

      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
{viewMode === 'kanban' ? (
          <CrmKanban
            stages={stages}
            leads={leadsForKanban}
            pipelineId={pipelineId}
            tenantColor={tenantColor}
          />
        ) : (
          <LeadsDataTable leads={leads} tenantColor={tenantColor} />
        )}
      </motion.div>
    </div>
  )
}