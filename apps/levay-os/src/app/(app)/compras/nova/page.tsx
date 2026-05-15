import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { NewProcurementForm, type CompanyOption } from './NewProcurementForm'

export default async function NewProcurementPage() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, color, escopo')
    .eq('workspace_id', workspaceId)
    .in('escopo', ['BICA', 'AMP213', 'PESSOAL_ERICK', 'GERAL'])
    .order('name')

  const companyOptions: CompanyOption[] = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    color: c.color ?? '#94a3b8',
    escopo: c.escopo as CompanyOption['escopo'],
  }))

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Novo pedido</h1>
        <p className="text-sm text-muted">
          Lance os itens que precisa comprar. A Thaynan consolida e dispara o fornecedor.
        </p>
      </header>
      <NewProcurementForm companies={companyOptions} />
    </div>
  )
}
