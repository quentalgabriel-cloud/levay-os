import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { getCapHoje } from '@/lib/workspace-config'
import { COMPANY_COLOR, PRIORITY_LABEL } from '@/lib/vocabulary'
import type { Tables } from '@/types/database'
import { Inbox, CalendarClock, GitBranch, AlertTriangle, ShoppingCart } from 'lucide-react'
import { StatsCard } from '@/components/ui/stats-card'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import CaptureInbox from './CaptureInbox'
import QuickCapture from './QuickCapture'

type Task = Tables<'tasks'>
type Project = Tables<'projects'>
type Company = Tables<'companies'>

function getPriorityBadge(priority: number | null) {
  const map: Record<number, string> = { 4: 'urgente', 3: 'alta', 2: 'media', 1: 'baixa' }
  if (!priority) return null
  return PRIORITY_LABEL[map[priority]] ?? null
}

function CompanyDot({ companyId, companies }: { companyId: string | null; companies: Company[] }) {
  if (!companyId) return null
  const co = companies.find((c) => c.id === companyId)
  if (!co) return null
  const color = COMPANY_COLOR[co.slug as keyof typeof COMPANY_COLOR] ?? '#6b7280'
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_10px] shadow-current"
      style={{ backgroundColor: color, color: color }}
      title={co.name}
    />
  )
}

