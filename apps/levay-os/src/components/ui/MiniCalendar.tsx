'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface CalendarEvent {
  date: string
}

interface MiniCalendarProps {
  selectedDate?: Date
  events?: CalendarEvent[]
  onDateClick?: (date: Date) => void
  className?: string
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function MiniCalendar({
  selectedDate,
  events = [],
  onDateClick,
  className = '',
}: MiniCalendarProps) {
  const today = new Date()
  const [viewing, setViewing] = useState<Date>(() => selectedDate ?? today)

  const year = viewing.getFullYear()
  const month = viewing.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const eventSet = new Set(events.map((e) => e.date))

  const prevMonth = () => setViewing(new Date(year, month - 1, 1))
  const nextMonth = () => setViewing(new Date(year, month + 1, 1))

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year

  const hasEvent = (day: number) => eventSet.has(toDateKey(year, month, day))

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-card border border-border rounded-2xl p-4 select-none ${className}`}
    >
      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-foreground">
          {MONTHS[month]} {year}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cabeçalhos dos dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[9px] font-black uppercase tracking-wider text-muted/60 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} aria-hidden="true" />

          const isCurrentDay = isToday(day)
          const selected = isSelected(day)
          const withEvent = hasEvent(day)

          const dayStyle = selected
            ? 'bg-accent text-[var(--accent-foreground)]'
            : isCurrentDay
              ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
              : 'hover:bg-foreground/5 text-foreground'

          return (
            <button
              key={i}
              type="button"
              onClick={() => onDateClick?.(new Date(year, month, day))}
              aria-label={`${day} de ${MONTHS[month]} de ${year}`}
              aria-current={isCurrentDay ? 'date' : undefined}
              aria-pressed={selected}
              className={`
                flex flex-col items-center justify-center py-1 rounded-lg
                transition-all duration-150 ${dayStyle}
              `}
            >
              <span className={`text-[11px] leading-none ${selected || isCurrentDay ? 'font-black' : 'font-semibold'}`}>
                {day}
              </span>
              {withEvent && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    selected
                      ? 'bg-[var(--accent-foreground)]/50'
                      : 'bg-accent'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
