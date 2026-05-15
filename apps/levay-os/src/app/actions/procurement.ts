'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { getProcurementExceptionThreshold } from '@/lib/workspace-config'
import { revalidatePath } from 'next/cache'

export interface ProcurementItemInput {
  description: string
  unit: string
  quantity_requested: number
  estimated_unit_price: number | null
}

export interface CreateProcurementInput {
  idempotency_key: string
  company_id: string
  title: string
  needed_by: string
  notes: string | null
  items: ProcurementItemInput[]
}

export async function createProcurementRequest(input: CreateProcurementInput) {
  const supabase = await createClient()
  const { workspaceId, userId } = await getWorkspaceContext(supabase)

  if (!input.title?.trim()) return { error: 'Título é obrigatório', data: null }
  if (!input.items?.length) return { error: 'Adicione pelo menos 1 item', data: null }
  if (!input.company_id) return { error: 'Selecione uma unidade', data: null }

  const db = supabase as any

  // Idempotency: retorna existente sem duplicar
  const { data: existing } = await db
    .from('procurement_requests')
    .select('id, status')
    .eq('workspace_id', workspaceId)
    .eq('idempotency_key', input.idempotency_key)
    .maybeSingle()

  if (existing) return { data: { id: existing.id as string, deduped: true }, error: null }

  const estimated_total = input.items.reduce(
    (sum, item) => sum + (item.estimated_unit_price ?? 0) * item.quantity_requested,
    0
  )

  const exceptionThreshold = await getProcurementExceptionThreshold()
  const exception_flagged = estimated_total > 0 && estimated_total > exceptionThreshold
  const exception_reason = exception_flagged
    ? `Total estimado R$ ${estimated_total.toFixed(2)} acima do teto de R$ ${exceptionThreshold.toFixed(2)}`
    : null

  const { data: request, error: reqError } = await db
    .from('procurement_requests')
    .insert({
      workspace_id: workspaceId,
      company_id: input.company_id,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      needed_by: input.needed_by,
      requested_by: userId,
      idempotency_key: input.idempotency_key,
      estimated_total: estimated_total > 0 ? estimated_total : null,
      exception_flagged,
      exception_reason,
    })
    .select('id')
    .single()

  if (reqError) {
    if (reqError.code === '23505') {
      const { data: raced } = await db
        .from('procurement_requests')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('idempotency_key', input.idempotency_key)
        .single()
      return { data: { id: (raced?.id ?? null) as string | null, deduped: true }, error: null }
    }
    return { error: reqError.message, data: null }
  }

  const requestId = (request as { id: string }).id

  const { error: itemsError } = await db
    .from('procurement_items')
    .insert(
      input.items.map(item => ({
        workspace_id: workspaceId,
        request_id: requestId,
        description: item.description.trim(),
        unit: item.unit,
        quantity_requested: item.quantity_requested,
        estimated_unit_price: item.estimated_unit_price ?? null,
      }))
    )

  if (itemsError) {
    await db.from('procurement_requests').delete().eq('id', requestId)
    return { error: itemsError.message, data: null }
  }

  // log_procurement_event é SECURITY DEFINER — tipos não cobrem ainda
  await (supabase as any).rpc('log_procurement_event', {
    p_request_id: requestId,
    p_event_type: 'created',
    p_payload: { items_count: input.items.length, title: input.title.trim() },
  })

  revalidatePath('/compras')
  return { data: { id: requestId, deduped: false }, error: null }
}

export async function getProcurementRequests() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await (supabase as any)
    .from('procurement_requests')
    .select(`
      id, title, status, needed_by, estimated_total,
      exception_flagged, exception_reason,
      companies (name, color),
      procurement_items (id)
    `)
    .eq('workspace_id', workspaceId)
    .neq('status', 'cancelado')
    .order('needed_by', { ascending: true })

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function getProcurementDetail(requestId: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: request, error } = await (supabase as any)
    .from('procurement_requests')
    .select(`
      id, title, status, needed_by, notes,
      estimated_total, actual_total,
      exception_flagged, exception_reason,
      requested_at, consolidated_at, purchased_at, received_at,
      request_number,
      companies (id, name, color),
      procurement_items (
        id, description, unit, category, notes,
        quantity_requested, quantity_received,
        estimated_unit_price, actual_unit_price, line_total,
        item_status
      ),
      procurement_history (
        id, event_type, payload, created_at, actor_user_id
      )
    `)
    .eq('id', requestId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { referencedTable: 'procurement_history', ascending: false })
    .single()

  if (error) return { error: error.message, data: null }
  return { data: request, error: null }
}

type AdvanceStatus = 'consolidado' | 'comprado' | 'recebido' | 'cancelado'

const VALID_TRANSITIONS: Record<string, AdvanceStatus[]> = {
  solicitado: ['consolidado', 'cancelado'],
  consolidado: ['comprado', 'cancelado'],
  comprado: ['recebido', 'cancelado'],
}

const STATUS_TIMESTAMP: Record<string, string> = {
  consolidado: 'consolidated_at',
  comprado: 'purchased_at',
  recebido: 'received_at',
}

const STATUS_EVENT: Record<string, string> = {
  consolidado: 'consolidated',
  comprado: 'sent_to_supplier',
  recebido: 'received',
  cancelado: 'cancelled',
}

export async function updateProcurementStatus(requestId: string, newStatus: AdvanceStatus) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)
  const db = supabase as any

  const { data: current } = await db
    .from('procurement_requests')
    .select('status')
    .eq('id', requestId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!current) return { error: 'Pedido não encontrado', data: null }

  if (!VALID_TRANSITIONS[current.status]?.includes(newStatus)) {
    return { error: `Transição inválida: ${current.status} → ${newStatus}`, data: null }
  }

  const patch: Record<string, string> = { status: newStatus }
  if (STATUS_TIMESTAMP[newStatus]) {
    patch[STATUS_TIMESTAMP[newStatus]] = new Date().toISOString()
  }

  const { error } = await db
    .from('procurement_requests')
    .update(patch)
    .eq('id', requestId)
    .eq('workspace_id', workspaceId)

  if (error) return { error: error.message, data: null }

  await db.rpc('log_procurement_event', {
    p_request_id: requestId,
    p_event_type: STATUS_EVENT[newStatus],
    p_payload: { previous_status: current.status },
  })

  revalidatePath('/compras')
  revalidatePath(`/compras/${requestId}`)
  return { data: { id: requestId, status: newStatus }, error: null }
}
