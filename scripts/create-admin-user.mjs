import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createAdminUser() {
  console.log('👤 Criando usuário admin...')
  
  // Check if user exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  console.log('   Usuários existentes:', existing?.users?.length || 0)
  
  // Create user - Using admin API
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: 'erick@levay.com.br',
    email_confirm: true,
    user_metadata: { name: 'Erick' }
  })
  
  if (error) {
    console.log('   Erro:', error.message)
    // User might already exist
    if (error.message.includes('already been registered')) {
      console.log('   Usuário já existe, obtendo...')
      const { data: users } = await supabase.auth.admin.listUsers()
      const erick = users?.users?.find(u => u.email === 'erick@levay.com.br')
      if (erick) {
        console.log('   ✅ Usuário encontrado:', erick.id)
      }
    }
  } else {
    console.log('   ✅ Usuário criado:', user.user?.id)
  }
  
  // Add to workspace_members
  console.log('\n📋 Adicionando ao workspace...')
  
  // Get all users to find erick
  const { data: users } = await supabase.auth.admin.listUsers()
  const erickUser = users?.users?.find(u => u.email === 'erick@levay.com.br')
  
  if (erickUser) {
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: '00000000-0000-0000-0000-000000000001',
        user_id: erickUser.id,
        role: 'admin',
        status: 'ativo'
      })
    
    if (memberError) {
      console.log('   Erro ao adicionar:', memberError.message)
    } else {
      console.log('   ✅ Adicionado ao workspace como admin')
    }
  }
}

createAdminUser()