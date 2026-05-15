'use client'

import { useState, useMemo } from 'react'
import { Search, User, Mail, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { MiniCalendar } from '@/components/ui/MiniCalendar'

interface CollaboratorItem {
  id: string
  name: string
  email: string | null
  whatsapp: string | null
  default_company_id: string | null
  active: boolean
  profile_data: {
    role?: string
    position?: string
    strengths?: string
    specialty?: string
    impact_phrase?: string
  } | null
}

interface CompanyItem {
  id: string
  name: string
  slug: string
  color: string | null
}

interface ColaboradoresClientProps {
  initialCollaborators: CollaboratorItem[]
  companies: CompanyItem[]
}

const COMPANY_COLORS: Record<string, string> = {
  bica: '#7C3AED',
  amp213: '#EA580C',
  sollu: '#2563EB',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function getCompanyColor(slug: string | undefined): string {
  return COMPANY_COLORS[slug ?? ''] ?? '#6b7280'
}

function ProfilePanel({
  collab,
  company,
}: {
  collab: CollaboratorItem
  company: CompanyItem | undefined
}) {
  const color = getCompanyColor(company?.slug)
  const initials = getInitials(collab.name)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{collab.name}</h2>
          {collab.profile_data?.role && (
            <p className="text-sm text-muted mt-1">{collab.profile_data.role}</p>
          )}
          {!collab.active && (
            <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-foreground/5 text-muted border border-border">
              Inativo
            </span>
          )}
        </div>
      </div>

      {company && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-foreground">{company.name}</span>
        </div>
      )}

      {(collab.email || collab.whatsapp) && (
        <div className="space-y-2">
          {collab.email && (
            <a
              href={`mailto:${collab.email}`}
              className="flex items-center gap-2.5 text-sm text-muted hover:text-accent transition-colors group"
            >
              <Mail className="w-4 h-4 shrink-0 group-hover:text-accent" />
              {collab.email}
            </a>
          )}
          {collab.whatsapp && (
            <a
              href={`https://wa.me/${collab.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-muted hover:text-accent transition-colors group"
            >
              <Phone className="w-4 h-4 shrink-0 group-hover:text-accent" />
              {collab.whatsapp}
            </a>
          )}
        </div>
      )}

      {collab.profile_data?.impact_phrase && (
        <blockquote className="border-l-2 border-accent pl-4 italic text-sm text-muted">
          &ldquo;{collab.profile_data.impact_phrase}&rdquo;
        </blockquote>
      )}

      {collab.profile_data?.specialty && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted mb-1">Especialidade</p>
          <p className="text-sm text-foreground">{collab.profile_data.specialty}</p>
        </div>
      )}

      {collab.profile_data?.strengths && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted mb-1">Pontos fortes</p>
          <p className="text-sm text-foreground">{collab.profile_data.strengths}</p>
        </div>
      )}

      <Link
        href={`/colaboradores/${collab.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Ver perfil completo
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function EmptyProfile() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[20rem] text-center">
      <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-muted" />
      </div>
      <p className="text-sm font-medium text-muted">Selecione um colaborador</p>
      <p className="text-xs text-muted/60 mt-1">Clique na lista para ver o perfil</p>
    </div>
  )
}

export function ColaboradoresClient({ initialCollaborators, companies }: ColaboradoresClientProps) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const companyMap = useMemo(
    () => new Map(companies.map(c => [c.id, c])),
    [companies]
  )

  const filtered = useMemo(
    () =>
      initialCollaborators.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [initialCollaborators, search]
  )

  const selected = selectedId
    ? initialCollaborators.find(c => c.id === selectedId) ?? null
    : null

  const activeCount = initialCollaborators.filter(c => c.active).length
  const inactiveCount = initialCollaborators.length - activeCount

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Panel 1: Lista */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border overflow-hidden">
        <div className="p-5 border-b border-border shrink-0">
          <h1 className="text-xl font-bold text-foreground mb-3">Pessoas</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-foreground/[0.03] border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(c => {
            const company = c.default_company_id ? companyMap.get(c.default_company_id) : undefined
            const color = getCompanyColor(company?.slug)
            const isSelected = c.id === selectedId

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-accent/5 border-l-2 border-accent'
                    : 'border-l-2 border-transparent hover:bg-foreground/[0.03]'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                    {c.name}
                  </p>
                  {c.profile_data?.role && (
                    <p className="text-xs text-muted truncate">{c.profile_data.role}</p>
                  )}
                </div>
                {!c.active && (
                  <span className="text-[9px] font-bold text-muted shrink-0">Inativo</span>
                )}
              </button>
            )
          })}

          {filtered.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted">Nenhum resultado</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Calendário + stats */}
      <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-5 space-y-4">
        <MiniCalendar />
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Equipe</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-foreground">{activeCount}</span>
            <span className="text-xs text-muted">ativos</span>
          </div>
          {inactiveCount > 0 && (
            <p className="text-xs text-muted">
              {inactiveCount} {inactiveCount === 1 ? 'inativo' : 'inativos'}
            </p>
          )}
        </div>
        <div className="space-y-2">
          {companies.map(co => {
            const color = getCompanyColor(co.slug)
            const count = initialCollaborators.filter(c => c.default_company_id === co.id).length
            return (
              <div key={co.id} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted flex-1">{co.name}</span>
                <span className="text-xs font-bold text-foreground tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel 3: Perfil */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <ProfilePanel
            collab={selected}
            company={selected.default_company_id ? companyMap.get(selected.default_company_id) : undefined}
          />
        ) : (
          <EmptyProfile />
        )}
      </div>
    </div>
  )
}
