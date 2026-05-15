import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { getCapHoje } from '@/lib/workspace-config'
import { COMPANY_COLOR, PRIORITY_LABEL } from '@/lib/vocabulary'
import type { Tables } from '@/types/database'
import {
  AlertTriangle, ShoppingCart, AlertCircle, CheckSquare, Zap, Clock,
} from 'lucide-react'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import CaptureInbox from './CaptureInbox'
import QuickCapture from './QuickCapture'

type Task = Tables<'tasks'>
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
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      title={co.name}
    />
  )
}

function TaskRow({ task, companies }: { task: Task; companies: Company[] }) {
  const priority = getPriorityBadge(task.priority)
  const isOverdue = task.due_at && new Date(task.due_at) < new Date()

  return (
    <div className="group flex items-start gap-3 px-5 py-3.5 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]">
      <CompanyDot companyId={task.company_id} companies={companies} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{task.title}</p>
        {task.minimum_movement && (
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate italic">→ {task.minimum_movement}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isOverdue && (
          <span className="text-[9px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
            Vencida
          </span>
        )}
        {priority && (
          <span className="text-[9px] font-black uppercase tracking-widest text-muted bg-muted/10 px-2 py-1 rounded-full border border-muted/10">
            {priority}
          </span>
        )}
      </div>
    </div>
  )
}

function Block({
  title,
  count,
  children,
  accent,
}: {
  title: string
  count?: number
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className={`bg-card border ${accent ?? 'border-border'} rounded-[2rem] flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.02] shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{title}</h2>
        {count !== undefined && (
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg ${
              count > 0 ? 'bg-accent text-white shadow-accent/40' : 'bg-muted/20 text-muted shadow-none'
            }`}
          >
            {count}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto max-h-72 py-3 px-2 space-y-0.5">{children}</div>
    </div>
  )
}

function PulseCard({
  label,
  value,
  icon,
  critical = false,
  warn = false,
}: {
  label: string
  value: number
  icon: React.ReactNode
  critical?: boolean
  warn?: boolean
}) {
  const active = value > 0
  const colorClass = critical && active ? 'text-destructive' : warn && active ? 'text-amber-500' : 'text-foreground'
  const borderClass =
    critical && active
      ? 'border-destructive/40 bg-destructive/5'
      : warn && active
        ? 'border-amber-500/40 bg-amber-500/5'
        : 'border-border'
  const iconBg =
    critical && active
      ? 'bg-destructive/10 text-destructive'
      : warn && active
        ? 'bg-amber-500/10 text-amber-500'
        : 'bg-muted/10 text-muted'

  return (
    <div className={`bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 ${borderClass}`}>
      <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">{label}</p>
      </div>
    </div>
  )
}

