-- Migration para expandir estrutura de colaboradores
-- Executar no Supabase SQL Editor: https://supabase.com/dashboard/project/anwtivdognjrghipardd/sql

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
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
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
  workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  collaborator_id UUID REFERENCES collaborators(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role_at_company TEXT,
  is_primary BOOLEAN DEFAULT false,
  allocated_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, collaborator_id, company_id)
);

-- 4. Habilitar RLS
ALTER TABLE collaborator_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_companies ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS (permissivo para workspace)
CREATE POLICY "collaborator_notes_workspace" ON collaborator_notes
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "collaborator_companies_workspace" ON collaborator_companies
  FOR ALL USING (workspace_id = '00000000-0000-0000-0000-000000000001');

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_collaborator_notes_collaborator ON collaborator_notes(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_companies_collaborator ON collaborator_companies(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_companies_company ON collaborator_companies(company_id);