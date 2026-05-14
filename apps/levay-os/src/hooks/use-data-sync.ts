'use client'

import { useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTasksCache, useProjectsCache, useCompaniesCache, useClearCache } from './use-app-store'
import { useAppStore } from '@/stores/app-store'
import { createClient } from '@/lib/supabase/client'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

interface UseDataSyncOptions {
  onCacheHit?: () => void
  onCacheMiss?: () => void
}

// Hook para sincronizar tarefas
export function useSyncTasks(workspaceId: string, options: UseDataSyncOptions = {}) {
  const { cachedTasks, isLoadingTasks, setCachedTasks, setLoadingTasks } = useTasksCache()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .neq('status', 'ciclo_fechado')
      .order('priority', { ascending: false })
      .order('created_at')
      .limit(100)
    
    if (!error && data) {
      setCachedTasks(data.map(t => ({
        id: t.id, title: t.title,
        minimum_movement: t.minimum_movement ?? undefined,
        company_id: t.company_id ?? undefined,
        due_at: t.due_at ?? undefined,
        priority: t.priority != null ? String(t.priority) : undefined,
        status: t.status, created_at: t.created_at,
      })))
      options.onCacheMiss?.()
    }
    
    setLoadingTasks(false)
  }, [workspaceId, setCachedTasks, setLoadingTasks, options.onCacheMiss])
  
  const refresh = useCallback(() => {
    startTransition(() => {
      fetchTasks()
      router.refresh()
    })
  }, [fetchTasks, router])
  
  // Verificar se precisa buscar do servidor
  useEffect(() => {
    if (!cachedTasks) {
      fetchTasks()
      return
    }
    
    const timeSinceLastUpdate = Date.now() - (useAppStore.getState().lastTasksUpdate || 0)
    if (timeSinceLastUpdate > CACHE_DURATION) {
      fetchTasks()
    } else {
      options.onCacheHit?.()
    }
  }, [workspaceId])
  
  return {
    tasks: cachedTasks,
    isLoading: isLoadingTasks || isPending,
    refresh,
    refetch: fetchTasks,
  }
}

// Hook para sincronizar projetos
export function useSyncProjects(workspaceId: string, options: UseDataSyncOptions = {}) {
  const { cachedProjects, isLoadingProjects, setCachedProjects, setLoadingProjects } = useProjectsCache()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .neq('status', 'arquivado')
      .order('status')
      .order('name')
    
    if (!error && data) {
      setCachedProjects(data.map(p => ({
        id: p.id, name: p.name, status: p.status,
        company_id: p.company_id ?? undefined,
        next_milestone: p.next_milestone ?? undefined,
        attention: p.attention ?? undefined,
        blocking: p.blocking ?? undefined,
        health_score: p.health_score ?? undefined,
      })))
      options.onCacheMiss?.()
    }
    
    setLoadingProjects(false)
  }, [workspaceId, setCachedProjects, setLoadingProjects, options.onCacheMiss])
  
  const refresh = useCallback(() => {
    startTransition(() => {
      fetchProjects()
      router.refresh()
    })
  }, [fetchProjects, router])
  
  useEffect(() => {
    if (!cachedProjects) {
      fetchProjects()
      return
    }
    
    const timeSinceLastUpdate = Date.now() - (useAppStore.getState().lastProjectsUpdate || 0)
    if (timeSinceLastUpdate > CACHE_DURATION) {
      fetchProjects()
    } else {
      options.onCacheHit?.()
    }
  }, [workspaceId])
  
  return {
    projects: cachedProjects,
    isLoading: isLoadingProjects || isPending,
    refresh,
    refetch: fetchProjects,
  }
}

// Hook para sincronizar empresas
export function useSyncCompanies(workspaceId: string, options: UseDataSyncOptions = {}) {
  const { cachedCompanies, isLoadingCompanies, setCachedCompanies, setLoadingCompanies } = useCompaniesCache()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name')
    
    if (!error && data) {
      setCachedCompanies(data.map(c => ({
        id: c.id, name: c.name, slug: c.slug,
        tagline: c.tagline ?? undefined,
        color: c.color ?? '#6b7280',
      })))
      options.onCacheMiss?.()
    }
    
    setLoadingCompanies(false)
  }, [workspaceId, setCachedCompanies, setLoadingCompanies, options.onCacheMiss])
  
  const refresh = useCallback(() => {
    startTransition(() => {
      fetchCompanies()
      router.refresh()
    })
  }, [fetchCompanies, router])
  
  useEffect(() => {
    if (!cachedCompanies) {
      fetchCompanies()
      return
    }
    
    const timeSinceLastUpdate = Date.now() - (useAppStore.getState().lastCompaniesUpdate || 0)
    if (timeSinceLastUpdate > CACHE_DURATION) {
      fetchCompanies()
    } else {
      options.onCacheHit?.()
    }
  }, [workspaceId])
  
  return {
    companies: cachedCompanies,
    isLoading: isLoadingCompanies || isPending,
    refresh,
    refetch: fetchCompanies,
  }
}

// Hook para forçar refresh completo
export function useForceRefresh() {
  const clearCache = useClearCache()
  const router = useRouter()
  
  return useCallback(() => {
    clearCache()
    router.refresh()
  }, [clearCache, router])
}