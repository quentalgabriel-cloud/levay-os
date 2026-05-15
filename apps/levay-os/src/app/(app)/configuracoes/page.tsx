'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxxxx.supabase.co' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', placeholder: 'eyJhbGciOiJIUzI1NiIs...' },
]

export default function ConfiguracoesPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('env_config')
    if (stored) {
      setValues(JSON.parse(stored))
    }
    setLoaded(true)
  }, [])

  const handleSave = () => {
    localStorage.setItem('env_config', JSON.stringify(values))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!loaded) return null

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-sm font-medium text-muted mt-1">Configure as variáveis de ambiente para o projeto</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <AlertCircle className="w-5 h-5 text-warning" />
          <span className="text-sm font-medium text-foreground">Variáveis do Supabase</span>
        </div>

        {ENV_VARS.map((env) => (
          <div key={env.key} className="space-y-2">
            <label className="block text-xs font-medium text-muted">{env.label}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys[env.key] ? 'text' : 'password'}
                  value={values[env.key] || ''}
                  onChange={(e) => setValues({ ...values, [env.key]: e.target.value })}
                  placeholder={env.placeholder}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, [env.key]: !showKeys[env.key] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showKeys[env.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted/70 font-mono">{env.key}</p>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-success text-xs">
            <CheckCircle className="w-3 h-3" />
            Configurações salvas no navegador
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-xl p-4 text-xs text-muted space-y-2">
        <p className="font-medium text-foreground">Para produção (Vercel):</p>
        <p>1. Acesse Vercel Dashboard → Settings → Environment Variables</p>
        <p>2. Adicione as variáveis acima com o prefixo NEXT_PUBLIC_</p>
        <p>3. Faça um novo deploy</p>
      </div>
    </div>
  )
}