function TaskCard({ task, companies }: { task: Task; companies: Company[] }) {
  const priority = getPriorityBadge(task.priority)
  const isOverdue = task.due_at && new Date(task.due_at) < new Date()

  return (
    <div className="group flex items-start gap-3 px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
      <CompanyDot companyId={task.company_id} companies={companies} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{task.title}</p>
        {task.minimum_movement && (
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate italic">→ {task.minimum_movement}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isOverdue && <span className="text-[9px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">Atenção</span>}
        {priority && <span className="text-[9px] font-black uppercase tracking-widest text-muted bg-muted/10 px-2 py-1 rounded-full border border-muted/10">{priority}</span>}
      </div>
    </div>
  )
}

function ProjectCard({ project, companies }: { project: Project; companies: Company[] }) {
  return (
    <div className="group flex items-start gap-3 px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
      <CompanyDot companyId={project.company_id} companies={companies} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{project.name}</p>
        {project.next_milestone && (
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate italic">{project.next_milestone}</p>
        )}
      </div>
      {project.attention && (
        <span className="text-[9px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-2 py-1 rounded-full flex-shrink-0 border border-destructive/20">Atenção</span>
      )}
    </div>
  )
}

function Block({
  title,
  count,
  children,
  accentColor = 'border-border',
}: {
  title: string
  count?: number
  children: React.ReactNode
  accentColor?: string
}) {
  return (
    <div className={`glass-card ${accentColor} rounded-[2rem] flex flex-col overflow-hidden transition-all duration-500 hover:shadow-accent/5`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-black text-white bg-accent px-2.5 py-1 rounded-full shadow-lg shadow-accent/40">
            {count}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto max-h-[22rem] py-4 px-2 space-y-0.5">{children}</div>
    </div>
  )
}

export default async function MesaPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const capHoje = await getCapHoje()

  const [
    { data: companies },
    { data: inboxTasks },
    { data: todayTasks },
    { data: noMovementTasks },
    { data: delegatedTasks },
    { data: projects },
    { data: pendingDecisions },
    { data: openLacunas },
    { data: procurementExceptions },
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('workspace_id', workspaceId).order('name'),
    supabase.from('tasks').select('*, companies(name, slug)').eq('inbox', true).eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(20),
    supabase.from('tasks').select('*, companies(name, slug)').eq('workspace_id', workspaceId).eq('status', 'em_andamento').lte('due_at', new Date(today.getTime() + 86400000).toISOString()).order('priority', { ascending: false }).limit(capHoje),
    supabase.from('tasks').select('*, companies(name, slug)').eq('workspace_id', workspaceId).eq('minimum_movement', '').neq('status', 'ciclo_fechado').order('created_at').limit(10),
    supabase.from('tasks').select('*, companies(name, slug)').eq('workspace_id', workspaceId).not('owner_collaborator_id', 'is', null).eq('status', 'em_andamento').order('updated_at', { ascending: false }).limit(10),
    supabase.from('projects').select('*, companies(name, slug)').eq('workspace_id', workspaceId).eq('status', 'ativo').not('attention', 'is', null).order('health_score').limit(6),
    supabase.from('decisions').select('*').eq('workspace_id', workspaceId).eq('format', 'open').order('created_at', { ascending: false }).limit(5),
    supabase.from('lacunas').select('*').eq('workspace_id', workspaceId).eq('status', 'ABERTA').eq('impacto', 'ALTO').order('created_at', { ascending: false }).limit(10),
    supabase.from('procurement_requests')
      .select('id, title, exception_reason, companies(name, color)')
      .eq('workspace_id', workspaceId)
      .eq('exception_flagged', true)
      .not('status', 'in', '(recebido,cancelado)')
      .order('requested_at', { ascending: false })
      .limit(5)
      .then(({ data }) => ({ data })),
  ])

  const cos = companies ?? []
  type ProcurementException = { id: string; title: string; exception_reason: string | null; companies: { name: string; color: string } | null }
  const exceptions = (procurementExceptions ?? []) as ProcurementException[]
  const alertCount = (noMovementTasks?.length ?? 0) + (pendingDecisions?.length ?? 0) + (openLacunas?.length ?? 0) + exceptions.length

  const calEvents = [
    ...(inboxTasks ?? []).filter(t => t.due_at).map(t => ({ date: t.due_at!.slice(0, 10) })),
    ...(todayTasks ?? []).filter(t => t.due_at).map(t => ({ date: t.due_at!.slice(0, 10) })),
    ...(delegatedTasks ?? []).filter(t => t.due_at).map(t => ({ date: t.due_at!.slice(0, 10) })),
  ]

  return (
    <div className="p-8 max-w-[90rem] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Mesa do Diretor</h1>
          <p className="text-sm font-medium text-muted mt-1 capitalize">
            {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </p>
        </div>
        <QuickCapture />
      </div>

      <div className="flex gap-8 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* KPI strip */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
              title="Inbox"
              value={inboxTasks?.length ?? 0}
              icon={<Inbox />}
              index={0}
            />
            <StatsCard
              title="Hoje"
              value={todayTasks?.length ?? 0}
              icon={<CalendarClock />}
              changeType={todayTasks?.length ? 'neutral' : 'neutral'}
              index={1}
            />
            <StatsCard
              title="Decisões"
              value={pendingDecisions?.length ?? 0}
              icon={<GitBranch />}
              changeType={pendingDecisions?.length ? 'down' : 'neutral'}
              index={2}
            />
            <StatsCard
              title="Alertas"
              value={alertCount}
              icon={<AlertTriangle />}
              changeType={alertCount > 0 ? 'down' : 'neutral'}
              index={3}
            />
          </div>

          {/* Company badges */}
          <div className="flex flex-wrap gap-3">
            {cos.map((co) => {
              const color = COMPANY_COLOR[co.slug as keyof typeof COMPANY_COLOR] ?? '#6b7280'
              return (
                <div
                  key={co.id}
                  className="flex items-center gap-2.5 bg-card border border-border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-default"
                >
                  <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px] shadow-current" style={{ backgroundColor: color, color: color }} />
                  <span className="text-xs font-bold text-foreground opacity-80">{co.name}</span>
                </div>
              )
            })}
          </div>

          {/* Main 6-block cockpit */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Block 1: Capturar (Inbox) */}
            <Block title="Capturar" count={inboxTasks?.length ?? 0}>
              {inboxTasks?.length ? (
                inboxTasks.map((t) => <TaskCard key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Inbox vazio — bom sinal.</p>
              )}
            </Block>

            {/* Block 2: Hoje (cap configurável) */}
            <Block title={`Hoje · max ${capHoje}`} count={todayTasks?.length ?? 0} accentColor="border-amber-500/20">
              {todayTasks?.length ? (
                todayTasks.map((t) => <TaskCard key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Nada para hoje.</p>
              )}
            </Block>

            {/* Block 3: Decidir */}
            <Block title="Decidir" count={pendingDecisions?.length ?? 0} accentColor="border-purple-500/20">
              {pendingDecisions?.length ? (
                pendingDecisions.map((d) => (
                  <div key={d.id} className="group px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent">{d.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">{d.decision_type}</p>
                  </div>
                ))
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Sem decisões pendentes.</p>
              )}
            </Block>

            {/* Block 4: Delegar */}
            <Block title="Delegar" count={delegatedTasks?.length ?? 0} accentColor="border-orange-500/20">
              {delegatedTasks?.length ? (
                delegatedTasks.map((t) => <TaskCard key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Nada delegado.</p>
              )}
            </Block>

            {/* Block 5: Empresas (projects com atenção) */}
            <Block title="Empresas" count={projects?.length ?? 0}>
              {projects?.length ? (
                projects.map((p) => <ProjectCard key={p.id} project={p} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Todos os projetos OK.</p>
              )}
            </Block>

            {/* Block 6: Alertas (exceções compras + lacunas alto impacto + tasks sem movimento) */}
            <Block title="Alertas" count={alertCount} accentColor={alertCount > 0 ? 'border-red-500/30' : undefined}>
              {exceptions.map((exc) => {
                const co = Array.isArray(exc.companies) ? exc.companies[0] : exc.companies
                return (
                  <a key={exc.id} href={`/compras/${exc.id}`} className="group block px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 active:scale-[0.98]">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Exceção compras</span>
                      {co && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: co.color }}
                          aria-hidden
                        />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-red-500">{exc.title}</p>
                    {exc.exception_reason && (
                      <p className="text-[11px] text-muted mt-0.5 truncate italic">{exc.exception_reason}</p>
                    )}
                  </a>
                )
              })}
              {openLacunas?.map((l) => (
                <div key={l.id} className="group px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">{l.tipo.toLowerCase().replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">· alto impacto</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-red-500">{l.titulo}</p>
                  {l.proximo_movimento && (
                    <p className="text-[11px] font-medium text-muted mt-0.5 truncate italic">→ {l.proximo_movimento}</p>
                  )}
                </div>
              ))}
              {noMovementTasks?.map((t) => (
                <div key={t.id} className="group px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Sem movimento</span>
                    <CompanyDot companyId={t.company_id} companies={cos} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-red-500">{t.title}</p>
                </div>
              ))}
              {!alertCount && (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">Nenhum alerta.</p>
              )}
            </Block>
          </div>

          {/* Capture inbox section */}
          <div className="pt-4">
            <CaptureInbox />
          </div>
        </div>

        {/* Sidebar: MiniCalendar — visível em xl+ */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0 sticky top-6">
          <MiniCalendar events={calEvents} />
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Agenda hoje</p>
            {todayTasks?.length ? (
              todayTasks.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <p className="text-xs text-foreground truncate">{t.title}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted italic">Agenda livre.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
