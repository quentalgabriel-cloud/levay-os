'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type HoverDirection = 'top' | 'bottom' | 'left' | 'right'

interface HoverCardProps {
  children: ReactNode
  content: ReactNode
  side?: HoverDirection
  delay?: number
}

const positions: Record<HoverDirection, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
}

const animations = {
  top: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } },
  bottom: { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } }
}

export function HoverCard({ children, content, side = 'top', delay = 0 }: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 pointer-events-none ${positions[side]}`}
            initial={animations[side].initial}
            animate={animations[side].animate}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, delay }}
          >
            <div className="bg-card border border-border rounded-xl shadow-xl p-4 min-w-[200px] max-w-xs backdrop-blur-md">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface TooltipProps {
  children: ReactNode
  text: string
  side?: HoverDirection
}

export function Tooltip({ children, text, side = 'top' }: TooltipProps) {
  return (
    <HoverCard
      side={side}
      content={
        <p className="text-xs text-muted leading-relaxed">{text}</p>
      }
    >
      {children}
    </HoverCard>
  )
}

interface InfoTipProps {
  label: string
  value: string | ReactNode
  hint?: string
}

export function InfoTip({ label, value, hint }: InfoTipProps) {
  return (
    <HoverCard
      side="right"
      content={
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      }
    >
      <span className="cursor-help border-b border-dashed border-muted/50">
        {value}
      </span>
    </HoverCard>
  )
}

interface ContextMenuProps {
  children: ReactNode
  items: {
    label: string
    icon?: ReactNode
    onClick: () => void
    destructive?: boolean
  }[]
}

export function ContextMenu({ children, items }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-1 min-w-[160px]"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.destructive
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'text-foreground hover:bg-foreground/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}