'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderKanban, Plus, Building2, AlertTriangle, Activity } from 'lucide-react'
import { FilterBar } from '@/components/filters/FilterBar'
import { SmartList } from '@/components/ui/SmartList'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface Project {
  id: string
  name: string
  status: string
  company_id?: string
  next_milestone?: string
  attention?: string
  blocking?: string
  health_score?: number
}

interface Company {
  id: string
  name: string
  color: string
}

const STATUS_OPTIONS = [
  { id: 'ativo', label: 'Ativo' },
  { id: 'pausado', label: 'Pausado' },
  { id: 'concluido', label: 'Concluído' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ativo: { label: 'Ativo', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
  pausado: { label: 'Pausado', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  concluido: { label: 'Concluído', color: 'text-muted', bg: 'bg-muted/10 border-muted/20' },
}

interface ProjectListClientProps {
  initialProjects: Project[]
  companies: Company[]
}

export function ProjectListClient({ initialProjects, companies }: ProjectListClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const companyMap = new Map(companies.map(c => [c.id, c]))

  const filteredProjects = projects.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(p.status)
    
    return matchesSearch && matchesStatus
  })

  const handleCreateNew = () => {
  }

  const renderProject = (project: Project, index: number) => {
    const company = project.company_id ? companyMap.get(project.company_id) : undefined
    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.concluido

    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ scale: 1.01 }}
        className="flex items-start gap-4 px-5 py-4 bg-card border border-border rounded-[2rem] hover:bg-foreground/[0.03] cursor-pointer transition-all shadow-sm hover:shadow-lg"
      >
        {/* Company Color */}
        {company && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px] shadow-current"
            style={{ backgroundColor: company.color }}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">{project.name}</p>
          
          {project.next_milestone && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Próximo: {project.next_milestone}
            </p>
          )}
          
          {/* Alerts */}
          {project.attention && (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {project.attention}
            </p>
          )}
          
          {project.blocking && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Bloqueio: {project.blocking}
            </p>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {company && (
            <span className="text-xs text-muted flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {company.name}
            </span>
          )}
          
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          
          {project.health_score != null && (
            <div className="flex items-center gap-2">
              <ProgressBar value={project.health_score} className="w-20" />
              <span className="text-[10px] font-mono text-muted tabular-nums">
                {project.health_score}%
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const keyExtractor = (project: Project) => project.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Projetos</h1>
          <p className="text-muted text-sm mt-1">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* FilterBar */}
      <FilterBar
        onSearch={setSearchQuery}
        onFilterChange={setStatusFilter}
        filters={STATUS_OPTIONS}
        placeholder="Buscar projetos..."
      />

      {/* Projects List */}
      <SmartList
        data={filteredProjects}
        loading={loading}
        emptyType="projects"
        renderItem={renderProject}
        keyExtractor={keyExtractor}
        onCreateNew={handleCreateNew}
        listClassName="space-y-3"
        skeletonCount={4}
      />
    </div>
  )
}