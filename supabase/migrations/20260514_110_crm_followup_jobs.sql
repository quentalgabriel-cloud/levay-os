-- Story 2.2: Integração CRM + Follow-up Workers
-- Tabela de jobs de follow-up que o worker processa

CREATE TABLE IF NOT EXISTS followup_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id          UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  phone            TEXT NOT NULL,
  offset_days      INTEGER NOT NULL CHECK (offset_days IN (0, 1, 3)),
  idempotency_key  TEXT NOT NULL,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts         INTEGER NOT NULL DEFAULT 0,
  last_error       TEXT,
  message_id       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_followup_jobs_pending ON followup_jobs(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_followup_jobs_lead ON followup_jobs(lead_id);
CREATE INDEX idx_followup_jobs_workspace ON followup_jobs(workspace_id);

ALTER TABLE followup_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_rls_followup_jobs" ON followup_jobs
  FOR ALL USING (workspace_id = auth.workspace_id());

CREATE OR REPLACE FUNCTION schedule_followup_for_lead(p_lead_id UUID)
RETURNS void AS $$
DECLARE
  v_workspace_id TEXT;
  v_phone TEXT;
  v_idem_keys TEXT[];
BEGIN
  SELECT workspace_id, phone INTO v_workspace_id, v_phone
  FROM crm_leads WHERE id = p_lead_id;

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN;
  END IF;

  FOREACH offset IN ARRAY ARRAY[0, 1, 3]
  LOOP
    INSERT INTO followup_jobs (workspace_id, lead_id, phone, offset_days, idempotency_key, scheduled_at)
    VALUES (
      v_workspace_id,
      p_lead_id,
      v_phone,
      offset,
      concat(v_workspace_id, ':', p_lead_id, ':D+', offset),
      NOW() + (offset || ' days')::interval
    )
    ON CONFLICT (workspace_id, idempotency_key) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;