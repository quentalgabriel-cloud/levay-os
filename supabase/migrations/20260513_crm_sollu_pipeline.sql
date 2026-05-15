-- CRM Sollu: Pipeline, Stages, Leads, Interactions
-- Generated: 2026-05-13
-- Schema: public (collapses into platform domain for now, sollu.* in Fase 3+)

-- ============================================================
-- crm_pipelines
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_pipelines_workspace ON crm_pipelines(workspace_id);

-- ============================================================
-- crm_stages
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#6B7280',
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_stages_pipeline ON crm_stages(pipeline_id);
CREATE INDEX idx_crm_stages_workspace ON crm_stages(workspace_id);

-- ============================================================
-- crm_leads
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id     UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  stage_id        UUID NOT NULL REFERENCES crm_stages(id),
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  source          TEXT,
  notes           TEXT,
  next_follow_up_at TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'won', 'lost', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_leads_workspace ON crm_leads(workspace_id);
CREATE INDEX idx_crm_leads_pipeline ON crm_leads(pipeline_id);
CREATE INDEX idx_crm_leads_stage ON crm_leads(stage_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_follow_up ON crm_leads(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;

-- ============================================================
-- crm_interactions
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_interactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id      UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'note'
    CHECK (type IN ('note', 'whatsapp', 'email', 'call', 'meeting')),
  content      TEXT NOT NULL,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_interactions_lead ON crm_interactions(lead_id);
CREATE INDEX idx_crm_interactions_workspace ON crm_interactions(workspace_id);

-- ============================================================
-- auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_pipelines_updated_at
  BEFORE UPDATE ON crm_pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;

-- crm_pipelines
CREATE POLICY "workspace_select_pipelines" ON crm_pipelines FOR SELECT USING (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_insert_pipelines" ON crm_pipelines FOR INSERT WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_update_pipelines" ON crm_pipelines FOR UPDATE USING (workspace_id = auth.workspace_id()) WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_delete_pipelines" ON crm_pipelines FOR DELETE USING (workspace_id = auth.workspace_id());

-- crm_stages
CREATE POLICY "workspace_select_stages" ON crm_stages FOR SELECT USING (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_insert_stages" ON crm_stages FOR INSERT WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_update_stages" ON crm_stages FOR UPDATE USING (workspace_id = auth.workspace_id()) WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_delete_stages" ON crm_stages FOR DELETE USING (workspace_id = auth.workspace_id());

-- crm_leads
CREATE POLICY "workspace_select_leads" ON crm_leads FOR SELECT USING (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_insert_leads" ON crm_leads FOR INSERT WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_update_leads" ON crm_leads FOR UPDATE USING (workspace_id = auth.workspace_id()) WITH CHECK (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_delete_leads" ON crm_leads FOR DELETE USING (workspace_id = auth.workspace_id());

-- crm_interactions
CREATE POLICY "workspace_select_interactions" ON crm_interactions FOR SELECT USING (workspace_id = auth.workspace_id());
CREATE POLICY "workspace_insert_interactions" ON crm_interactions FOR INSERT WITH CHECK (workspace_id = auth.workspace_id());

-- ============================================================
-- initialize_sollu_pipeline: idempotent seed per workspace
-- Called from Server Action via supabase.rpc('initialize_sollu_pipeline', { p_workspace_id })
-- ============================================================
CREATE OR REPLACE FUNCTION initialize_sollu_pipeline(p_workspace_id TEXT)
RETURNS UUID AS $$
DECLARE
  v_pipeline_id UUID;
BEGIN
  SELECT id INTO v_pipeline_id
  FROM crm_pipelines
  WHERE workspace_id = p_workspace_id AND name = 'Sollu'
  LIMIT 1;

  IF v_pipeline_id IS NOT NULL THEN
    RETURN v_pipeline_id;
  END IF;

  INSERT INTO crm_pipelines (workspace_id, name, description)
  VALUES (p_workspace_id, 'Sollu', 'Pipeline comercial da Sollu')
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_stages (workspace_id, pipeline_id, name, color, position) VALUES
    (p_workspace_id, v_pipeline_id, 'Novo Lead',         '#6B7280', 0),
    (p_workspace_id, v_pipeline_id, 'Contactado',         '#3B82F6', 1),
    (p_workspace_id, v_pipeline_id, 'Proposta Enviada',   '#F59E0B', 2),
    (p_workspace_id, v_pipeline_id, 'Em Negociação',      '#8B5CF6', 3),
    (p_workspace_id, v_pipeline_id, 'Ganho',              '#10B981', 4),
    (p_workspace_id, v_pipeline_id, 'Perdido',            '#EF4444', 5);

  RETURN v_pipeline_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
