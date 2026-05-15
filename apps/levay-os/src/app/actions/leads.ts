'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

export type LeadStatus = 'active' | 'won' | 'lost' | 'archived'
export type InteractionType = 'note' | 'whatsapp' | 'email' | 'call' | 'meeting'

export interface CreateLeadInput {
  name: string
  stageId: string
  pipelineId: string
  phone?: string
  email?: string
  source?: string
  notes?: string
  nextFollowUpAt?: string
}

export interface UpdateLeadStageInput {
  leadId: string
  stageId: string
}

export interface AddInteractionInput {
  leadId: string
  type: InteractionType
  content: string
}

export async function ensureSolluPipeline() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await supabase.rpc('initialize_sollu_pipeline', {
    p_workspace_id: workspaceId,
  })

  if (error) {
    console.error('Error initializing Sollu pipeline:', error)
    return { error: error.message }
  }

  return { data: { pipelineId: data as string } }
}

export async function getSolluPipeline() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: pipeline, error: pipelineError } = await supabase
    .from('crm_pipelines')
    .select('id, name')
    .eq('workspace_id', workspaceId)
    .eq('name', 'Sollu')
    .single()

  if (pipelineError || !pipeline) {
    await ensureSolluPipeline()
    const { data: retried } = await supabase
      .from('crm_pipelines')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .eq('name', 'Sollu')
      .single()
    if (!retried) return { error: 'Pipeline não encontrado', data: null }
    return { data: retried, error: null }
  }

  return { data: pipeline, error: null }
}

export async function getSolluStages() {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const pipelineResult = await getSolluPipeline()
  if (pipelineResult.error || !pipelineResult.data) {
    return { error: pipelineResult.error || 'Pipeline não encontrado', data: null }
  }

  const { data, error } = await supabase
    .from('crm_stages')
    .select('id, name, color, position')
    .eq('workspace_id', workspaceId)
    .eq('pipeline_id', pipelineResult.data.id)
    .order('position')

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function getLeadsByPipeline(pipelineId: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await supabase
    .from('crm_leads')
    .select(`
      id, name, phone, email, source, notes, status,
      next_follow_up_at, created_at, updated_at,
      stage_id,
      crm_stages ( id, name, color, position )
    `)
    .eq('workspace_id', workspaceId)
    .eq('pipeline_id', pipelineId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createLead(input: CreateLeadInput) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  if (!input.name?.trim()) {
    return { error: 'Nome do lead é obrigatório', data: null }
  }

  const { data, error } = await supabase
    .from('crm_leads')
    .insert({
      workspace_id: workspaceId,
      pipeline_id: input.pipelineId,
      stage_id: input.stageId,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      source: input.source?.trim() || null,
      notes: input.notes?.trim() || null,
      next_follow_up_at: input.nextFollowUpAt || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating lead:', error)
    return { error: error.message, data: null }
  }

  if (data && data.phone) {
    const offsets = [0, 1, 3]
    const jobs = offsets.map((offset) => ({
      workspace_id: workspaceId,
      lead_id: data.id,
      phone: data.phone!,
      offset_days: offset,
      idempotency_key: `${workspaceId}:${data.id}:D+${offset}`,
      scheduled_at: new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      attempts: 0,
    }))
    const { error: jobsError } = await supabase
      .from('followup_jobs')
      .upsert(jobs, { onConflict: 'workspace_id,idempotency_key' })
    if (jobsError) {
      console.error('[createLead] falha ao agendar followup jobs:', jobsError)
    }
  }

  revalidatePath('/crm/sollu')
  return { data, error: null }
}

export async function updateLeadStage({ leadId, stageId }: UpdateLeadStageInput) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('crm_leads')
    .update({ stage_id: stageId })
    .eq('id', leadId)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error updating lead stage:', error)
    return { error: error.message }
  }

  revalidatePath('/crm/sollu')
  return { success: true }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('crm_leads')
    .update({ status })
    .eq('id', leadId)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error updating lead status:', error)
    return { error: error.message }
  }

  revalidatePath('/crm/sollu')
  return { success: true }
}

export async function addInteraction({ leadId, type, content }: AddInteractionInput) {
  const supabase = await createClient()
  const { workspaceId, userId } = await getWorkspaceContext(supabase)

  if (!content?.trim()) {
    return { error: 'Conteúdo da interação é obrigatório', data: null }
  }

  const { data, error } = await supabase
    .from('crm_interactions')
    .insert({
      workspace_id: workspaceId,
      lead_id: leadId,
      type,
      content: content.trim(),
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding interaction:', error)
    return { error: error.message, data: null }
  }

  revalidatePath('/crm/sollu')
  return { data, error: null }
}

export async function getLeadInteractions(leadId: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await supabase
    .from('crm_interactions')
    .select('id, type, content, created_at, created_by')
    .eq('lead_id', leadId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

