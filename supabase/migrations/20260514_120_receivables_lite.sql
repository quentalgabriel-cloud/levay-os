-- Story 2.3 lite: Receivables + Billing Events (sem régua automática)
-- Conventions: numeric(14,2) money, idempotency_key UUID

-- Tabela de recebíveis
CREATE TABLE IF NOT EXISTS receivables (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  description         TEXT NOT NULL,
  amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  due_date            DATE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  paid_at             TIMESTAMPTZ,
  paid_amount         NUMERIC(14,2),
  idempotency_key     UUID NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, idempotency_key)
);

-- Índice para查询 por status e vencimento
CREATE INDEX idx_receivables_status ON receivables(status);
CREATE INDEX idx_receivables_due_date ON receivables(due_date);
CREATE INDEX idx_receivables_workspace ON receivables(workspace_id);
CREATE INDEX idx_receivables_company ON receivables(company_id);

-- RLS
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_rls_receivables" ON receivables
  FOR ALL USING (workspace_id = workspace_id());

-- Trigger updated_at
CREATE TRIGGER receivables_updated_at
  BEFORE UPDATE ON receivables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de eventos de billing (audit trail)
CREATE TABLE IF NOT EXISTS billing_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  receivable_id     UUID NOT NULL REFERENCES receivables(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL CHECK (event_type IN ('created', 'status_changed', 'paid', 'partially_paid', 'overdue_detected', 'cancelled', 'note_added')),
  actor_user_id     UUID REFERENCES auth.users(id),
  payload           JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_events_receivable ON billing_events(receivable_id);
CREATE INDEX idx_billing_events_workspace ON billing_events(workspace_id);
CREATE INDEX idx_billing_events_created ON billing_events(created_at);

-- RLS
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_rls_billing_events" ON billing_events
  FOR ALL USING (workspace_id = workspace_id());

-- Function para criar receivable com event
CREATE OR REPLACE FUNCTION create_receivable_with_event(
  p_workspace_id UUID,
  p_company_id UUID,
  p_description TEXT,
  p_amount NUMERIC(14,2),
  p_due_date DATE,
  p_idempotency_key UUID,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_receivable_id UUID;
BEGIN
  INSERT INTO receivables (workspace_id, company_id, description, amount, due_date, idempotency_key, status)
  VALUES (p_workspace_id, p_company_id, p_description, p_amount, p_due_date, p_idempotency_key, 'pendente')
  ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_receivable_id;

  IF v_receivable_id IS NOT NULL THEN
    INSERT INTO billing_events (workspace_id, receivable_id, event_type, actor_user_id, payload)
    VALUES (p_workspace_id, v_receivable_id, 'created', p_actor_user_id, '{"source": "manual"}'::jsonb);
  END IF;

  RETURN v_receivable_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para atualizar status com event
CREATE OR REPLACE FUNCTION update_receivable_status(
  p_receivable_id UUID,
  p_new_status TEXT,
  p_actor_user_id UUID DEFAULT NULL,
  p_paid_amount NUMERIC(14,2) DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_workspace_id UUID;
  v_old_status TEXT;
  v_payload JSONB;
BEGIN
  SELECT workspace_id, status INTO v_workspace_id, v_old_status
  FROM receivables WHERE id = p_receivable_id;

  IF v_old_status = p_new_status THEN
    RETURN;
  END IF;

  v_payload := jsonb_build_object('old_status', v_old_status, 'new_status', p_new_status);

  IF p_new_status = 'pago' THEN
    UPDATE receivables 
    SET status = p_new_status, paid_at = NOW(), paid_amount = COALESCE(p_paid_amount, amount), updated_at = NOW()
    WHERE id = p_receivable_id;
    v_payload := v_payload || jsonb_build_object('paid_amount', p_paid_amount);
  ELSE
    UPDATE receivables SET status = p_new_status, updated_at = NOW() WHERE id = p_receivable_id;
  END IF;

  INSERT INTO billing_events (workspace_id, receivable_id, event_type, actor_user_id, payload)
  VALUES (v_workspace_id, p_receivable_id, 'status_changed', p_actor_user_id, v_payload);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;