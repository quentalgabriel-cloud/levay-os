import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { BICA_AMP_CONFIG } from '@/lib/vocabulary'
import { EventAgenda } from '@/components/ui/event-agenda'
import type { CalendarEvent } from '@/components/ui/event-agenda'
import { createEvent, deleteEvent } from '@/app/actions/events'

// Maps Supabase event rows to CalendarEvent format.
// event_date format: "2026-06-14T20:00:00" or "2026-06-14"
function mapToCalendarEvents(rows: { id: string; title: string; event_date: string | null }[]): CalendarEvent[] {
  return rows.map((r) => {
    if (!r.event_date) return { id: r.id, title: r.title, date: new Date().toISOString().split('T')[0] }
    const [date, timePart] = r.event_date.split('T')
    return { id: r.id, title: r.title, date, time: timePart ? timePart.slice(0, 5) : undefined }
  })
}

interface CompanyColumnProps {
  slug: 'bicabar' | 'amp213' | 'shared'
  title: string
  color: string
  accent: string
  isShared?: boolean
  children: React.ReactNode
}

function CompanyColumn({ slug, title, color, accent, isShared, children }: CompanyColumnProps) {
  const borderColor = isShared ? '#9CA3AF' : color
  const bgAccent = isShared ? '#F3F4F6' : accent
  
  return (
    <div 
      className="rounded-3xl border-2 flex flex-col"
      style={{ 
        borderColor: borderColor,
        backgroundColor: isShared ? '#FAFAFA' : 'white'
      }}
    >
      <div 
        className="px-4 py-3 rounded-t-[1.1rem] flex items-center gap-3"
        style={{ backgroundColor: isShared ? '#F3F4F6' : bgAccent }}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span 
          className="font-bold text-sm"
          style={{ color: isShared ? '#374151' : color }}
        >
          {title}
        </span>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {children}
      </div>
    </div>
  )
}

