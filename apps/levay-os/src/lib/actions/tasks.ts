'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { triageCaptureWithAI } from '../agents/intelligence'

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  minimum_movement: z.string().min(1, 'Movimento mínimo obrigatório'),
  company_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  due_at: z.string().nullable().optional(),
  description: z.string().optional(),
  priority: z.coerce.number().min(1).max(4).nullable().optional(),
})

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: wsId, error: wsErr } = await supabase.rpc('get_my_workspace_id')
  if (wsErr || !wsId) return { error: 'Workspace não encontrado' }

  const parsed = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    minimum_movement: formData.get('minimum_movement'),
    company_id: formData.get('company_id') || null,
    project_id: formData.get('project_id') || null,
    due_at: formData.get('due_at') || null,
    description: formData.get('description') || null,
    priority: formData.get('priority') || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase.from('tasks').insert({
    ...parsed.data,
    workspace_id: wsId,
    status: 'em_andamento',
    inbox: false,
  })

  if (error) return { error: error.message }

  revalidatePath('/mesa')
  revalidatePath('/tarefas')
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath('/mesa')
  revalidatePath('/tarefas')
  return { success: true }
}

export async function processCapture(captureId: string, action: 'task' | 'dismiss' | 'ai') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  if (action === 'dismiss') {
    await supabase
      .from('captures')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', captureId)
    revalidatePath('/mesa')
    return { success: true }
  }

  const { data: capture } = await supabase
    .from('captures')
    .select('*')
    .eq('id', captureId)
    .single()

  if (!capture) return { error: 'Captura não encontrada' }

  const { data: wsId } = await supabase.rpc('get_my_workspace_id')
  if (!wsId) return { error: 'Workspace não encontrado' }

  if (action === 'ai') {
    try {
      const triage = await triageCaptureWithAI(capture.raw_text ?? capture.transcript ?? '')
      
      let companyId: string | null = null
      if (triage.company_slug) {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', triage.company_slug)
          .single()
        companyId = company?.id ?? null
      }

      await supabase.from('tasks').insert({
        title: triage.title,
        minimum_movement: triage.minimum_movement,
        workspace_id: wsId,
        status: triage.status,
        block: triage.status_cockpit,
        priority: triage.priority,
        company_id: companyId,
        inbox: triage.status === 'inbox',
      })
    } catch (err) {
      console.error('Erro na triagem do Nonô:', err)
      return { error: 'O Nonô teve um curto-circuito. Tente triagem manual.' }
    }
  } else {
    await supabase.from('tasks').insert({
      title: capture.raw_text ?? capture.transcript ?? 'Tarefa da captura',
      minimum_movement: '',
      workspace_id: wsId,
      status: 'inbox',
      inbox: true,
    })
  }

  await supabase
    .from('captures')
    .update({ processed_at: new Date().toISOString(), destination_kind: 'task' })
    .eq('id', captureId)

  revalidatePath('/mesa')
  return { success: true }
}
