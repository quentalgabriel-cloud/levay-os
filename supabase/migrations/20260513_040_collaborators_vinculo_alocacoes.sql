-- Collaborators: add vinculo + status_employment + new table alocacoes
-- Generated: 2026-05-13
-- Rationale: PLANO-MELHORIAS-V1.1.md requires typed vinculo and status.
-- Existing `collaborators` keeps `contract_type` and `active` for compat.

-- ============================================================
-- 1. Add typed columns to collaborators (additive, nullable)
-- ============================================================
ALTER TABLE collaborators
  ADD COLUMN IF NOT EXISTS vinculo TEXT,
  ADD COLUMN IF NOT EXISTS status_employment TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'collaborators_vinculo_check'
  ) THEN
    ALTER TABLE collaborators
      ADD CONSTRAINT collaborators_vinculo_check
      CHECK (vinculo IS NULL OR vinculo IN ('CLT','PJ','FREELA','DIARISTA','ESTAGIO'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'collaborators_status_employment_check'
  ) THEN
    ALTER TABLE collaborators
      ADD CONSTRAINT collaborators_status_employment_check
      CHECK (status_employment IS NULL OR status_employment IN ('ATIVO','EM_EXPERIENCIA','AFASTADO','BANCO_FREELAS','DESLIGADO'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_collaborators_vinculo
  ON collaborators(vinculo) WHERE vinculo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaborators_status_employment
  ON collaborators(status_employment) WHERE status_employment IS NOT NULL;

COMMENT ON COLUMN collaborators.vinculo IS 'Employment bond type: CLT | PJ | FREELA | DIARISTA | ESTAGIO. Supersedes contract_type semantically.';
COMMENT ON COLUMN collaborators.status_employment IS 'Employment status: ATIVO | EM_EXPERIENCIA | AFASTADO | BANCO_FREELAS | DESLIGADO. Supersedes active flag semantically.';

-- ============================================================
-- 2. Create alocacoes table
-- ============================================================
CREATE TABLE IF NOT EXISTS alocacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  collaborator_id  UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cargo            TEXT NOT NULL,
  inicio           DATE NOT NULL DEFAULT CURRENT_DATE,
  fim              DATE,
  responsavel_substituto_id UUID REFERENCES collaborators(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fim IS NULL OR fim >= inicio)
);

CREATE INDEX IF NOT EXISTS idx_alocacoes_workspace ON alocacoes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alocacoes_collaborator ON alocacoes(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_alocacoes_company ON alocacoes(company_id);
CREATE INDEX IF NOT EXISTS idx_alocacoes_active
  ON alocacoes(collaborator_id, company_id) WHERE fim IS NULL;

-- ============================================================
-- 3. Auto-update updated_at trigger (reuses function from CRM migration)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS alocacoes_updated_at ON alocacoes;
CREATE TRIGGER alocacoes_updated_at
  BEFORE UPDATE ON alocacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. RLS
-- ============================================================
ALTER TABLE alocacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select_alocacoes" ON alocacoes;
CREATE POLICY "workspace_select_alocacoes" ON alocacoes
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_alocacoes" ON alocacoes;
CREATE POLICY "workspace_insert_alocacoes" ON alocacoes
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_alocacoes" ON alocacoes;
CREATE POLICY "workspace_update_alocacoes" ON alocacoes
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_alocacoes" ON alocacoes;
CREATE POLICY "workspace_delete_alocacoes" ON alocacoes
  FOR DELETE USING (workspace_id = workspace_id());

COMMENT ON TABLE alocacoes IS 'Many-to-many collaborator-company assignments with role, period, and optional substitute. NULL fim = active. Supports Thaynan-offline pattern via responsavel_substituto_id.';
