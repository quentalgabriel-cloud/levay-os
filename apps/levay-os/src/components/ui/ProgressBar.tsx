'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className = '', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-bold text-accent tabular-nums shrink-0">{clamped}%</span>
      )}
    </div>
  )
}
