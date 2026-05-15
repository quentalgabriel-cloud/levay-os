-- Sprint 3: Security Hardening — Database Migrations
-- Generated: 2026-05-15
-- Audit findings addressed:
--   S3-M1: procurement_dashboard_v → WITH (security_invoker = true)
--   S3-M2: followup_jobs UNIQUE (workspace_id, idempotency_key)
--   S3-M3: DELETE policies para companies, projects, decisions, events, captures, crm_clients
--   S3-M4: INSERT/UPDATE/DELETE policies para collaborators
--   S3-M5: RLS policies com (SELECT auth.workspace_id()) — evita chamada por linha
--   S3-M6: procurement_requests.requested_by → ON DELETE SET NULL + DROP NOT NULL
--   S3-M7: receivables indexes prefixados com workspace_id
--   S3-M8: schedule_followup_for_lead — declarar `offset INTEGER` no DECLARE
--   S3-M9: audit_log INSERT policy — valida workspace_id real

-- ============================================================
-- S3-M1: procurement_dashboard_v com security_invoker = true
-- Sem isso, a view roda com os privilégios do definidor (DEFINER),
-- ignorando RLS do chamador — qualquer auth pode ler todos os tenants.
-- ============================================================
DROP VIEW IF EXISTS procurement_dashboard_v;
CREATE VIEW procurement_dashboard_v
  WITH (security_invoker = true)
AS
SELECT
  pr.workspace_id,
  pr.company_id,
  c.slug  AS company_slug,
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

COMMENT ON VIEW procurement_dashboard_v IS 'Resumo agregado por company. security_invoker=true garante que RLS do chamador é aplicada.';

-- ============================================================
-- S3-M2: UNIQUE constraint em followup_jobs para suportar ON CONFLICT
-- O código usa ON CONFLICT (workspace_id, idempotency_key) mas a constraint
-- não existia — isso tornava o upsert silenciosamente um INSERT comum.
-- ============================================================
ALTER TABLE followup_jobs
  ADD CONSTRAINT IF NOT EXISTS followup_jobs_workspace_idem_key
  UNIQUE (workspace_id, idempotency_key);

-- ============================================================
-- S3-M3: DELETE policies em tabelas que só tinham SELECT/INSERT/UPDATE
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can delete their workspace companies'
  ) THEN
    CREATE POLICY "Users can delete their workspace companies"
      ON companies FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete their workspace projects'
  ) THEN
    CREATE POLICY "Users can delete their workspace projects"
      ON projects FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'decisions' AND policyname = 'Users can delete their workspace decisions'
  ) THEN
    CREATE POLICY "Users can delete their workspace decisions"
      ON decisions FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can delete their workspace events'
  ) THEN
    CREATE POLICY "Users can delete their workspace events"
      ON events FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'captures' AND policyname = 'Users can delete their workspace captures'
  ) THEN
    CREATE POLICY "Users can delete their workspace captures"
      ON captures FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_clients' AND policyname = 'Users can delete their workspace crm_clients'
  ) THEN
    CREATE POLICY "Users can delete their workspace crm_clients"
      ON crm_clients FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

-- ============================================================
-- S3-M4: Policies completas para collaborators (INSERT/UPDATE/DELETE)
-- Só tinha SELECT policy — qualquer membro podia inserir sem filtro de workspace.
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collaborators' AND policyname = 'Users can insert workspace collaborators'
  ) THEN
    CREATE POLICY "Users can insert workspace collaborators"
      ON collaborators FOR INSERT
      WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collaborators' AND policyname = 'Users can update workspace collaborators'
  ) THEN
    CREATE POLICY "Users can update workspace collaborators"
      ON collaborators FOR UPDATE
      USING (workspace_id = (SELECT auth.workspace_id()))
      WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collaborators' AND policyname = 'Users can delete workspace collaborators'
  ) THEN
    CREATE POLICY "Users can delete workspace collaborators"
      ON collaborators FOR DELETE
      USING (workspace_id = (SELECT auth.workspace_id()));
  END IF;
END $$;

