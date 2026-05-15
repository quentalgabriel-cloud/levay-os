'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

const DECISION_TYPES = ['estrategica', 'operacional', 'financeira', 'pessoa', 'cliente', 'outro'] as const
const REVERSIBILITY = ['reversivel', 'irreversivel'] as const
const FORMATS = ['open', 'taken', 'archived'] as const

const decisionInputSchema = z.object({
  title: z.string().trim().min(1, 'Título da decisão é obrigatório'),
  practical_change: z.string().trim().min(1, 'O que muda na prática é obrigatório — preencha ou use "[pendente]" como rascunho'),
  context: z.string().trim().optional().or(z.literal('')),
  alternatives: z.string().trim().optional().or(z.literal('')),
  expected_outcome: z.string().trim().optional().or(z.literal('')),
  decision_type: z.enum(DECISION_TYPES).default('estrategica'),
  reversibility: z.enum(REVERSIBILITY).default('reversivel'),
  format: z.enum(FORMATS).default('open'),
  company_id: z.string().uuid().optional().or(z.literal('')),
})

function parseFormData(formData: FormData) {
  return decisionInputSchema.safeParse({
    title: formData.get('title') ?? '',
    practical_change: formData.get('practical_change') ?? '',
    context: formData.get('context') ?? '',
    alternatives: formData.get('alternatives') ?? '',
    expected_outcome: formData.get('expected_outcome') ?? '',
    decision_type: formData.get('decision_type') ?? 'estrategica',
    reversibility: formData.get('reversibility') ?? 'reversivel',
    format: formData.get('format') ?? 'open',
    company_id: formData.get('company_id') ?? '',
  })
}

export async function createDecision(formData: FormData) {
  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await supabase
    .from('decisions')
    .insert({
      title: parsed.data.title,
      practical_change: parsed.data.practical_change,
      context: parsed.data.context || null,
      alternatives: parsed.data.alternatives || null,
      expected_outcome: parsed.data.expected_outcome || null,
      decision_type: parsed.data.decision_type,
      reversibility: parsed.data.reversibility,
      format: parsed.data.format,
      company_id: parsed.data.company_id || null,
      workspace_id: workspaceId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating decision:', error)
    return { error: error.message }
  }

  revalidatePath('/decisoes')
  revalidatePath('/mesa')
  return { success: true, data }
}

export async function updateDecision(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('decisions')
    .update({
      title: parsed.data.title,
      practical_change: parsed.data.practical_change,
      context: parsed.data.context || null,
      alternatives: parsed.data.alternatives || null,
      expected_outcome: parsed.data.expected_outcome || null,
      decision_type: parsed.data.decision_type,
      reversibility: parsed.data.reversibility,
      format: parsed.data.format,
      company_id: parsed.data.company_id || null,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error updating decision:', error)
    return { error: error.message }
  }

  revalidatePath('/decisoes')
  revalidatePath('/mesa')
  return { success: true }
}

export async function archiveDecision(id: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('decisions')
    .update({ format: 'archived' })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error archiving decision:', error)
    return { error: error.message }
  }

  revalidatePath('/decisoes')
  revalidatePath('/mesa')
  return { success: true }
}

export async function deleteDecision(id: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error deleting decision:', error)
    return { error: error.message }
  }

  revalidatePath('/decisoes')
  revalidatePath('/mesa')
  return { success: true }
}
