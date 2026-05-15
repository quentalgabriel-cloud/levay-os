'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

const TIPOS = ['LACUNA', 'PERGUNTA', 'MELHORIA_UX_UI', 'RISCO', 'IDEIA', 'DEPENDENCIA'] as const
const STATUSES = ['ABERTA', 'EM_ANALISE', 'EM_IMPLEMENTACAO', 'RESOLVIDA', 'ARQUIVADA'] as const
const IMPACTOS = ['ALTO', 'MEDIO', 'BAIXO'] as const

const CLOSED_STATUSES = new Set(['RESOLVIDA', 'ARQUIVADA'])

const lacunaInputSchema = z.object({
  titulo: z.string().trim().min(1, 'Título é obrigatório'),
  tipo: z.enum(TIPOS).default('LACUNA'),
  status: z.enum(STATUSES).default('ABERTA'),
  impacto: z.enum(IMPACTOS).default('MEDIO'),
  empresa_id: z.string().uuid().optional().or(z.literal('')),
  contexto: z.string().trim().optional().or(z.literal('')),
  proximo_movimento: z.string().trim().optional().or(z.literal('')),
  bloqueia: z.string().trim().optional().or(z.literal('')),
  dono_collaborator_id: z.string().uuid().optional().or(z.literal('')),
})

function parseLacuna(formData: FormData) {
  return lacunaInputSchema.safeParse({
    titulo: formData.get('titulo') ?? '',
    tipo: formData.get('tipo') ?? 'LACUNA',
    status: formData.get('status') ?? 'ABERTA',
    impacto: formData.get('impacto') ?? 'MEDIO',
    empresa_id: formData.get('empresa_id') ?? '',
    contexto: formData.get('contexto') ?? '',
    proximo_movimento: formData.get('proximo_movimento') ?? '',
    bloqueia: formData.get('bloqueia') ?? '',
    dono_collaborator_id: formData.get('dono_collaborator_id') ?? '',
  })
}

export async function createLacuna(formData: FormData) {
  const parsed = parseLacuna(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const resolvida_em = CLOSED_STATUSES.has(parsed.data.status) ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('lacunas')
    .insert({
      workspace_id: workspaceId,
      titulo: parsed.data.titulo,
      tipo: parsed.data.tipo,
      status: parsed.data.status,
      impacto: parsed.data.impacto,
      empresa_id: parsed.data.empresa_id || undefined,
      contexto: parsed.data.contexto || null,
      proximo_movimento: parsed.data.proximo_movimento || null,
      bloqueia: parsed.data.bloqueia || null,
      dono_collaborator_id: parsed.data.dono_collaborator_id || null,
      resolvida_em,
    })
    .select()
    .single()

  if (error) {
    console.error('[lacunas] createLacuna', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/mesa')
  revalidatePath('/lacunas')
  return { success: true, data }
}

export async function updateLacuna(id: string, formData: FormData) {
  const parsed = parseLacuna(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const resolvida_em = CLOSED_STATUSES.has(parsed.data.status) ? new Date().toISOString() : null

  const { error } = await supabase
    .from('lacunas')
    .update({
      titulo: parsed.data.titulo,
      tipo: parsed.data.tipo,
      status: parsed.data.status,
      impacto: parsed.data.impacto,
      empresa_id: parsed.data.empresa_id || undefined,
      contexto: parsed.data.contexto || null,
      proximo_movimento: parsed.data.proximo_movimento || null,
      bloqueia: parsed.data.bloqueia || null,
      dono_collaborator_id: parsed.data.dono_collaborator_id || null,
      resolvida_em,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[lacunas] updateLacuna', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/mesa')
  revalidatePath('/lacunas')
  return { success: true }
}

export async function resolveLacuna(id: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('lacunas')
    .update({ status: 'RESOLVIDA', resolvida_em: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[lacunas] resolveLacuna', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/mesa')
  revalidatePath('/lacunas')
  return { success: true }
}

export async function deleteLacuna(id: string) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { error } = await supabase
    .from('lacunas')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[lacunas] deleteLacuna', error)
    return { error: 'Ocorreu um erro. Tente novamente.' }
  }

  revalidatePath('/mesa')
  revalidatePath('/lacunas')
  return { success: true }
}
