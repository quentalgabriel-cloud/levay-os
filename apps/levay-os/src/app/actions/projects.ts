'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const name = formData.get('name') as string
  const company_id = formData.get('company_id') as string | null
  const status = formData.get('status') as string || 'ativo'
  const next_milestone = formData.get('next_milestone') as string | null
  const modalityRaw = (formData.get('modality') as string | null)?.toLowerCase()
  const modality = modalityRaw === 'continuo' ? 'continuo' : 'pontual'
  const foco_trimestral = (formData.get('foco_trimestral') as string | null)?.trim() || null

  if (!name?.trim()) {
    return { error: 'Nome do projeto é obrigatório' }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: name.trim(),
      company_id: company_id || null,
      status,
      next_milestone: next_milestone?.trim() || null,
      modality,
      foco_trimestral,
      workspace_id: workspaceId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath('/projetos')
  revalidatePath('/mesa')
  
  return { success: true, data }
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const company_id = formData.get('company_id') as string | null
  const status = formData.get('status') as string
  const next_milestone = formData.get('next_milestone') as string | null
  const attention = formData.get('attention') as string | null
  const blocking = formData.get('blocking') as string | null
  const health_score = formData.get('health_score') as string | null
  const modalityRaw = (formData.get('modality') as string | null)?.toLowerCase()
  const foco_trimestral = formData.get('foco_trimestral') as string | null

  type ProjectUpdate = { name?: string; company_id?: string | null; status?: string; next_milestone?: string | null; attention?: string | null; blocking?: string | null; health_score?: number | null; modality?: string; foco_trimestral?: string | null }
  const updates: ProjectUpdate = {}

  if (name) updates.name = name.trim()
  if (company_id !== undefined) updates.company_id = company_id || null
  if (status) updates.status = status
  if (next_milestone !== undefined) updates.next_milestone = next_milestone?.trim() || null
  if (attention !== undefined) updates.attention = attention?.trim() || null
  if (blocking !== undefined) updates.blocking = blocking?.trim() || null
  if (health_score !== undefined) updates.health_score = health_score ? parseInt(health_score) : null
  if (modalityRaw === 'continuo' || modalityRaw === 'pontual') updates.modality = modalityRaw
  if (foco_trimestral !== undefined) updates.foco_trimestral = foco_trimestral?.trim() || null

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message }
  }

  revalidatePath('/projetos')
  revalidatePath('/mesa')
  
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/projetos')
  revalidatePath('/mesa')
  
  return { success: true }
}

export async function archiveProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ status: 'arquivado' })
    .eq('id', id)

  if (error) {
    console.error('Error archiving project:', error)
    return { error: error.message }
  }

  revalidatePath('/projetos')
  
  return { success: true }
}