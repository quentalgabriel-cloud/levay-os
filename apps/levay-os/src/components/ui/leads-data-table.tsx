'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'

export interface Lead {
  id: string
  name: string
  email: string
  source: string
  sourceType: 'organico' | 'campanha'
  status: 'prospect' | 'fechado' | 'perdido' | 'fechando' | 'novo'
  size: number
  interest: number[]
  probability: 'baixo' | 'médio' | 'alto'
  lastAction: string
  stageId?: string
}

interface LeadsDataTableProps {
  leads?: Lead[]
  tenantColor?: string
  className?: string
}

const STATUS_STYLES: Record<Lead['status'], string> = {
  novo: 'bg-info/10 text-info border-info/20',
  prospect: 'bg-muted/10 text-muted border-muted/10',
  fechando: 'bg-warning/10 text-warning border-warning/20',
  fechado: 'bg-success/10 text-success border-success/20',
  perdido: 'bg-destructive/10 text-destructive border-destructive/20',
}

const STATUS_LABEL: Record<Lead['status'], string> = {
  novo: 'Novo',
  prospect: 'Prospect',
  fechando: 'Fechando',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

const PROB_STYLES: Record<Lead['probability'], string> = {
  baixo: 'bg-destructive/10 text-destructive',
  médio: 'bg-warning/10 text-warning',
  alto: 'bg-success/10 text-success',
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 48
  const h = 20
  const step = w / (data.length - 1)
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ')
  const last = data[data.length - 1]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <circle
        cx={(data.length - 1) * step}
        cy={h - ((last - min) / range) * h}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

type SortKey = 'name' | 'size' | 'probability' | 'status'
const PROB_ORDER: Record<Lead['probability'], number> = { baixo: 0, médio: 1, alto: 2 }

export function LeadsDataTable({ leads: initial = [], tenantColor, className = '' }: LeadsDataTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const accentHex = tenantColor ?? '#FBBF24'
  const accentVar = tenantColor ?? 'var(--accent)'

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortAsc(a => !a)
    else { setSortKey(col); setSortAsc(true) }
  }

  const filtered = initial
    .filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'size') cmp = a.size - b.size
      else if (sortKey === 'probability') cmp = PROB_ORDER[a.probability] - PROB_ORDER[b.probability]
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      return sortAsc ? cmp : -cmp
    })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortAsc
      ? <ChevronUp className="w-3 h-3" style={{ color: accentVar }} />
      : <ChevronDown className="w-3 h-3" style={{ color: accentVar }} />
  }

  function ColHead({ col, label }: { col: SortKey; label: string }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors duration-200"
      >
        {label}
        <SortIcon col={col} />
      </button>
    )
  }

  return (
    <div className={`glass-card rounded-[2rem] flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">CRM — Leads</h2>
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${accentHex}20`, color: accentVar }}
        >
          {filtered.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full text-sm bg-background border border-border rounded-2xl pl-9 pr-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3"><ColHead col="name" label="Lead" /></th>
              <th className="text-left px-3 py-3 hidden md:table-cell"><ColHead col="status" label="Status" /></th>
              <th className="text-left px-3 py-3 hidden lg:table-cell"><ColHead col="size" label="Ticket" /></th>
              <th className="text-left px-3 py-3 hidden xl:table-cell">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">Interesse</span>
              </th>
              <th className="text-left px-3 py-3"><ColHead col="probability" label="Prob." /></th>
              <th className="text-left px-5 py-3 hidden lg:table-cell">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">Última ação</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted italic">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="border-b border-border/50 hover:bg-foreground/[0.02] transition-colors duration-200 cursor-pointer"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground truncate max-w-[160px]">{lead.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-muted truncate max-w-[100px]">{lead.source}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${lead.sourceType === 'organico' ? 'bg-success/10 text-success border-success/20' : 'bg-info/10 text-info border-info/20'}`}>
                          {lead.sourceType === 'organico' ? 'Orgânico' : 'Campanha'}
                        </span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-4 hidden md:table-cell">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[lead.status]}`}>
                        {STATUS_LABEL[lead.status]}
                      </span>
                    </td>
                    {/* Ticket */}
                    <td className="px-3 py-4 hidden lg:table-cell">
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {lead.size.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    {/* Sparkline */}
                    <td className="px-3 py-4 hidden xl:table-cell">
                      <Sparkline data={lead.interest} color={accentHex} />
                    </td>
                    {/* Probability */}
                    <td className="px-3 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${PROB_STYLES[lead.probability]}`}>
                        {lead.probability}
                      </span>
                    </td>
                    {/* Last action */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-xs text-muted truncate max-w-[180px]">{lead.lastAction}</p>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
