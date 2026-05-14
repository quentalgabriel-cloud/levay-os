'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

const ALLOWED_ESCOPOS = new Set(['SOLLU', 'BICA', 'AMP213', 'PESSOAL_ERICK', 'GERAL'])

function readDnaFields(formData: FormData) {
  const trimOrNull = (key: string) => (formData.get(key) as string | null)?.trim() || null
  const escopoRaw = (formData.get('escopo') as string | null)?.trim().toUpperCase()
  return {
    cluster: trimOrNull('cluster'),
    escopo: escopoRaw && ALLOWED_ESCOPOS.has(escopoRaw) ? escopoRaw : null,
    dna_oneliner: trimOrNull('dna_oneliner'),
    promessa: trimOrNull('promessa'),
    tom_voz: trimOrNull('tom_voz'),
    anti_publico: trimOrNull('anti_publico'),
    principal_desafio: trimOrNull('principal_desafio'),
    principal_oportunidade: trimOrNull('principal_oportunidade'),
    proximo_marco: trimOrNull('proximo_marco'),
    compartilha_predio_com: trimOrNull('compartilha_predio_com'),
    compartilha_cozinha_com: trimOrNull('compartilha_cozinha_com'),
  }
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string | null
  const tagline = formData.get('tagline') as string | null
  const color = formData.get('color') as string | null

  if (!name?.trim()) {
    return { error: 'Nome da empresa é obrigatório' }
  }

  // Generate slug from name if not provided
  const finalSlug = slug?.trim() || name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: name.trim(),
      slug: finalSlug,
      tagline: tagline?.trim() || null,
      color: color || '#6b7280',
      workspace_id: workspaceId,
      ...readDnaFields(formData),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating company:', error)
    return { error: error.message }
  }

  revalidatePath('/empresas')
  revalidatePath('/mesa')
  
  return { success: true, data }
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string | null
  const tagline = formData.get('tagline') as string | null
  const color = formData.get('color') as string | null

  type CompanyUpdate = {
    name?: string
    slug?: string
    tagline?: string
    color?: string
    cluster?: string | null
    escopo?: string | null
    dna_oneliner?: string | null
    promessa?: string | null
    tom_voz?: string | null
    anti_publico?: string | null
    principal_desafio?: string | null
    principal_oportunidade?: string | null
    proximo_marco?: string | null
    compartilha_predio_com?: string | null
    compartilha_cozinha_com?: string | null
  }
  const updates: CompanyUpdate = {}

  if (name) updates.name = name.trim()
  if (slug !== undefined) updates.slug = slug?.trim() || undefined
  if (tagline !== undefined) updates.tagline = tagline?.trim() || undefined
  if (color) updates.color = color

  const dnaKeys: Array<keyof Omit<CompanyUpdate, 'name' | 'slug' | 'tagline' | 'color'>> = [
    'cluster', 'escopo', 'dna_oneliner', 'promessa', 'tom_voz', 'anti_publico',
    'principal_desafio', 'principal_oportunidade', 'proximo_marco',
    'compartilha_predio_com', 'compartilha_cozinha_com',
  ]
  const dna = readDnaFields(formData)
  for (const key of dnaKeys) {
    if (formData.has(key)) updates[key] = dna[key]
  }

  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating company:', error)
    return { error: error.message }
  }

  revalidatePath('/empresas')
  revalidatePath('/mesa')
  
  return { success: true }
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting company:', error)
    return { error: error.message }
  }

  revalidatePath('/empresas')
  revalidatePath('/mesa')
  
  return { success: true }
}

// Batch operations
export async function bulkCreateCompanies(companies: { name: string; color?: string }[]) {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const toInsert = companies.map(c => {
    const slug = c.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return {
      name: c.name.trim(),
      slug,
      color: c.color || '#6b7280',
      workspace_id: workspaceId,
    }
  })

  // Use upsert on unique constraint: workspace_id + slug
  // This prevents duplicate slugs within same workspace
  const { data, error } = await supabase
    .from('companies')
    .upsert(toInsert, { onConflict: 'workspace_id_slug_key' })
    .select()

  if (error) {
    console.error('Error bulk creating companies:', error)
    return { error: error.message }
  }

  revalidatePath('/empresas')
  
  return { success: true, data }
}