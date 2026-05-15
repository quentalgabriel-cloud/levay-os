'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, FolderKanban, CheckSquare } from 'lucide-react'
import { FilterBar } from '@/components/filters/FilterBar'
import { SmartList } from '@/components/ui/SmartList'

interface Company {
  id: string
  name: string
  slug: string
  tagline?: string
  color: string
}

interface CompanyWithStats extends Company {
  activeProjects: number
  openTasks: number
}

interface CompanyListClientProps {
  initialCompanies: Company[]
  projects: { company_id: string; status: string }[]
  tasks: { company_id: string; status: string }[]
}

export function CompanyListClient({ initialCompanies, projects, tasks }: CompanyListClientProps) {
  const [companies, setCompanies] = useState<CompanyWithStats[]>(
    initialCompanies.map(co => {
      const coProjects = projects.filter(p => p.company_id === co.id)
      const activeProjects = coProjects.filter(p => p.status === 'ativo').length
      const coTasks = tasks.filter(t => t.company_id === co.id && t.status !== 'ciclo_fechado')
      
      return {
        ...co,
        activeProjects,
        openTasks: coTasks.length
      }
    })
  )
  
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredCompanies = companies.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateNew = () => {
    console.log('Create new company')
  }

  const renderCompany = (company: CompanyWithStats, index: number) => {
    const color = company.color || '#6b7280'
    
    return (
      <motion.div
        key={company.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ scale: 1.02 }}
        className="bg-card border border-border rounded-[2rem] p-5 hover:bg-foreground/[0.03] cursor-pointer transition-all shadow-sm hover:shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_12px] shadow-current"
            style={{ backgroundColor: color, color }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{company.name}</h2>
            {company.tagline && (
              <p className="text-xs text-muted mt-0.5 truncate">{company.tagline}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-foreground/[0.03] rounded-xl p-3 text-center hover:bg-foreground/[0.06] transition-colors">
            <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-foreground">
              <FolderKanban className="w-4 h-4 text-muted" />
              {company.activeProjects}
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted mt-0.5">projetos ativos</div>
          </div>
          <div className="bg-foreground/[0.03] rounded-xl p-3 text-center hover:bg-foreground/[0.06] transition-colors">
            <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-foreground">
              <CheckSquare className="w-4 h-4 text-muted" />
              {company.openTasks}
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted mt-0.5">tarefas abertas</div>
          </div>
        </div>
      </motion.div>
    )
  }

  const keyExtractor = (company: CompanyWithStats) => company.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Empresas</h1>
          <p className="text-muted text-sm mt-1">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      {/* Search */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Buscar empresas..."
        filters={[]}
      />

      {/* Companies Grid using SmartList */}
      <SmartList
        data={filteredCompanies}
        loading={loading}
        emptyType="companies"
        renderItem={renderCompany}
        keyExtractor={keyExtractor}
        onCreateNew={handleCreateNew}
        listClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        skeletonCount={6}
      />
    </div>
  )
}