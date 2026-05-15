'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterBarProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: string[]) => void
  filters?: FilterOption[]
  placeholder?: string
}

const defaultFilters: FilterOption[] = [
  { id: 'em_andamento', label: 'Em Andamento' },
  { id: 'aguardando', label: 'Aguardando' },
  { id: 'fechar_ciclo', label: 'Fechar Ciclo' },
  { id: 'a_fazer', label: 'A Fazer' },
  { id: 'standby', label: 'Standby' },
]

export function FilterBar({ 
  onSearch, 
  onFilterChange, 
  filters = defaultFilters,
  placeholder = "Buscar tarefas..." 
}: FilterBarProps) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    onSearch?.(value)
  }

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters([])
    setSearch('')
    onFilterChange?.([])
    onSearch?.('')
  }

  const hasActive = activeFilters.length > 0 || search.length > 0

  return (
    <div className="space-y-3">
      {/* Search Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted/50"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
            showFilters || activeFilters.length > 0
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-muted hover:text-foreground hover:border-foreground/20'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros</span>
          {activeFilters.length > 0 && (
            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-4 bg-card/50 border border-border rounded-xl">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilters.includes(filter.id)
                      ? 'bg-accent text-white'
                      : 'bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 border border-border'
                  }`}
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className={`text-xs ${activeFilters.includes(filter.id) ? 'text-white/80' : 'text-muted'}`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}

              {hasActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StatusFilter({ 
  active, 
  onChange 
}: { 
  active: string[]
  onChange: (status: string[]) => void 
}) {
  return (
    <FilterBar
      onFilterChange={onChange}
      filters={defaultFilters}
      placeholder="Filtrar por status..."
    />
  )
}