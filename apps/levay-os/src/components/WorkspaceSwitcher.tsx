'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Company = {
  id: string
  name: string
  slug: string
  color: string | null
}

type Workspace = {
  id: string
  name: string
  slug: string
}

export default function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)

  const supabase = createClient()

  const loadCompanies = async (workspaceId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('companies')
      .select('id, name, slug, color')
      .eq('workspace_id', workspaceId)
      .order('name')
    setCompanies(data ?? [])
    setLoading(false)
  }

  const handleOpen = async () => {
    setOpen(!open)
    if (!open) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: wsMember } = await supabase
          .from('workspace_members')
          .select('*, workspaces(*)')
          .eq('user_id', user.id)
          .single()
        if (wsMember?.workspaces) {
          setCurrentWorkspace(wsMember.workspaces)
          await loadCompanies(wsMember.workspaces.id)
        }
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-foreground/5 transition-all text-xs font-medium text-muted"
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <span>{currentWorkspace?.name ?? 'Workspace'}</span>
        <span className="text-[10px]">▼</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                {currentWorkspace?.name ?? 'Workspace'}
              </p>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-muted px-3 py-2">Carregando...</p>
              ) : companies.length === 0 ? (
                <p className="text-xs text-muted px-3 py-2">Nenhuma empresa</p>
              ) : (
                <div className="space-y-0.5">
                  {companies.map((co) => (
                    <button
                      key={co.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 transition-colors text-left"
                      onClick={() => setOpen(false)}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: co.color ?? '#6b7280' }}
                      />
                      <span className="text-sm font-medium text-foreground">{co.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}