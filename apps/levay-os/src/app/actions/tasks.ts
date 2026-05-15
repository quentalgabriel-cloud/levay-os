'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const title = formData.get('title') as string
  const minimum_movement = formData.get('minimum_movement') as string
  const company_id = formData.get('company_id') as string | null
  const due_at = formData.get('due_at') as string | null
  const priority = formData.get('priority') as string | null
  const status = formData.get('status') as string || 'a_fazer'

  if (!title?.trim() || !minimum_movement?.trim()) {
    return { error: 'Título e próximo movimento são obrigatórios' }
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      minimum_movement: minimum_movement.trim(),
      company_id: company_id || null,
      due_at: due_at || null,
      priority: priority ? parseInt(priority) : 2,
      status,
      workspace_id: workspaceId,
    })
    .select()
    .single()

  if (error) {
    console.error('[tasks] createTask', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/tarefas')
  revalidatePath('/mesa')

  return { success: true, data }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const title = formData.get('title') as string
  const minimum_movement = formData.get('minimum_movement') as string
  const company_id = formData.get('company_id') as string | null
  const due_at = formData.get('due_at') as string | null
  const priority = formData.get('priority') as string | null
  const status = formData.get('status') as string

  type TaskUpdate = { title?: string; minimum_movement?: string; company_id?: string | null; due_at?: string | null; priority?: number; status?: string }
  const updates: TaskUpdate = {}

  if (title) updates.title = title.trim()
  if (minimum_movement) updates.minimum_movement = minimum_movement.trim()
  if (company_id !== undefined) updates.company_id = company_id || null
  if (due_at !== undefined) updates.due_at = due_at || null
  if (priority) updates.priority = parseInt(priority)
  if (status) updates.status = status

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[tasks] updateTask', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/tarefas')
  revalidatePath('/mesa')

  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[tasks] deleteTask', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/tarefas')
  revalidatePath('/mesa')

  return { success: true }
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[tasks] updateTaskStatus', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/tarefas')
  revalidatePath('/mesa')

  return { success: true }
}

export async function bulkUpdateTaskStatus(ids: string[], status: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .in('id', ids)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[tasks] bulkUpdateTaskStatus', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/tarefas')
  revalidatePath('/mesa')
  
  return { success: true }
}