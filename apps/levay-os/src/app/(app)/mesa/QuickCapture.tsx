'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  async function save() {
    if (!text.trim()) return
    setSaving(true)
    const { data: wsId } = await supabase.rpc('get_my_workspace_id')
    if (!wsId) return
    await supabase.from('captures').insert({
      raw_text: text.trim(),
      source: 'web',
      workspace_id: wsId,
    })
    setText('')
    setOpen(false)
    setSaving(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 bg-accent/90 hover:bg-accent backdrop-blur-md text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-all duration-300 shadow-xl shadow-accent/30 active:scale-95 border border-white/10"
      >
        <span className="text-lg leading-none">+</span> Capturar
      </button>
    )
  }

  return (
    <div className="flex items-end gap-3 bg-card border border-border rounded-2xl p-4 w-96 shadow-2xl shadow-black/10 animate-in zoom-in-95 duration-200">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="O que você quer capturar? (⌘↵ para salvar)"
        rows={3}
        className="flex-1 bg-transparent text-sm text-foreground placeholder-muted resize-none focus:outline-none"
      />
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-muted hover:text-foreground transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button
          onClick={save}
          disabled={saving || !text.trim()}
          className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-full transition-all shadow-md shadow-accent/10 active:scale-95"
        >
          {saving ? '...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
