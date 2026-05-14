'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setRedirectUrl(window.location.origin + '/auth/callback')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/mesa')
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      })
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-500">
      <div className="w-full max-w-sm space-y-12">
        <div className="text-center space-y-3">
          <div className="text-5xl font-extrabold tracking-tighter text-foreground">Levay OS</div>
          <p className="text-muted text-sm font-medium">Sistema Operacional do Grupo Levay</p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-[2rem] p-8 text-center space-y-4 shadow-2xl shadow-black/5">
            <div className="text-4xl">📬</div>
            <p className="text-foreground text-sm font-medium">
              Link enviado para <br /><strong className="text-accent">{email}</strong>
            </p>
            <p className="text-muted text-xs">Verifique sua caixa de entrada para acessar</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted px-1">
                E-mail de acesso
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
              />
            </div>

            {mode === 'password' && (
              <div className="space-y-2.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted px-1">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs font-bold px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-all shadow-xl shadow-accent/20 active:scale-95"
            >
              {loading ? 'Entrando...' : mode === 'password' ? 'Entrar' : 'Entrar com link mágico'}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError(null) }}
              className="w-full text-muted text-xs font-medium py-2 hover:text-foreground transition-colors"
            >
              {mode === 'magic' ? 'Entrar com senha' : 'Entrar com link mágico'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
