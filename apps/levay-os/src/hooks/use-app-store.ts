import { useAppStore, selectIsCacheValid } from '@/stores/app-store'

// Hook para workspace atual
export function useCurrentWorkspace() {
  const workspaceId = useAppStore(s => s.currentWorkspaceId)
  const tenant = useAppStore(s => s.currentTenant)
  const setWorkspace = useAppStore(s => s.setWorkspace)
  
  return { workspaceId, tenant, setWorkspace }
}

// Hook para UI state
export function useUI() {
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed)
  const commandPaletteOpen = useAppStore(s => s.commandPaletteOpen)
  const activeModal = useAppStore(s => s.activeModal)
  
  const toggleSidebar = useAppStore(s => s.toggleSidebar)
  const setCommandPaletteOpen = useAppStore(s => s.setCommandPaletteOpen)
  const setActiveModal = useAppStore(s => s.setActiveModal)
  
  return {
    sidebarCollapsed,
    commandPaletteOpen,
    activeModal,
    toggleSidebar,
    setCommandPaletteOpen,
    setActiveModal,
  }
}

// Hook para Tasks cache
export function useTasksCache() {
  const cachedTasks = useAppStore(s => s.cachedTasks)
  const isLoadingTasks = useAppStore(s => s.isLoadingTasks)
  const lastTasksUpdate = useAppStore(s => s.lastTasksUpdate)
  
  const setCachedTasks = useAppStore(s => s.setCachedTasks)
  const setLoadingTasks = useAppStore(s => s.setLoadingTasks)
  
  const isCacheValid = selectIsCacheValid('tasks')
  
  return {
    cachedTasks,
    isLoadingTasks,
    lastTasksUpdate,
    isCacheValid,
    setCachedTasks,
    setLoadingTasks,
  }
}

// Hook para Projects cache
export function useProjectsCache() {
  const cachedProjects = useAppStore(s => s.cachedProjects)
  const isLoadingProjects = useAppStore(s => s.isLoadingProjects)
  const lastProjectsUpdate = useAppStore(s => s.lastProjectsUpdate)
  
  const setCachedProjects = useAppStore(s => s.setCachedProjects)
  const setLoadingProjects = useAppStore(s => s.setLoadingProjects)
  
  const isCacheValid = selectIsCacheValid('projects')
  
  return {
    cachedProjects,
    isLoadingProjects,
    lastProjectsUpdate,
    isCacheValid,
    setCachedProjects,
    setLoadingProjects,
  }
}

// Hook para Companies cache
export function useCompaniesCache() {
  const cachedCompanies = useAppStore(s => s.cachedCompanies)
  const isLoadingCompanies = useAppStore(s => s.isLoadingCompanies)
  const lastCompaniesUpdate = useAppStore(s => s.lastCompaniesUpdate)
  
  const setCachedCompanies = useAppStore(s => s.setCachedCompanies)
  const setLoadingCompanies = useAppStore(s => s.setLoadingCompanies)
  
  const isCacheValid = selectIsCacheValid('companies')
  
  return {
    cachedCompanies,
    isLoadingCompanies,
    lastCompaniesUpdate,
    isCacheValid,
    setCachedCompanies,
    setLoadingCompanies,
  }
}

// Hook para cache global
export function useClearCache() {
  const clearCache = useAppStore(s => s.clearCache)
  return clearCache
}