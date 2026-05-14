'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { WorkspaceRole } from '@/lib/tenant-context'

interface TeamMember {
  id: string
  user_id: string
  role: string
  workspace_id: string
}

export default function TeamPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [collaborators, setCollaborators] = useState<Record<string, { name: string; email: string }>>({})
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<WorkspaceRole>('member')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    const [membersRes, collabRes] = await Promise.all([
      supabase.from('workspace_members').select('*'),
      supabase.from('collaborators').select('user_id, name, email')
    ])

    const membersData = membersRes.data || []
    setMembers(membersData)

    const collabMap: Record<string, { name: string; email: string }> = {}
    ;(collabRes.data || []).forEach((c) => {
      if (c.user_id) {
        collabMap[c.user_id] = { name: c.name || '', email: c.email || '' }
      }
    })
    setCollaborators(collabMap)
    setLoading(false)
  }

  async function inviteUser() {
    if (!newEmail) {
      setMessage('Preencha o email')
      return
    }

    setSending(true)
    setMessage('')

    try {
      // Send magic link - user will be auto-added when they log in
      await supabase.auth.signInWithOtp({
        email: newEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })

      setMessage(`Magic link enviado para ${newEmail}!`)
      setNewEmail('')
      loadMembers()
    } catch (err) {
      setMessage('Erro ao enviar convite: ' + String(err))
    }

    setSending(false)
  }

  async function updateRole(memberId: string, newRole: WorkspaceRole) {
    await supabase.from('workspace_members').update({ role: newRole }).eq('id', memberId)
    loadMembers()
  }

  async function removeMember(memberId: string) {
    if (!confirm('Remover este membro?')) return
    await supabase.from('workspace_members').delete().eq('id', memberId)
    loadMembers()
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Equipe</h1>
      <p className="text-muted mb-8">Gerencie membros e permissões</p>

      <div className="bg-foreground/[0.03] rounded-2xl p-6 border border-foreground/[0.06] mb-8">
        <h2 className="text-lg font-bold mb-4">Convidar novo membro</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as WorkspaceRole)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
          >
            <option value="viewer">Visualizador</option>
            <option value="member">Membro</option>
            <option value="admin">Administrador</option>
            <option value="owner">Dono</option>
          </select>
          <button
            onClick={inviteUser}
            disabled={sending}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Convidar'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-muted">{message}</p>}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const collab = collaborators[member.user_id]
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-foreground/[0.03] rounded-xl border border-foreground/[0.06]"
            >
              <div>
                <p className="font-medium">{collab?.name || 'Sem nome'}</p>
                <p className="text-sm text-muted">{collab?.email || member.user_id}</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={member.role}
                  onChange={(e) => updateRole(member.id, e.target.value as WorkspaceRole)}
                  className="px-3 py-1 rounded-lg border bg-background text-sm"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Dono</option>
                </select>
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}