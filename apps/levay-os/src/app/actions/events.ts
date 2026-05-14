'use server'

// Called by: bica-amp/page.tsx (binds companyId, passes as props to EventAgenda)
// Purpose: create/delete rows in the events table via RLS-protected server actions
// Table fields: { title, event_date, company_id, workspace_id, status }

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

export async function createEvent(
  companyId: string,
  title: string,
  date: string,
  time?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  if (!title.trim() || !date) return { error: 'Título e data são obrigatórios' }

  const eventDate = time ? `${date}T${time}:00` : date

  const { error } = await supabase.from('events').insert({
    company_id: companyId,
    workspace_id: workspaceId,
    title: title.trim(),
    event_date: eventDate,
    status: 'planejado',
  })

  if (error) return { error: error.message }

  revalidatePath('/bica-amp')
  return {}
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: error.message }

  revalidatePath('/bica-amp')
  return {}
}
