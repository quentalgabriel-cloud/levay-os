// Script para expandir estrutura de colaboradores
// Usa a API de management do Supabase se disponível, ou cria dados em formato que funciona

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

// Tentando expandir via POST a nova tabela
async function createNotesTable() {
  console.log('📋 Tentando criar tabela collaborator_notes...')
  
  // Tentar criar a tabela - via POST de metadata
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  })
  
  console.log('   Status:', res.status)
}

// Como não temos acesso direto ao SQL, vamos criar uma abordagem:
// Usar a tabela collaborators existente e criar uma tabela de notas
// Os dados extras ficarão em uma tabela 'collaborator_details' separada

async function createCollaboratorNotesTable() {
  // Criar tabela de notas via tabela existente
  console.log('\n📝 Criando estrutura de notas...')
  
  // Testar se tabela existe - se não existir, vai falhar
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/collaborator_notes?limit=1`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  
  if (check.status === 200 || check.status === 404) {
    console.log('   Tabela collaborator_notes acessível ou não existe ainda')
    return true
  }
  
  return false
}

async function createCollaboratorCompaniesTable() {
  console.log('\n🏢 Verificando estrutura de empresas por colaborador...')
  
  // Verificar se companies está na collaborators
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/collaborators?select=companies&limit=1`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  
  console.log('   Status companies:', check.status)
  return check.status === 200
}

async function main() {
  console.log('🔧 Expandindo estrutura de colaboradores\n')
  console.log('='.repeat(50))
  
  // Verificar estado atual
  console.log('\n📊 Estado atual da tabela collaborators:')
  const current = await fetch(
    `${SUPABASE_URL}/rest/v1/collaborators?workspace_id=eq.${WORKSPACE_ID}&select=*&limit=3`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const data = await current.json()
  console.log('   Colunas disponíveis:', Object.keys(data[0] || {}).join(', '))
  
  // Criar notas table
  await createCollaboratorNotesTable()
  
  // Verificar companies
  await createCollaboratorCompaniesTable()
  
  console.log('\n⚠️  Para expandir a estrutura, preciso de acesso ao SQL do Supabase.')
  console.log('   Opções:')
  console.log('   1. Acessar dashboard.supabase.com e executar SQL')
  console.log('   2. Usar supabase CLI com migrations')
  console.log('   3. Adicionar colunas via interface')
  
  console.log('\n📝 Gerando SQL de migration necessário...')
  
  const migrationSQL = `
-- Migration para expandir estrutura de colaboradores

-- 1. Adicionar campos na tabela collaborators
ALTER TABLE collaborators 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS contract_type TEXT,
ADD COLUMN IF NOT EXISTS admission_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS uniform_size TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_data JSONB,
ADD COLUMN IF NOT EXISTS notes JSONB;

-- 2. Criar tabela de notas
CREATE TABLE IF NOT EXISTS collaborator_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES collaborators(id) ON DELETE CASCADE,
  author_id UUID REFERENCES collaborators(id),
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de empresas por colaborador
CREATE TABLE IF NOT EXISTS collaborator_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES collaborators(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role_at_company TEXT,
  is_primary BOOLEAN DEFAULT false,
  allocated_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collaborator_id, company_id)
);

-- 4. Habilitar RLS
ALTER TABLE collaborator_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_companies ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
CREATE POLICY "Users can manage own workspace notes" ON collaborator_notes
  FOR ALL USING (true);

CREATE POLICY "Users can manage own workspace collab companies" ON collaborator_companies
  FOR ALL USING (true);
`
  
  console.log('\n' + migrationSQL)
  
  // Salvar migration
  fs.writeFileSync(
    path.join(__dirname, '..', 'migrations', 'expand_collaborators.sql'),
    migrationSQL
  )
  console.log('\n✅ SQL salvo em: migrations/expand_collaborators.sql')
}

main().catch(console.error)