function MetricCard({ label, value, subtext, alert }: { 
  label: string
  value: string | number
  subtext?: string
  alert?: boolean
}) {
  return (
    <div className={`p-3 rounded-xl ${alert ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  )
}

function SectionCard({ title, children, action }: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</h4>
        {action}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-gray-400 italic py-2">{message}</p>
  )
}

function AnchorPerson({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <EmptyState message="Pendente configurar" />
  }
  return (
    <div className="flex gap-2">
      {names.map((name, i) => (
        <span 
          key={i}
          className="px-2 py-1 bg-gray-200 rounded-lg text-xs font-medium"
        >
          {name}
        </span>
      ))}
    </div>
  )
}

function SystemBadge({ name }: { name: string }) {
  return (
    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
      {name}
    </span>
  )
}

function LastActionIndicator({ lastAction, lastActionAt }: { 
  lastAction: string
  lastActionAt: string | null
}) {
  if (!lastActionAt) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <span className="text-lg">⚠️</span>
        <span className="text-xs font-medium">Nunca manipulado</span>
      </div>
    )
  }
  
  // eslint-disable-next-line react-hooks/purity
  const days = Math.floor((Date.now() - new Date(lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
  const isStale = days > 7
  
  return (
    <div className={`flex items-center gap-2 ${isStale ? 'text-amber-600' : 'text-green-600'}`}>
      <span className="text-lg">{isStale ? '⚠️' : '✓'}</span>
      <span className="text-xs font-medium">
        {days === 0 ? 'Hoje' : days === 1 ? 'Ontem' : `${days}d atrás`}
      </span>
    </div>
  )
}

async function getCompanyData(workspaceId: string, companySlug: 'bica' | 'amp213') {
  const supabase = await createClient()
  
  const companyRes = await supabase
    .from('companies')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('slug', companySlug)
    .maybeSingle()
  
  if (!companyRes.data) {
    return { company: null, tasks: [], decisions: [], projects: [], events: [] }
  }
  
  const companyId = companyRes.data.id
  const [tasks, decisions, projects, events] = await Promise.all([
    supabase.from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
    supabase.from('decisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('company_id', companyId)
      .eq('format', 'open')
      .order('created_at', { ascending: false }),
    supabase.from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('company_id', companyId)
      .eq('status', 'ativo')
      .order('created_at', { ascending: false }),
    supabase.from('events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('company_id', companyId)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(7)
  ])
  
  return {
    company: companyRes.data,
    tasks: tasks.data || [],
    decisions: decisions.data || [],
    projects: projects.data || [],
    events: events.data || [],
  }
}

export default async function BicaAmpPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const [bicaData, ampData] = await Promise.all([
    getCompanyData(workspaceId, 'bica'),
    getCompanyData(workspaceId, 'amp213'),
  ])

  const bicaEvents = mapToCalendarEvents(bicaData.events)
  const ampEvents = mapToCalendarEvents(ampData.events)
  const createEventBica = bicaData.company ? createEvent.bind(null, bicaData.company.id) : null
  const createEventAmp = ampData.company ? createEvent.bind(null, ampData.company.id) : null
  
  const bicaConfig = BICA_AMP_CONFIG.bica
  const ampConfig = BICA_AMP_CONFIG.amp
  const sharedConfig = BICA_AMP_CONFIG.shared
  
  const pendingDecisionsBica = bicaData.decisions.length
  const pendingDecisionsAmp = ampData.decisions.length
  
  const lastDecisionBica = bicaData.decisions[0]?.created_at || null
  const lastDecisionAmp = ampData.decisions[0]?.created_at || null
  
  return (
    <div className="p-6 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bica + AMP</h1>
        <p className="text-sm text-gray-500">
          Visão paralela das operações • Rua do Amparo, 213
        </p>
      </header>
      
      <div className="grid grid-cols-3 gap-4">
        <CompanyColumn
          slug="bicabar"
          title={bicaConfig.name}
          color={bicaConfig.color}
          accent={bicaConfig.accent}
        >
          {bicaData.company ? (
            <>
              <MetricCard 
                label="Decisões pendentes" 
                value={pendingDecisionsBica}
                subtext={pendingDecisionsBica > 0 ? `${pendingDecisionsBica} requerem sua atenção` : 'Tudo decidido'}
                alert={pendingDecisionsBica > 2}
              />
              
              <MetricCard 
                label="Projetos ativos" 
                value={bicaData.projects.length}
                subtext="em movimento"
              />
              
              <SectionCard title="Movimentos 90d">
                {bicaData.projects.length > 0 ? (
                  <ul className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {bicaData.projects.slice(0, 3).map((p: any) => (
                      <li key={p.id} className="text-sm text-gray-700 truncate">
                        • {p.name || p.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="Nenhum projeto ativo" />
                )}
              </SectionCard>
              
              {createEventBica && (
                <EventAgenda
                  events={bicaEvents}
                  onAddServer={createEventBica}
                  onRemoveServer={deleteEvent}
                  className="mx-0"
                />
              )}

              <SectionCard title="Pessoa-âncora">
                <AnchorPerson names={bicaConfig.anchor} />
              </SectionCard>

              <SectionCard title="Sistemas">
                <div className="flex flex-wrap gap-2">
                  {bicaConfig.systems.map((s) => (
                    <SystemBadge key={s} name={s} />
                  ))}
                </div>
              </SectionCard>
              
              <SectionCard title="Última ação do Erick">
                <LastActionIndicator 
                  lastAction="decisão" 
                  lastActionAt={lastDecisionBica} 
                />
              </SectionCard>
            </>
          ) : (
            <EmptyState message="Empresa não encontrada neste workspace" />
          )}
        </CompanyColumn>
        
        <CompanyColumn
          slug="shared"
          title={sharedConfig.name}
          color={sharedConfig.color}
          accent="#F3F4F6"
          isShared
        >
          <SectionCard title="Lana - Escala">
            <EmptyState message="Integração pendente" />
            <p className="text-xs text-gray-400 mt-2">
              Configure a escala de horas分urada entre Bica e AMP
            </p>
          </SectionCard>
          
          <SectionCard title="Cozinha - CMV">
            <EmptyState message="Integração pendente" />
            <p className="text-xs text-gray-400 mt-2">
              Insumos rateados entre dois cardápios
            </p>
          </SectionCard>
          
          <SectionCard title="Prédio - Custos">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aluguel</span>
                <span className="font-medium">50% cada</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Energia</span>
                <span className="font-medium">50% cada</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Água</span>
                <span className="font-medium">50% cada</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Internet</span>
                <span className="font-medium">50% cada</span>
              </div>
            </div>
          </SectionCard>
          
          <SectionCard title="Equipe Cozinha">
            <EmptyState message="Integração pendente" />
            <p className="text-xs text-gray-400 mt-2">
              Quem está alocado em qual operação hoje
            </p>
          </SectionCard>
          
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              💡 Configure as integrações para preencher automaticamente
            </p>
          </div>
        </CompanyColumn>
        
        <CompanyColumn
          slug="amp213"
          title={ampConfig.name}
          color={ampConfig.color}
          accent={ampConfig.accent}
        >
          {ampData.company ? (
            <>
              <MetricCard 
                label="Decisões pendentes" 
                value={pendingDecisionsAmp}
                subtext={pendingDecisionsAmp > 0 ? `${pendingDecisionsAmp} requerem sua atenção` : 'Tudo decidido'}
                alert={pendingDecisionsAmp > 2}
              />
              
              <MetricCard 
                label="Projetos ativos" 
                value={ampData.projects.length}
                subtext="em movimento"
              />
              
              <SectionCard title="Movimentos 90d">
                {ampData.projects.length > 0 ? (
                  <ul className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {ampData.projects.slice(0, 3).map((p: any) => (
                      <li key={p.id} className="text-sm text-gray-700 truncate">
                        • {p.name || p.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="Nenhum projeto ativo" />
                )}
              </SectionCard>
              
              {createEventAmp && (
                <EventAgenda
                  events={ampEvents}
                  onAddServer={createEventAmp}
                  onRemoveServer={deleteEvent}
                  className="mx-0"
                />
              )}

              <SectionCard title="Pessoa-âncora">
                <AnchorPerson names={ampConfig.anchor} />
              </SectionCard>

              <SectionCard title="Sistemas">
                {ampConfig.systems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ampConfig.systems.map((s) => (
                      <SystemBadge key={s} name={s} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Pendente configurar" />
                )}
              </SectionCard>
              
              <SectionCard title="Última ação do Erick">
                <LastActionIndicator 
                  lastAction="decisão" 
                  lastActionAt={lastDecisionAmp} 
                />
              </SectionCard>
            </>
          ) : (
            <EmptyState message="Empresa não encontrada neste workspace" />
          )}
        </CompanyColumn>
      </div>
    </div>
  )
}