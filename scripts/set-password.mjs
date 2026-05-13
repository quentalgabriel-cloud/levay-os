import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function updatePassword() {
  console.log('🔐 Definindo senha temporária...\n')
  
  // Para definir senha, precisamos do token de acesso do usuário
  // Mas como não temos, vamos usar admin API com service role
  
  // Alternativa: criar usuário com senha direta
  const { data, error } = await supabase.auth.signUp({
    email: 'gabriel@levay.com.br',
    password: 'Levay2026!',
    options: {
      data: { name: 'Gabriel' }
    }
  })
  
  if (error) {
    console.log('Erro:', error.message)
    
    // Se já existe, tentar signIn (não vai funcionar sem senha)
    if (error.message.includes('already been registered')) {
      console.log('\n⚠️  Usuário já existe.')
      console.log('   Para redefinir senha, o usuário precisa:')
      console.log('   1. Fazer login com magic link')
      console.log('   2. Ou usar "Send password recovery" no dashboard')
    }
  } else {
    console.log('✅ Usuário criado com senha!')
    console.log('   Email: gabriel@levay.com.br')
    console.log('   Senha: Levay2026!')
  }
}

updatePassword()