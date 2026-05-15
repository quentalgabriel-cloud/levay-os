import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function ingestLeadFromWebhook({
  eventId,
  workspaceId,
  name,
  phone,
  source,
  campaign,
}: {
  eventId: string
  workspaceId: string
  name: string
  phone?: string
  source: string
  campaign?: string
}) {
  const supabase = await createClient()

  const { data: pipeline } = await supabase
    .from('crm_pipelines')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('name', 'Sollu')
    .single()

  if (!pipeline) return { error: 'Pipeline Sollu não inicializado', data: null }

  const { data: firstStage } = await supabase
    .from('crm_stages')
    .select('id')
    .eq('pipeline_id', pipeline.id)
    .eq('workspace_id', workspaceId)
    .order('position')
    .limit(1)
    .single()

  if (!firstStage) return { error: 'Stages não configurados', data: null }

  const { data: existing } = await supabase
    .from('crm_leads')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('notes', `webhook:${eventId}`)
    .maybeSingle()

  if (existing) return { data: { leadId: existing.id, duplicate: true }, error: null }

  const { data, error } = await supabase
    .from('crm_leads')
    .insert({
      workspace_id: workspaceId,
      pipeline_id: pipeline.id,
      stage_id: firstStage.id,
      name,
      phone: phone || null,
      source,
      notes: `webhook:${eventId}${campaign ? ` campaign:${campaign}` : ''}`,
    })
    .select('id')
    .single()

  if (error) return { error: error.message, data: null }

  revalidatePath('/crm/sollu')
  return { data: { leadId: data.id, duplicate: false }, error: null }
}
