import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
interface Task {
  id: string
  title: string
  minimum_movement?: string
  company_id?: string
  due_at?: string
  priority?: string
  status?: string
  created_at?: string
}

interface Project {
  id: string
  name: string
  status: string
  company_id?: string
  next_milestone?: string
  attention?: string
  blocking?: string
  health_score?: number
}

interface Company {
  id: string
  name: string
  slug: string
  tagline?: string
  color: string
}

interface AppState {
  // Current workspace/tenant
  currentWorkspaceId: string | null
  currentTenant: string | null
  
  // UI State
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  activeModal: string | null
  
  // Cache de dados (para evitar refetch desnecessário)
  cachedTasks: Task[] | null
  cachedProjects: Project[] | null
  cachedCompanies: Company[] | null
  
  // Loading states
  isLoadingTasks: boolean
  isLoadingProjects: boolean
  isLoadingCompanies: boolean
  
  // Last update timestamps
  lastTasksUpdate: number | null
  lastProjectsUpdate: number | null
  lastCompaniesUpdate: number | null
  
  // Actions
  setWorkspace: (workspaceId: string, tenant: string) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  
  // Cache actions
  setCachedTasks: (tasks: Task[]) => void
  setCachedProjects: (projects: Project[]) => void
  setCachedCompanies: (companies: Company[]) => void
  clearCache: () => void
  
  // Loading actions
  setLoadingTasks: (loading: boolean) => void
  setLoadingProjects: (loading: boolean) => void
  setLoadingCompanies: (loading: boolean) => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkspaceId: null,
      currentTenant: null,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      activeModal: null,
      cachedTasks: null,
      cachedProjects: null,
      cachedCompanies: null,
      isLoadingTasks: false,
      isLoadingProjects: false,
      isLoadingCompanies: false,
      lastTasksUpdate: null,
      lastProjectsUpdate: null,
      lastCompaniesUpdate: null,

      // Workspace actions
      setWorkspace: (workspaceId, tenant) => set({ 
        currentWorkspaceId: workspaceId, 
        currentTenant: tenant 
      }),

      // UI actions
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setCommandPaletteOpen: (open) => set({ 
        commandPaletteOpen: open 
      }),
      
      setActiveModal: (modal) => set({ 
        activeModal: modal 
      }),

      // Cache actions
      setCachedTasks: (tasks) => set({ 
        cachedTasks: tasks, 
        lastTasksUpdate: Date.now() 
      }),
      
      setCachedProjects: (projects) => set({ 
        cachedProjects: projects, 
        lastProjectsUpdate: Date.now() 
      }),
      
      setCachedCompanies: (companies) => set({ 
        cachedCompanies: companies, 
        lastCompaniesUpdate: Date.now() 
      }),
      
      clearCache: () => set({ 
        cachedTasks: null, 
        cachedProjects: null, 
        cachedCompanies: null,
        lastTasksUpdate: null,
        lastProjectsUpdate: null,
        lastCompaniesUpdate: null
      }),

      // Loading actions
      setLoadingTasks: (loading) => set({ isLoadingTasks: loading }),
      setLoadingProjects: (loading) => set({ isLoadingProjects: loading }),
      setLoadingCompanies: (loading) => set({ isLoadingCompanies: loading }),
    }),
    {
      name: 'levay-app-storage',
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        currentTenant: state.currentTenant,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Selectors úteis
export const selectIsCacheValid = (type: 'tasks' | 'projects' | 'companies') => {
  const state = useAppStore.getState()
  const lastUpdate = type === 'tasks' 
    ? state.lastTasksUpdate 
    : type === 'projects' 
      ? state.lastProjectsUpdate 
      : state.lastCompaniesUpdate
  
  return lastUpdate && Date.now() - lastUpdate < CACHE_DURATION
}

export const selectCachedData = <T>(type: 'tasks' | 'projects' | 'companies'): T | null => {
  const state = useAppStore.getState()
  if (!selectIsCacheValid(type)) return null
  
  switch (type) {
    case 'tasks': return state.cachedTasks as T
    case 'projects': return state.cachedProjects as T
    case 'companies': return state.cachedCompanies as T
  }
}