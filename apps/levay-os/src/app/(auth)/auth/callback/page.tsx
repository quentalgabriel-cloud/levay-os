'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        router.push('/mesa')
      } else if (event === 'SIGNED_OUT') {
        setError('Sessão expirada. Faça login novamente.')
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        router.push('/mesa')
      } else if (error) {
        setError(error.message)
      }
      setLoading(false)
    })
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-500 mb-4">{error}</p>
            <a href="/login" className="text-purple-600 hover:underline">
              Voltar para login
            </a>
          </>
        ) : (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Entrando...</p>
          </>
        )}
      </div>
    </div>
  )
}