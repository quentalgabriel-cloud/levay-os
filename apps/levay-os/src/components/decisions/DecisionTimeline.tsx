'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Scale, 
  Building2, 
  GitCommit,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Decision {
  id: string
  title: string
  decision_type: string
  reversibility: string
  decided_at: string
  practical_change?: string | null
  companies?: { name: string; color: string | null } | null
}

interface DecisionTimelineProps {
  decisions: Decision[]
}

type GroupKey = string

function getGroupKey(dateStr: string): GroupKey {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatGroupKey(key: GroupKey): string {
  const [year, month] = key.split('-')
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<GroupKey>>(() => {
    const groups = new Set(decisions.map(d => getGroupKey(d.decided_at)))
    return groups
  })
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)

  const grouped = decisions.reduce((acc, d) => {
    const key = getGroupKey(d.decided_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {} as Record<GroupKey, Decision[]>)

  const sortedGroups = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const toggleGroup = (key: GroupKey) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'estrategica': return 'bg-blue-500'
      case 'operacional': return 'bg-emerald-500'
      case 'financeira': return 'bg-amber-500'
      case 'pessoal': return 'bg-violet-500'
      default: return 'bg-slate-500'
    }
  }

  const getReversibilityBadge = (r: string) => {
    switch (r) {
      case 'reversivel': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'parcialmente_reversivel': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'irreversivel': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }
  }

  if (!decisions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <Scale className="w-12 h-12 mb-4 opacity-50" />
        <p>Nenhuma decisão registrada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        {sortedGroups.map((groupKey, groupIndex) => {
          const groupDecisions = grouped[groupKey]
          const isExpanded = expandedGroups.has(groupKey)

          return (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="mb-6"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="flex items-center gap-3 mb-4 w-full text-left group"
              >
                <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center">
                  <span className="text-xs font-bold text-muted">
                    {groupDecisions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {formatGroupKey(groupKey)}
                  </h3>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-foreground" />
                  )}
                </div>
              </button>

              {/* Group Decisions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 ml-5 pl-[22px]"
                  >
                    {groupDecisions.map((decision, idx) => {
                      const co = decision.companies
                      const isSelected = selectedDecision === decision.id

                      return (
                        <motion.div
                          key={decision.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="relative"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[22px] top-4 w-3 h-3 rounded-full bg-accent border-2 border-card" />

                          <div
                            onClick={() => setSelectedDecision(isSelected ? null : decision.id)}
                            className={`p-4 bg-card border rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-accent/50 shadow-md' 
                                : 'border-border hover:border-accent/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {co && (
                                <div
                                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: co.color ?? '#6b7280' }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`w-2 h-2 rounded-full ${getTypeColor(decision.decision_type)}`} />
                                  <span className="text-xs font-medium text-muted uppercase">
                                    {decision.decision_type.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-muted">·</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getReversibilityBadge(decision.reversibility)}`}>
                                    {decision.reversibility?.replace('_', ' ') ?? '—'}
                                  </span>
                                </div>
                                <h4 className="font-medium text-sm text-foreground line-clamp-2">
                                  {decision.title}
                                </h4>
                                {decision.practical_change && (
                                  <p className="text-xs text-muted mt-2 line-clamp-2">
                                    {decision.practical_change}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted">
                                  {co && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {co.name}
                                    </span>
                                  )}
                                  <span className="ml-auto">
                                    {new Date(decision.decided_at).toLocaleDateString('pt-BR', { 
                                      day: '2-digit', 
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className={`w-4 h-4 text-muted transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}