export default async function MesaPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const capHoje = await getCapHoje()

  const safe = <T,>(p: PromiseLike<{ data: T | null; error: unknown }>) =>
    Promise.resolve(p)
      .then(({ data, error }) => {
        if (error) console.error('[mesa] query error:', error)
        return { data: data ?? null }
      })
      .catch((err) => {
        console.error('[mesa] query exception:', err)
        return { data: null }
      })

  const safeCount = (p: PromiseLike<{ count: number | null; error: unknown }>) =>
    Promise.resolve(p)
      .then(({ count, error }) => {
        if (error) console.error('[mesa] count error:', error)
        return count ?? 0
      })
      .catch(() => 0)

  const closedStatuses = '(ciclo_fechado,cancelado)'

  const [
    { data: companies },
    { data: todayTasks },
    { data: delegatedTasks },
    { data: pendingDecisions },
    { data: openLacunas },
    { data: procurementExceptions },
    { data: noMovementTasks },
    { data: inboxTasks },
    { data: allProjects },
    totalAbertas,
    countMoving,
    countWaiting,
    countOverdue,
  ] = await Promise.all([
    safe(supabase.from('companies').select('*').eq('workspace_id', workspaceId).order('name')),
    safe(
      supabase
        .from('tasks')
        .select('*, companies(name, slug)')
        .eq('workspace_id', workspaceId)
        .eq('status', 'em_andamento')
        .lte('due_at', new Date(today.getTime() + 86400000).toISOString())
        .order('priority', { ascending: false })
        .limit(capHoje),
    ),
    safe(
      supabase
        .from('tasks')
        .select('*, companies(name, slug)')
        .eq('workspace_id', workspaceId)
        .not('owner_collaborator_id', 'is', null)
        .eq('status', 'em_andamento')
        .order('updated_at', { ascending: false })
        .limit(8),
    ),
    safe(
      supabase
        .from('decisions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('format', 'open')
        .order('created_at', { ascending: false })
        .limit(6),
    ),
    safe(
      supabase
        .from('lacunas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'ABERTA')
        .eq('impacto', 'ALTO')
        .order('created_at', { ascending: false })
        .limit(8),
    ),
    safe(
      supabase
        .from('procurement_requests')
        .select('id, title, exception_reason, companies(name, color)')
        .eq('workspace_id', workspaceId)
        .eq('exception_flagged', true)
        .not('status', 'in', '(recebido,cancelado)')
        .order('requested_at', { ascending: false })
        .limit(5),
    ),
    safe(
      supabase
        .from('tasks')
        .select('*, companies(name, slug)')
        .eq('workspace_id', workspaceId)
        .eq('minimum_movement', '')
        .neq('status', 'ciclo_fechado')
        .order('created_at')
        .limit(8),
    ),
    safe(
      supabase
        .from('tasks')
        .select('*, companies(name, slug)')
        .eq('inbox', true)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(15),
    ),
    safe(
      supabase
        .from('projects')
        .select('*, companies(name, slug)')
        .eq('workspace_id', workspaceId)
        .eq('status', 'ativo')
        .order('health_score')
        .limit(12),
    ),
    safeCount(
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .not('status', 'in', closedStatuses),
    ),
    safeCount(
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('status', 'em_andamento'),
    ),
    safeCount(
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('status', 'aguardando'),
    ),
    safeCount(
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .not('status', 'in', closedStatuses)
        .not('due_at', 'is', null)
        .lt('due_at', new Date().toISOString()),
    ),
  ])

  const cos = companies ?? []

  type ProcExc = {
    id: string
    title: string
    exception_reason: string | null
    companies: { name: string; color: string } | null
  }
  const exceptions = (procurementExceptions ?? []) as ProcExc[]
  const alertCount =
    (noMovementTasks?.length ?? 0) + (openLacunas?.length ?? 0) + exceptions.length

  const atRiskProjects = (allProjects ?? []).filter((p) => p.attention !== null)

  const calEvents = [
    ...(todayTasks ?? []).filter((t) => t.due_at).map((t) => ({ date: t.due_at!.slice(0, 10) })),
    ...(delegatedTasks ?? []).filter((t) => t.due_at).map((t) => ({ date: t.due_at!.slice(0, 10) })),
    ...(inboxTasks ?? []).filter((t) => t.due_at).map((t) => ({ date: t.due_at!.slice(0, 10) })),
  ]

  return (
    <div className="p-8 max-w-[90rem] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Mesa do Diretor</h1>
          <p className="text-sm font-medium text-muted mt-1 capitalize">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
        </div>
        <QuickCapture />
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0 space-y-6">

          {/* Executive pulse — 5 métricas reais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <PulseCard label="Abertas" value={totalAbertas} icon={<CheckSquare className="w-4 h-4" />} />
            <PulseCard label="Em movimento" value={countMoving} icon={<Zap className="w-4 h-4" />} />
            <PulseCard label="Aguardando" value={countWaiting} icon={<Clock className="w-4 h-4" />} warn />
            <PulseCard label="Vencidas" value={countOverdue} icon={<AlertCircle className="w-4 h-4" />} critical />
            <PulseCard label="Alertas" value={alertCount} icon={<AlertTriangle className="w-4 h-4" />} critical />
          </div>

          {/* Company badges */}
          <div className="flex flex-wrap gap-2.5">
            {cos.map((co) => {
              const color = COMPANY_COLOR[co.slug as keyof typeof COMPANY_COLOR] ?? '#6b7280'
              return (
                <div
                  key={co.id}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-bold text-foreground opacity-80">{co.name}</span>
                </div>
              )
            })}
          </div>

          {/* Priority triage — o que precisa do diretor agora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Block
              title="Decidir Agora"
              count={pendingDecisions?.length ?? 0}
              accent="border-purple-500/30"
            >
              {pendingDecisions?.length ? (
                pendingDecisions.map((d) => (
                  <div
                    key={d.id}
                    className="group px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  >
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-accent">
                      {d.title}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">
                      {d.decision_type}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Sem decisões pendentes.
                </p>
              )}
            </Block>

            <Block
              title="Alertas"
              count={alertCount}
              accent={alertCount > 0 ? 'border-destructive/30' : undefined}
            >
              {exceptions.map((exc) => {
                const co = Array.isArray(exc.companies) ? exc.companies[0] : exc.companies
                return (
                  <a
                    key={exc.id}
                    href={`/compras/${exc.id}`}
                    className="group block px-5 py-3.5 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ShoppingCart className="w-3 h-3 text-destructive shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-destructive">
                        Exceção compras
                      </span>
                      {co && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: co.color }}
                        />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-destructive">
                      {exc.title}
                    </p>
                    {exc.exception_reason && (
                      <p className="text-[11px] text-muted mt-0.5 truncate italic">
                        {exc.exception_reason}
                      </p>
                    )}
                  </a>
                )
              })}
              {openLacunas?.map((l) => (
                <div
                  key={l.id}
                  className="group px-5 py-3.5 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-destructive mb-0.5">
                    {l.tipo?.toLowerCase().replace(/_/g, ' ')} · alto impacto
                  </p>
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-destructive">
                    {l.titulo}
                  </p>
                  {l.proximo_movimento && (
                    <p className="text-[11px] text-muted mt-0.5 truncate italic">
                      → {l.proximo_movimento}
                    </p>
                  )}
                </div>
              ))}
              {noMovementTasks?.map((t) => (
                <div
                  key={t.id}
                  className="group px-5 py-3.5 hover:bg-foreground/[0.03] rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                      Sem movimento
                    </span>
                    <CompanyDot companyId={t.company_id} companies={cos} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-destructive">
                    {t.title}
                  </p>
                </div>
              ))}
              {!alertCount && (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Nenhum alerta.
                </p>
              )}
            </Block>

            <Block
              title="Projetos em Risco"
              count={atRiskProjects.length}
              accent={atRiskProjects.length > 0 ? 'border-amber-500/30' : undefined}
            >
              {atRiskProjects.length ? (
                atRiskProjects.map((p) => {
                  const health = p.health_score ?? 100
                  const barColor =
                    health >= 70 ? 'bg-emerald-500' : health >= 40 ? 'bg-amber-500' : 'bg-destructive'
                  return (
                    <div
                      key={p.id}
                      className="group px-5 py-4 hover:bg-foreground/[0.03] rounded-2xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <CompanyDot companyId={p.company_id} companies={cos} />
                        <p className="text-sm font-bold text-foreground truncate flex-1 group-hover:text-accent transition-colors">
                          {p.name}
                        </p>
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      </div>
                      <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full`}
                          style={{ width: `${Math.max(5, health)}%` }}
                        />
                      </div>
                      {p.next_milestone && (
                        <p className="text-[10px] text-muted mt-1.5 truncate italic">{p.next_milestone}</p>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Todos os projetos saudáveis.
                </p>
              )}
            </Block>
          </div>

          {/* Operacional — foco, delegado, inbox */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Block
              title={`Foco · Hoje (max ${capHoje})`}
              count={todayTasks?.length ?? 0}
              accent="border-amber-500/20"
            >
              {todayTasks?.length ? (
                todayTasks.map((t) => <TaskRow key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Nada para hoje.
                </p>
              )}
            </Block>

            <Block
              title="Delegado"
              count={delegatedTasks?.length ?? 0}
              accent="border-orange-500/20"
            >
              {delegatedTasks?.length ? (
                delegatedTasks.map((t) => <TaskRow key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Nada delegado.
                </p>
              )}
            </Block>

            <Block title="Capturar (Inbox)" count={inboxTasks?.length ?? 0}>
              {inboxTasks?.length ? (
                inboxTasks.map((t) => <TaskRow key={t.id} task={t} companies={cos} />)
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted font-medium italic">
                  Inbox vazio — bom sinal.
                </p>
              )}
            </Block>
          </div>

          {/* Todos os projetos ativos com health score */}
          {allProjects && allProjects.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-3">
                Projetos Ativos · {allProjects.length}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allProjects.map((p) => {
                  const health = p.health_score ?? 100
                  const barColor =
                    health >= 70 ? 'bg-emerald-500' : health >= 40 ? 'bg-amber-500' : 'bg-destructive'
                  return (
                    <div
                      key={p.id}
                      className="bg-card border border-border rounded-2xl px-4 py-3 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CompanyDot companyId={p.company_id} companies={cos} />
                        <p className="text-xs font-bold text-foreground truncate flex-1">{p.name}</p>
                        {p.attention && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
                      </div>
                      <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full`}
                          style={{ width: `${Math.max(5, health)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <CaptureInbox />
          </div>
        </div>

        {/* Sidebar: calendário + agenda + pulse resumo */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0 sticky top-6">
          <MiniCalendar events={calEvents} />

          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Agenda hoje</p>
            {todayTasks?.length ? (
              todayTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <p className="text-xs text-foreground truncate">{t.title}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted italic">Agenda livre.</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted">Pulse</p>
            {(
              [
                { label: 'Abertas', value: totalAbertas, color: 'text-foreground' },
                { label: 'Em movimento', value: countMoving, color: 'text-emerald-500' },
                { label: 'Aguardando', value: countWaiting, color: 'text-amber-500' },
                { label: 'Vencidas', value: countOverdue, color: 'text-destructive' },
              ] as const
            ).map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted">{label}</span>
                <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
