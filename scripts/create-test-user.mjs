import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function createTestUser() {
  console.log('🔐 Criando usuário de teste via signup...\n')
  
  // Try signup
  const { data, error } = await supabase.auth.signUp({
    email: 'erick@levay.com.br',
    password: 'TempPassword123!',
    options: {
      data: { name: 'Erick' }
    }
  })
  
  if (error) {
    console.log('Erro:', error.message)
    
    // If already exists, try sign in to get user
    if (error.message.includes('already been registered')) {
      console.log('\n↩️ Tentando restaurar senha ou verificar...')
      // For dev, we can use admin API or create a workaround
    }
  } else {
    console.log('✅ Usuário criado!')
    console.log('   ID:', data.user?.id)
    console.log('   Email:', data.user?.email)
    console.log('\n⚠️  ATENÇÃO: Email não confirmado!')
    console.log('   Para confirmar automaticamente, preciso de service role key.')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Acesse https://supabase.com/dashboard')
    console.log('   2. Vá em Authentication > Users')
    console.log('   3. Confirme o usuário erick@levay.com.br')
    console.log('   4. Depois faça login em http://localhost:3000/login')
  }
}

createTestUser()