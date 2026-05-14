'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, X } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  color?: string
}

interface EventAgendaProps {
  events?: CalendarEvent[]
  className?: string
  onAddServer?: (title: string, date: string, time?: string) => Promise<{ error?: string }>
  onRemoveServer?: (id: string) => Promise<{ error?: string }>
}

function formatGroup(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00')
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]

  if (dateKey === todayStr) return 'Hoje'
  if (dateKey === tomorrowStr) return 'Amanhã'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).format(date)
}

function groupByDate(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const map = new Map<string, CalendarEvent[]>()
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  for (const ev of sorted) {
    const key = ev.date.split('T')[0]
    const group = map.get(key) ?? []
    map.set(key, [...group, ev])
  }
  return Array.from(map.entries())
}

export function EventAgenda({ events: initial = [], className = '', onAddServer, onRemoveServer }: EventAgendaProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initial)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const groups = groupByDate(events)

  async function handleAdd() {
    if (!title.trim() || !date) return
    const optimistic: CalendarEvent = { id: crypto.randomUUID(), title: title.trim(), date, time: time || undefined }
    setEvents(prev => [...prev, optimistic])
    setTitle('')
    setDate('')
    setTime('')
    setAdding(false)

    if (onAddServer) {
      const result = await onAddServer(optimistic.title, optimistic.date, optimistic.time)
      if (result?.error) setEvents(prev => prev.filter(e => e.id !== optimistic.id))
    }
  }

  async function handleRemove(id: string) {
    const snapshot = events
    setEvents(prev => prev.filter(e => e.id !== id))

    if (onRemoveServer) {
      const result = await onRemoveServer(id)
      if (result?.error) setEvents(snapshot)
    }
  }

  return (
    <div className={`glass-card rounded-[2rem] flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.02]">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-accent" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Agenda</h2>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="w-7 h-7 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 active:scale-[0.92]"
          aria-label="Adicionar evento"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border bg-foreground/[0.02] flex flex-col gap-2.5">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nome do evento..."
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-full text-sm bg-background border border-border rounded-2xl px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-200"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="flex-1 text-sm bg-background border border-border rounded-2xl px-4 py-2.5 text-foreground focus:outline-none focus:border-accent transition-colors duration-200"
                />
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-28 text-sm bg-background border border-border rounded-2xl px-4 py-2.5 text-foreground focus:outline-none focus:border-accent transition-colors duration-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-[0.15em] hover:opacity-90 active:scale-[0.98] transition-all duration-300"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto max-h-[22rem] py-4 px-2">
        {groups.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
            Sem eventos agendados.
          </p>
        ) : (
          groups.map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="mb-4 last:mb-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted px-5 mb-2 capitalize">
                {formatGroup(dateKey)}
              </p>
              <AnimatePresence>
                {dayEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, transition: { duration: 0.15 } }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group flex items-center gap-3 px-5 py-3.5 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_6px] shadow-current"
                      style={{ backgroundColor: ev.color ?? 'var(--accent)', color: ev.color ?? 'var(--accent)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                      {ev.time && (
                        <p className="text-[11px] font-medium text-muted">{ev.time}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(ev.id)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                      aria-label="Remover evento"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
