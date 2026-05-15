-- Workspace config: key-value store for tenant-level configuration
-- Generated: 2026-05-13
-- Rationale: 5 contradictions in PLANO-MELHORIAS-V1.1.md (cap_hoje, palette,
-- cluster, entry point, whatsapp owner) need to be configurable per workspace
-- without code changes. JSONB value allows any shape.

CREATE TABLE IF NOT EXISTS workspace_config (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value        JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, key)
);

CREATE INDEX IF NOT EXISTS idx_workspace_config_workspace ON workspace_config(workspace_id);

DROP TRIGGER IF EXISTS workspace_config_updated_at ON workspace_config;
CREATE TRIGGER workspace_config_updated_at
  BEFORE UPDATE ON workspace_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE workspace_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select_config" ON workspace_config;
CREATE POLICY "workspace_select_config" ON workspace_config
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_config" ON workspace_config;
CREATE POLICY "workspace_insert_config" ON workspace_config
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_config" ON workspace_config;
CREATE POLICY "workspace_update_config" ON workspace_config
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_config" ON workspace_config;
CREATE POLICY "workspace_delete_config" ON workspace_config
  FOR DELETE USING (workspace_id = workspace_id());

-- ============================================================
-- Default config for all existing workspaces (idempotent UPSERT)
-- Defaults applied for the 5 contradictions in PLANO-MELHORIAS-V1.1.md:
--   - cap_hoje = 3  (manifesto-aligned)
--   - palette_version = 'legado' (Sollu azul / Bica roxo / AMP laranja)
--   - bica_amp_cluster_id = 'bica+amp' (2 separated companies, 1 shared cluster)
--   - entry_route = '/mesa'
-- ============================================================
INSERT INTO workspace_config (workspace_id, key, value)
SELECT id, 'cap_hoje', '3'::jsonb FROM workspaces
ON CONFLICT (workspace_id, key) DO NOTHING;

INSERT INTO workspace_config (workspace_id, key, value)
SELECT id, 'palette_version', '"legado"'::jsonb FROM workspaces
ON CONFLICT (workspace_id, key) DO NOTHING;

INSERT INTO workspace_config (workspace_id, key, value)
SELECT id, 'bica_amp_cluster_id', '"bica+amp"'::jsonb FROM workspaces
ON CONFLICT (workspace_id, key) DO NOTHING;

INSERT INTO workspace_config (workspace_id, key, value)
SELECT id, 'entry_route', '"/mesa"'::jsonb FROM workspaces
ON CONFLICT (workspace_id, key) DO NOTHING;

COMMENT ON TABLE workspace_config IS 'Tenant-level config as key/value JSONB. Used for revocable defaults (cap_hoje, palette, cluster, entry route). Mutation = 1 UPSERT instead of code change.';
