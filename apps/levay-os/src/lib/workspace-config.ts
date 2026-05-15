import 'server-only'
import { createClient } from './supabase/server'
import { getWorkspaceContext } from './tenant-context'

const CONFIG_DEFAULTS = {
  cap_hoje: 3 as number,
  palette_version: 'legado' as string,
  bica_amp_cluster_id: 'bica+amp' as string,
  entry_route: '/mesa' as string,
  // Compras: valor estimado acima deste teto (R$) dispara exception_flagged
  procurement_exception_threshold: 500 as number,
} as const

export type WorkspaceConfigKey = keyof typeof CONFIG_DEFAULTS

type ConfigValue<K extends WorkspaceConfigKey> = typeof CONFIG_DEFAULTS[K]

// No caching - each request must fetch fresh config for current workspace
export async function getAllWorkspaceConfig(): Promise<Record<string, unknown>> {
  const supabase = await createClient()
  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data, error } = await supabase
    .from('workspace_config')
    .select('key, value')
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error loading workspace_config:', error)
    return { ...CONFIG_DEFAULTS }
  }

  const map: Record<string, unknown> = { ...CONFIG_DEFAULTS }
  for (const row of data ?? []) {
    map[row.key] = row.value
  }
  return map
}

export async function getWorkspaceConfig<K extends WorkspaceConfigKey>(key: K): Promise<ConfigValue<K>> {
  const all = await getAllWorkspaceConfig()
  const value = all[key]
  if (value === undefined || value === null) {
    return CONFIG_DEFAULTS[key]
  }
  return value as ConfigValue<K>
}

export async function getCapHoje(): Promise<number> {
  const raw = await getWorkspaceConfig('cap_hoje')
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : CONFIG_DEFAULTS.cap_hoje
}

export async function getPaletteVersion(): Promise<string> {
  return getWorkspaceConfig('palette_version')
}

export async function getEntryRoute(): Promise<string> {
  return getWorkspaceConfig('entry_route')
}

export async function getProcurementExceptionThreshold(): Promise<number> {
  const raw = await getWorkspaceConfig('procurement_exception_threshold')
  const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : CONFIG_DEFAULTS.procurement_exception_threshold
}
