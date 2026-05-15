import React from 'react'
'use client'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`bg-border/50 animate-pulse rounded ${className}`} style={style} />
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-5 bg-card/50 border border-border rounded-[2rem]">
      <Skeleton className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 rounded-lg w-3/4" />
        <Skeleton className="h-4 rounded-lg w-1/2" />
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  )
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatusGroupSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <TaskListSkeleton count={3} />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="space-y-12">
        <StatusGroupSkeleton />
        <StatusGroupSkeleton />
      </div>
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card/50 border border-border rounded-2xl p-6 ${className}`}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cells = 4 }: { cells?: number }) {
  const widths = ['25%', '40%', '35%', '50%', '30%', '45%']
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
      {Array.from({ length: cells }).map((_, i) => (
        <Skeleton key={i} className="h-4 rounded" style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4">
      <Skeleton className="h-4 w-24 rounded mb-2" />
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  )
}

export function NavigationSkeleton() {
  return (
    <div className="flex items-center gap-6">
      <Skeleton className="h-6 w-20 rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function EmptyStateSkeleton() {
  return (
    <div className="text-center py-24 bg-card border border-dashed border-border rounded-[2rem]">
      <div className="mx-auto w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mb-4">
        <Skeleton className="w-8 h-8 rounded" />
      </div>
      <Skeleton className="h-6 w-48 rounded mx-auto mb-2" />
      <Skeleton className="h-4 w-32 rounded mx-auto" />
    </div>
  )
}