-- Lacunas: lightweight issue tracker for gaps, ideas, risks, and improvements
-- Generated: 2026-05-13
-- Rationale: PLANO-MELHORIAS-V1.1.md models "Lacunas & Melhorias" as a
-- universal capture surface for non-task items that influence operations.

CREATE TABLE IF NOT EXISTS lacunas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  titulo              TEXT NOT NULL,
  tipo                TEXT NOT NULL DEFAULT 'LACUNA',
  status              TEXT NOT NULL DEFAULT 'ABERTA',
  impacto             TEXT NOT NULL DEFAULT 'MEDIO',
  empresa_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  contexto            TEXT,
  proximo_movimento   TEXT,
  bloqueia            TEXT,
  dono_collaborator_id UUID REFERENCES collaborators(id) ON DELETE SET NULL,
  resolvida_em        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (tipo IN ('LACUNA','PERGUNTA','MELHORIA_UX_UI','RISCO','IDEIA','DEPENDENCIA')),
  CHECK (status IN ('ABERTA','EM_ANALISE','EM_IMPLEMENTACAO','RESOLVIDA','ARQUIVADA')),
  CHECK (impacto IN ('ALTO','MEDIO','BAIXO')),
  CHECK (
    (status IN ('RESOLVIDA','ARQUIVADA') AND resolvida_em IS NOT NULL)
    OR (status NOT IN ('RESOLVIDA','ARQUIVADA') AND resolvida_em IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_lacunas_workspace ON lacunas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lacunas_status ON lacunas(status);
CREATE INDEX IF NOT EXISTS idx_lacunas_impacto ON lacunas(impacto);
CREATE INDEX IF NOT EXISTS idx_lacunas_empresa ON lacunas(empresa_id) WHERE empresa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lacunas_dono ON lacunas(dono_collaborator_id) WHERE dono_collaborator_id IS NOT NULL;

DROP TRIGGER IF EXISTS lacunas_updated_at ON lacunas;
CREATE TRIGGER lacunas_updated_at
  BEFORE UPDATE ON lacunas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE lacunas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select_lacunas" ON lacunas;
CREATE POLICY "workspace_select_lacunas" ON lacunas
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_lacunas" ON lacunas;
CREATE POLICY "workspace_insert_lacunas" ON lacunas
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_lacunas" ON lacunas;
CREATE POLICY "workspace_update_lacunas" ON lacunas
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_lacunas" ON lacunas;
CREATE POLICY "workspace_delete_lacunas" ON lacunas
  FOR DELETE USING (workspace_id = workspace_id());

COMMENT ON TABLE lacunas IS 'Lightweight issue tracker for non-task items: gaps, questions, UX improvements, risks, ideas, dependencies. Feeds the Alertas quadrant in Mesa do Diretor.';