-- ============================================================
-- S3-M5: Substituir policies que chamam auth.workspace_id() por linha
-- por versão com subquery (SELECT auth.workspace_id()) — avaliada uma vez
-- por query, não uma vez por linha.
-- ============================================================

-- tasks (high volume)
DROP POLICY IF EXISTS "Users can view their workspace tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their workspace tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their workspace tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their workspace tasks" ON tasks;

CREATE POLICY "workspace_select_tasks" ON tasks FOR SELECT
  USING (workspace_id = (SELECT auth.workspace_id()));
CREATE POLICY "workspace_insert_tasks" ON tasks FOR INSERT
  WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
CREATE POLICY "workspace_update_tasks" ON tasks FOR UPDATE
  USING (workspace_id = (SELECT auth.workspace_id()))
  WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
CREATE POLICY "workspace_delete_tasks" ON tasks FOR DELETE
  USING (workspace_id = (SELECT auth.workspace_id()));

-- companies
DROP POLICY IF EXISTS "Users can view their workspace companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their workspace companies" ON companies;
DROP POLICY IF EXISTS "Users can update their workspace companies" ON companies;

CREATE POLICY "workspace_select_companies" ON companies FOR SELECT
  USING (workspace_id = (SELECT auth.workspace_id()));
CREATE POLICY "workspace_insert_companies" ON companies FOR INSERT
  WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
CREATE POLICY "workspace_update_companies" ON companies FOR UPDATE
  USING (workspace_id = (SELECT auth.workspace_id()))
  WITH CHECK (workspace_id = (SELECT auth.workspace_id()));

-- crm_leads (high volume — paginated kanban)
DROP POLICY IF EXISTS "workspace_rls_crm_leads" ON crm_leads;
CREATE POLICY "workspace_rls_crm_leads" ON crm_leads
  FOR ALL USING (workspace_id = (SELECT auth.workspace_id()));

-- ============================================================
-- S3-M6: procurement_requests.requested_by → ON DELETE SET NULL
-- ON DELETE RESTRICT bloqueia delete de usuários que têm pedidos.
-- Campo continua rastreável (NULL = usuário deletado).
-- ============================================================
ALTER TABLE procurement_requests
  ALTER COLUMN requested_by DROP NOT NULL;

ALTER TABLE procurement_requests
  DROP CONSTRAINT IF EXISTS procurement_requests_requested_by_fkey;

ALTER TABLE procurement_requests
  ADD CONSTRAINT procurement_requests_requested_by_fkey
  FOREIGN KEY (requested_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- ============================================================
-- S3-M7: Receivables — índices prefixados com workspace_id
-- Queries RLS filtram por workspace_id primeiro; índices sem workspace_id
-- resultam em full table scan por tenant para depois filtrar.
-- ============================================================
DROP INDEX IF EXISTS idx_receivables_status;
DROP INDEX IF EXISTS idx_receivables_due_date;
DROP INDEX IF EXISTS idx_receivables_company;

CREATE INDEX IF NOT EXISTS idx_receivables_workspace_status
  ON receivables(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_receivables_workspace_due_date
  ON receivables(workspace_id, due_date);
CREATE INDEX IF NOT EXISTS idx_receivables_workspace_company
  ON receivables(workspace_id, company_id);

-- ============================================================
-- S3-M8: schedule_followup_for_lead — declarar `offset INTEGER`
-- FOREACH offset IN ARRAY ... usava variável não declarada; PL/pgSQL
-- em Postgres 14+ rejeita isso com "column reference is ambiguous".
-- ============================================================
CREATE OR REPLACE FUNCTION schedule_followup_for_lead(p_lead_id UUID)
RETURNS void AS $$
DECLARE
  v_workspace_id TEXT;
  v_phone TEXT;
  offset INTEGER;
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

-- ============================================================
-- S3-M9: audit_log INSERT policy — validar workspace_id real
-- Policy anterior: WITH CHECK (workspace_id IS NOT NULL)
-- Qualquer user autenticado podia inserir logs em qualquer workspace.
-- ============================================================
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_log;

CREATE POLICY "workspace_insert_audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (workspace_id = (SELECT auth.workspace_id()));
