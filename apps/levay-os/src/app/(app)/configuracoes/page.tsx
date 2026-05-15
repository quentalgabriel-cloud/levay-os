import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/tenant-context'

const CONFIG_DEFAULTS: Record<string, string> = {
  cap_hoje: '8',
  palette_version: 'v1',
  exception_threshold: '500',
}

const CONFIG_LABELS: Record<string, string> = {
  cap_hoje: 'Cap diário de tarefas',
  palette_version: 'Versão da paleta',
  exception_threshold: 'Limite de exceção (R$)',
}

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const ctx = await requireAuth(supabase)

  const { data: configRows } = await supabase
    .from('workspace_config')
    .select('key, value')
    .eq('workspace_id', ctx.workspaceId)

  const config: Record<string, string> = { ...CONFIG_DEFAULTS }
  for (const row of configRows ?? []) {
    config[row.key] = String(row.value ?? '')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-sm font-medium text-muted mt-1">Informações do workspace</p>
      </div>

      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted pb-3 border-b border-border">
          Workspace
        </h2>

        <dl className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <dt className="text-sm font-medium text-muted">Nome</dt>
            <dd className="text-sm font-bold text-foreground">{ctx.workspaceName}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <dt className="text-sm font-medium text-muted">Slug</dt>
            <dd className="text-sm font-mono text-foreground">{ctx.workspaceSlug}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <dt className="text-sm font-medium text-muted">Workspace ID</dt>
            <dd className="text-xs font-mono text-muted truncate max-w-[18rem]">{ctx.workspaceId}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <dt className="text-sm font-medium text-muted">Sua função</dt>
            <dd className="text-sm font-bold text-foreground capitalize">{ctx.userRole}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted pb-3 border-b border-border">
          Configurações Operacionais
        </h2>

        <dl className="space-y-3">
          {Object.entries(CONFIG_DEFAULTS).map(([key], index) => (
            <div
              key={key}
              className={`flex items-center justify-between py-2 ${index > 0 ? 'border-t border-border' : ''}`}
            >
              <dt className="text-sm font-medium text-muted">{CONFIG_LABELS[key] ?? key}</dt>
              <dd className="text-sm font-bold text-foreground font-mono">{config[key]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
