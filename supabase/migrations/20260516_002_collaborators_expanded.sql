-- Expansão de estrutura de colaboradores (versão corrigida)
-- Substitui expand_collaborators_v1.sql (RLS tinha UUID hardcoded)
--
-- Idempotente: IF NOT EXISTS em todas as operações DDL.
-- RLS usa public.current_workspace_id() em vez de UUID hardcoded.

-- 1. Campos adicionais na tabela collaborators
ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS role           TEXT,
  ADD COLUMN IF NOT EXISTS position       TEXT,
  ADD COLUMN IF NOT EXISTS contract_type  TEXT,
  ADD COLUMN IF NOT EXISTS admission_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS uniform_size   TEXT,
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS birthday       DATE,
  ADD COLUMN IF NOT EXISTS cpf            TEXT,
  ADD COLUMN IF NOT EXISTS rg             TEXT,
  ADD COLUMN IF NOT EXISTS address        TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact       TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS photo_url   TEXT,
  ADD COLUMN IF NOT EXISTS profile_data JSONB,
  ADD COLUMN IF NOT EXISTS notes        JSONB;

-- 2. Tabela de notas de colaboradores
CREATE TABLE IF NOT EXISTS public.collaborator_notes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID        NOT NULL,
  collaborator_id  UUID        REFERENCES public.collaborators(id) ON DELETE CASCADE,
  author_id        UUID        REFERENCES public.collaborators(id),
  content          TEXT        NOT NULL,
  tags             JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de alocação colaborador × empresa
CREATE TABLE IF NOT EXISTS public.collaborator_companies (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID        NOT NULL,
  collaborator_id  UUID        REFERENCES public.collaborators(id) ON DELETE CASCADE,
  company_id       UUID        REFERENCES public.companies(id) ON DELETE CASCADE,
  role_at_company  TEXT,
  is_primary       BOOLEAN     NOT NULL DEFAULT FALSE,
  allocated_since  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, collaborator_id, company_id)
);

-- 4. RLS
ALTER TABLE public.collaborator_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_companies ENABLE ROW LEVEL SECURITY;

-- collaborator_notes: isolamento por workspace
DROP POLICY IF EXISTS "collaborator_notes_select"  ON public.collaborator_notes;
DROP POLICY IF EXISTS "collaborator_notes_insert"  ON public.collaborator_notes;
DROP POLICY IF EXISTS "collaborator_notes_update"  ON public.collaborator_notes;
DROP POLICY IF EXISTS "collaborator_notes_delete"  ON public.collaborator_notes;
DROP POLICY IF EXISTS "collaborator_notes_workspace" ON public.collaborator_notes;

CREATE POLICY "collaborator_notes_select" ON public.collaborator_notes
  FOR SELECT USING (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_notes_insert" ON public.collaborator_notes
  FOR INSERT WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_notes_update" ON public.collaborator_notes
  FOR UPDATE USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_notes_delete" ON public.collaborator_notes
  FOR DELETE USING (workspace_id = public.current_workspace_id());

-- collaborator_companies: isolamento por workspace
DROP POLICY IF EXISTS "collaborator_companies_select"  ON public.collaborator_companies;
DROP POLICY IF EXISTS "collaborator_companies_insert"  ON public.collaborator_companies;
DROP POLICY IF EXISTS "collaborator_companies_update"  ON public.collaborator_companies;
DROP POLICY IF EXISTS "collaborator_companies_delete"  ON public.collaborator_companies;
DROP POLICY IF EXISTS "collaborator_companies_workspace" ON public.collaborator_companies;

CREATE POLICY "collaborator_companies_select" ON public.collaborator_companies
  FOR SELECT USING (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_companies_insert" ON public.collaborator_companies
  FOR INSERT WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_companies_update" ON public.collaborator_companies
  FOR UPDATE USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY "collaborator_companies_delete" ON public.collaborator_companies
  FOR DELETE USING (workspace_id = public.current_workspace_id());

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_collaborator_notes_workspace
  ON public.collaborator_notes (workspace_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_notes_collaborator
  ON public.collaborator_notes (collaborator_id);

CREATE INDEX IF NOT EXISTS idx_collaborator_companies_workspace
  ON public.collaborator_companies (workspace_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_companies_collaborator
  ON public.collaborator_companies (collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_companies_company
  ON public.collaborator_companies (company_id);
