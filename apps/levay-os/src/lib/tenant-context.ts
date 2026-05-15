import { createClient } from './supabase/server'
import type { Database } from '@/types/database'

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TenantContext {
  workspaceId: string
  userId: string
  userRole: WorkspaceRole
  workspaceName: string
  workspaceSlug: string
  isOwner: boolean
  isAdmin: boolean
}

export async function getWorkspaceContext(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHORIZED')
  
  const { data: wsMember } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!wsMember) throw new Error('UNAUTHORIZED')

  return {
    workspaceId: wsMember.workspace_id,
    userId: user.id,
    userRole: wsMember.role as WorkspaceRole
  }
}

export async function requireAuth(supabase: any): Promise<TenantContext> {
  const { workspaceId, userId, userRole } = await getWorkspaceContext(supabase)

  const { data: wsMember } = await supabase
    .from('workspace_members')
    .select('*, workspaces(*)')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (!wsMember?.workspaces) throw new Error('UNAUTHORIZED')
  
  return {
    workspaceId,
    userId,
    userRole,
    workspaceName: wsMember.workspaces.name,
    workspaceSlug: wsMember.workspaces.slug,
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'owner' || userRole === 'admin'
  }
}

export function canAccessWorkspace(context: TenantContext, targetWorkspaceId: string): boolean {
  return context.workspaceId === targetWorkspaceId
}

export function canManageUsers(context: TenantContext): boolean {
  return context.isAdmin
}

export function canCreateTasks(context: TenantContext): boolean {
  return ['owner', 'admin', 'member'].includes(context.userRole)
}

export function canManageFinance(context: TenantContext): boolean {
  return context.isAdmin
}

export function canViewAuditLog(context: TenantContext): boolean {
  return context.isAdmin
}

export function requireRole(context: TenantContext, ...roles: WorkspaceRole[]): void {
  if (!roles.includes(context.userRole)) {
    throw new Error('FORBIDDEN: Insufficient permissions')
  }
}

export function requireAdmin(context: TenantContext): void {
  if (!context.isAdmin) {
    throw new Error('FORBIDDEN: Admin role required')
  }
}

export function addWorkspaceFilter<T>(query: any, workspaceId: string): any {
  return query.eq('workspace_id', workspaceId)
}

export async function getWorkspaceCompanies(workspaceId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name')
  return data || []
}

export async function getWorkspaceMetrics(workspaceId: string) {
  const supabase = await createClient()
  
  const [
    { count: totalTasks },
    { count: inboxTasks },
    { count: activeProjects },
    { count: pendingDecisions },
    { count: activeLeads }
  ] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('inbox', true),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'ativo'),
    supabase.from('decisions').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('format', 'open'),
    supabase.from('crm_clients').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'novo')
  ])

  return {
    totalTasks: totalTasks || 0,
    inboxTasks: inboxTasks || 0,
    activeProjects: activeProjects || 0,
    pendingDecisions: pendingDecisions || 0,
    activeLeads: activeLeads || 0
  }
}

export async function logAuditEvent(
  workspaceId: string,
  userId: string,
  action: string,
  entityKind: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  const supabase = await createClient()
  await supabase.from('audit_log').insert({
    workspace_id: workspaceId,
    actor_user_id: userId,
    action,
    entity_kind: entityKind,
    entity_id: entityId
  })
}

export async function isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}