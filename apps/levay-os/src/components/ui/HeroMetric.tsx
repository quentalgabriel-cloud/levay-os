'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HeroMetricProps {
  value: string | number
  unit?: string
  label?: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  size?: 'md' | 'lg'
  className?: string
  index?: number
}

export function HeroMetric({
  value,
  unit,
  label,
  change,
  changeType = 'neutral',
  size = 'lg',
  className = '',
  index = 0,
}: HeroMetricProps) {
  const changeColor =
    changeType === 'up' ? 'text-success' : changeType === 'down' ? 'text-destructive' : 'text-muted'
  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus
  const valueSize = size === 'lg' ? 'text-4xl' : 'text-3xl'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col gap-1 select-none ${className}`}
    >
      {label && (
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted">{label}</p>
      )}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`${valueSize} font-bold tabular-nums tracking-tight text-foreground leading-none`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted">{unit}</span>
        )}
        {change && (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/5 ${changeColor} ml-1`}
          >
            <ChangeIcon className="w-3 h-3 shrink-0" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
