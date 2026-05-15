'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

interface ProcurementItem {
  description: string
  unit: string
  quantity_requested: number
  estimated_unit_price: number | null
}

interface CreateProcurementInput {
  idempotency_key: string
  company_id: string
  title: string
  needed_by: string
  notes: string | null
  items: ProcurementItem[]
}

export async function createProcurementRequest(input: CreateProcurementInput) {
  const supabase = await createClient()
  const { workspaceId, userId } = await getWorkspaceContext(supabase)

  const { data: existing } = await supabase
    .from('procurement_requests')
    .select('id')
    .eq('idempotency_key', input.idempotency_key)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (existing) {
    return { id: existing.id, deduped: true, error: null }
  }

  const { data: request, error: reqError } = await supabase
    .from('procurement_requests')
    .insert({
      workspace_id: workspaceId,
      company_id: input.company_id,
      idempotency_key: input.idempotency_key,
      title: input.title,
      needed_by: input.needed_by,
      notes: input.notes,
      status: 'solicitado',
      requested_by: userId,
    })
    .select('id')
    .single()

  if (reqError) {
    if (reqError.code === '23505') {
      const { data: dup, error: dupErr } = await supabase
        .from('procurement_requests')
        .select('id')
        .eq('idempotency_key', input.idempotency_key)
        .eq('workspace_id', workspaceId)
        .maybeSingle()
      if (dupErr) return { error: 'Falha ao verificar duplicata: ' + dupErr.message, id: null, deduped: false }
      return { id: dup?.id ?? null, deduped: true, error: null }
    }
    return { error: reqError.message, id: null, deduped: false }
  }

  const { error: itemsError } = await supabase
    .from('procurement_items')
    .insert(
      input.items.map(item => ({
        request_id: request.id,
        workspace_id: workspaceId,
        description: item.description,
        unit: item.unit,
        quantity_requested: item.quantity_requested,
        estimated_unit_price: item.estimated_unit_price,
      }))
    )

  if (itemsError) {
    await supabase.from('procurement_requests').delete().eq('id', request.id)
    return { error: 'Falha ao salvar itens: ' + itemsError.message, id: null, deduped: false }
  }

  revalidatePath('/compras')
  revalidatePath('/mesa')

  return { id: request.id, deduped: false, error: null }
}

export async function updateProcurementStatus(
  requestId: string,
  status: 'consolidado' | 'comprado' | 'recebido' | 'cancelado'
) {
  const supabase = await createClient()
  const { workspaceId, userId } = await getWorkspaceContext(supabase)

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('procurement_requests')
    .update({
      status,
      ...(status === 'consolidado' && { consolidated_at: now, consolidated_by: userId }),
      ...(status === 'comprado' && { purchased_at: now }),
      ...(status === 'recebido' && { received_at: now }),
    })
    .eq('id', requestId)
    .eq('workspace_id', workspaceId)

  if (error) return { error: error.message }

  revalidatePath('/compras')
  revalidatePath(`/compras/${requestId}`)
  revalidatePath('/mesa')

  return { error: null }
}

export async function approveException(requestId: string) {
  const supabase = await createClient()
  const { workspaceId, userId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('procurement_requests')
    .update({ approved_by: userId })
    .eq('id', requestId)
    .eq('workspace_id', workspaceId)
    .eq('exception_flagged', true)

  if (error) return { error: error.message }

  revalidatePath('/mesa')
  revalidatePath(`/compras/${requestId}`)

  return { error: null }
}
