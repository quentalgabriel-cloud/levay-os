-- Sprint 1: Lista de Compras Digital
-- Generated: 2026-05-14 (godmode)
-- Rationale: substrato técnico do briefing-compras-insumos-amp-bica.md
-- Ref: .memory/decisions/sequencia-implementacao-funcional-2026-05-14.md (Sprint 1)
-- Ref: .memory/decisions/adr-arch-bloqueadoras-2026-05-14.md (decisões aplicadas: numeric(14,2) + idempotency_key)
--
-- Pivô da Sprint 1: Thaynan opera, Suedney/Rafael lançam, Erick só aprovação exceção.
-- Status flow: solicitado → consolidado → comprado → recebido (+ cancelado, rupture).
-- Schema único com company_id porque compras compartilhadas BICA+AMP são realidade (cluster='bica+amp').

-- ============================================================
-- TABELA 1: suppliers (cadastro de fornecedores)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT,
  whatsapp        TEXT,
  email           TEXT,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT suppliers_name_workspace_unique UNIQUE (workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_workspace ON suppliers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(workspace_id, category) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE suppliers IS 'Fornecedores cadastrados por workspace. Thaynan mantém, Suedney/Rafael consultam ao lançar pedidos.';
COMMENT ON COLUMN suppliers.category IS 'Categoria operacional livre (hortifruti, carnes, bebidas, embalagens, descartáveis...). Não é ENUM pra permitir evolução.';

-- ============================================================
-- TABELA 2: procurement_requests (header)
-- ============================================================
CREATE TABLE IF NOT EXISTS procurement_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,

  request_number    BIGSERIAL,
  title             TEXT NOT NULL,
  notes             TEXT,

  requested_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  consolidated_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  needed_by         DATE NOT NULL,
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consolidated_at   TIMESTAMPTZ,
  purchased_at      TIMESTAMPTZ,
  received_at       TIMESTAMPTZ,

  status            TEXT NOT NULL DEFAULT 'solicitado'
                    CHECK (status IN ('solicitado', 'consolidado', 'comprado', 'recebido', 'cancelado', 'rupture')),

  estimated_total   NUMERIC(14,2),
  actual_total      NUMERIC(14,2),
  supplier_id       UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  exception_reason  TEXT,
  exception_flagged BOOLEAN NOT NULL DEFAULT FALSE,

  idempotency_key   UUID NOT NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT procurement_requests_idempotency_unique UNIQUE (workspace_id, idempotency_key),
  CONSTRAINT procurement_requests_actual_total_check CHECK (actual_total IS NULL OR actual_total >= 0),
  CONSTRAINT procurement_requests_estimated_total_check CHECK (estimated_total IS NULL OR estimated_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_proc_req_workspace ON procurement_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proc_req_company ON procurement_requests(workspace_id, company_id);
CREATE INDEX IF NOT EXISTS idx_proc_req_status ON procurement_requests(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_proc_req_needed_by ON procurement_requests(workspace_id, needed_by) WHERE status IN ('solicitado', 'consolidado');
CREATE INDEX IF NOT EXISTS idx_proc_req_exception ON procurement_requests(workspace_id) WHERE exception_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_proc_req_requested_by ON procurement_requests(workspace_id, requested_by);

DROP TRIGGER IF EXISTS procurement_requests_updated_at ON procurement_requests;
CREATE TRIGGER procurement_requests_updated_at
  BEFORE UPDATE ON procurement_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE procurement_requests IS 'Header do pedido de compra. Sprint 1 — Lista de Compras Digital.';
COMMENT ON COLUMN procurement_requests.exception_flagged IS 'TRUE quando pedido precisa aprovação Erick (acima_teto | fornecedor_novo | ruptura).';
COMMENT ON COLUMN procurement_requests.idempotency_key IS 'UUID client-side pra evitar double-submit. Ver ADR adr-arch-bloqueadoras-2026-05-14.';

-- ============================================================
-- TABELA 3: procurement_items (line items)
-- ============================================================
CREATE TABLE IF NOT EXISTS procurement_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  request_id          UUID NOT NULL REFERENCES procurement_requests(id) ON DELETE CASCADE,

  description         TEXT NOT NULL,
  category            TEXT,
  unit                TEXT NOT NULL DEFAULT 'un',
  quantity_requested  NUMERIC(10,3) NOT NULL CHECK (quantity_requested > 0),
  quantity_received   NUMERIC(10,3) CHECK (quantity_received IS NULL OR quantity_received >= 0),

  estimated_unit_price  NUMERIC(14,2),
  actual_unit_price     NUMERIC(14,2),
  line_total            NUMERIC(14,2) GENERATED ALWAYS AS (
    COALESCE(actual_unit_price, estimated_unit_price, 0)
    * COALESCE(quantity_received, quantity_requested)
  ) STORED,

  allocated_to_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  item_status         TEXT NOT NULL DEFAULT 'pendente'
                      CHECK (item_status IN ('pendente', 'comprado', 'recebido', 'cancelado', 'substituido')),

  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proc_items_workspace ON procurement_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proc_items_request ON procurement_items(request_id);
CREATE INDEX IF NOT EXISTS idx_proc_items_category ON procurement_items(workspace_id, category) WHERE category IS NOT NULL;

DROP TRIGGER IF EXISTS procurement_items_updated_at ON procurement_items;
CREATE TRIGGER procurement_items_updated_at
  BEFORE UPDATE ON procurement_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE procurement_items IS 'Linhas do pedido. line_total é generated column para evitar drift entre quantidade × preço.';

-- ============================================================
-- TABELA 4: procurement_history (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS procurement_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  request_id    UUID NOT NULL REFERENCES procurement_requests(id) ON DELETE CASCADE,

  event_type    TEXT NOT NULL
                CHECK (event_type IN (
                  'created', 'item_added', 'item_removed', 'consolidated',
                  'sent_to_supplier', 'supplier_confirmed', 'received',
                  'exception_flagged', 'exception_resolved', 'cancelled',
                  'rupture_detected'
                )),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proc_history_workspace ON procurement_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proc_history_request ON procurement_history(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_history_event_type ON procurement_history(workspace_id, event_type, created_at DESC);

COMMENT ON TABLE procurement_history IS 'Audit trail append-only. Cada transição de status, exceção, recebimento vira evento.';

-- ============================================================
-- RLS — todas as 4 tabelas
-- ============================================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select_suppliers" ON suppliers;
CREATE POLICY "workspace_select_suppliers" ON suppliers
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_suppliers" ON suppliers;
CREATE POLICY "workspace_insert_suppliers" ON suppliers
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_suppliers" ON suppliers;
CREATE POLICY "workspace_update_suppliers" ON suppliers
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_suppliers" ON suppliers;
CREATE POLICY "workspace_delete_suppliers" ON suppliers
  FOR DELETE USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_select_proc_req" ON procurement_requests;
CREATE POLICY "workspace_select_proc_req" ON procurement_requests
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_proc_req" ON procurement_requests;
CREATE POLICY "workspace_insert_proc_req" ON procurement_requests
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_proc_req" ON procurement_requests;
CREATE POLICY "workspace_update_proc_req" ON procurement_requests
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_proc_req" ON procurement_requests;
CREATE POLICY "workspace_delete_proc_req" ON procurement_requests
  FOR DELETE USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_select_proc_items" ON procurement_items;
CREATE POLICY "workspace_select_proc_items" ON procurement_items
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_proc_items" ON procurement_items;
CREATE POLICY "workspace_insert_proc_items" ON procurement_items
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_update_proc_items" ON procurement_items;
CREATE POLICY "workspace_update_proc_items" ON procurement_items
  FOR UPDATE USING (workspace_id = workspace_id())
  WITH CHECK (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_delete_proc_items" ON procurement_items;
CREATE POLICY "workspace_delete_proc_items" ON procurement_items
  FOR DELETE USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_select_proc_history" ON procurement_history;
CREATE POLICY "workspace_select_proc_history" ON procurement_history
  FOR SELECT USING (workspace_id = workspace_id());

DROP POLICY IF EXISTS "workspace_insert_proc_history" ON procurement_history;
CREATE POLICY "workspace_insert_proc_history" ON procurement_history
  FOR INSERT WITH CHECK (workspace_id = workspace_id());

-- procurement_history NÃO tem update/delete policy — append-only by design.

-- ============================================================
-- View: procurement_dashboard_v (resumo por unidade pra Mesa Thaynan)
-- ============================================================
DROP VIEW IF EXISTS procurement_dashboard_v;
CREATE VIEW procurement_dashboard_v AS
SELECT
  pr.workspace_id,
  pr.company_id,
  c.slug AS company_slug,
  c.escopo AS company_escopo,
  COUNT(*) FILTER (WHERE pr.status = 'solicitado')   AS qtd_solicitados,
  COUNT(*) FILTER (WHERE pr.status = 'consolidado')  AS qtd_consolidados,
  COUNT(*) FILTER (WHERE pr.status = 'comprado')     AS qtd_comprados,
  COUNT(*) FILTER (WHERE pr.exception_flagged)       AS qtd_excecoes,
  COUNT(*) FILTER (WHERE pr.status = 'rupture')      AS qtd_rupturas,
  SUM(pr.estimated_total) FILTER (WHERE pr.status IN ('solicitado','consolidado')) AS valor_estimado_aberto,
  SUM(pr.actual_total)    FILTER (WHERE pr.status = 'comprado')                    AS valor_comprado_pendente_recebimento,
  MIN(pr.needed_by)       FILTER (WHERE pr.status IN ('solicitado','consolidado')) AS proxima_data_necessaria
FROM procurement_requests pr
JOIN companies c ON c.id = pr.company_id
GROUP BY pr.workspace_id, pr.company_id, c.slug, c.escopo;

COMMENT ON VIEW procurement_dashboard_v IS 'Resumo agregado por company para a Mesa da Thaynan.';

-- ============================================================
-- Helper function: log_procurement_event
-- ============================================================
CREATE OR REPLACE FUNCTION log_procurement_event(
  p_request_id    UUID,
  p_event_type    TEXT,
  p_payload       JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_actor UUID;
  v_id UUID;
BEGIN
  SELECT workspace_id INTO v_workspace_id FROM procurement_requests WHERE id = p_request_id;
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'procurement_request % not found', p_request_id;
  END IF;

  v_actor := auth.uid();

  INSERT INTO procurement_history (workspace_id, request_id, event_type, actor_user_id, payload)
  VALUES (v_workspace_id, p_request_id, p_event_type, v_actor, p_payload)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION log_procurement_event IS 'Helper para Server Actions registrarem eventos no procurement_history. SECURITY DEFINER pra contornar RLS dentro do contexto.';

GRANT EXECUTE ON FUNCTION log_procurement_event TO authenticated;
