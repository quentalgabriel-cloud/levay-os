'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  tenantColor?: string
  className?: string
  index?: number
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  tenantColor,
  className = '',
  index = 0,
}: StatsCardProps) {
  const changeColor =
    changeType === 'up' ? 'text-success' : changeType === 'down' ? 'text-destructive' : 'text-muted'
  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus
  const iconBg = tenantColor ? `${tenantColor}18` : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md cursor-default select-none ${className}`}
    >
      {/* Topo: ícone + delta */}
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 shrink-0"
          style={{
            backgroundColor: iconBg ?? 'color-mix(in srgb, var(--accent) 14%, transparent)',
            color: tenantColor ?? 'var(--accent)',
          }}
        >
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-foreground/5 ${changeColor}`}>
            <ChangeIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Métrica hero */}
      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted">{title}</p>
        <p className="text-3xl font-bold text-foreground leading-none tabular-nums tracking-tight">{value}</p>
      </div>
    </motion.div>
  )
}
