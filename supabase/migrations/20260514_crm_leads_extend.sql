-- Extends crm_leads with commercial fields required by LeadsDataTable component.
-- Applied via: supabase db push
-- Callers: none (DDL migration)
-- Existing file 20260513_crm_sollu_pipeline.sql creates the table without these columns.

ALTER TABLE crm_leads
  ADD COLUMN IF NOT EXISTS value       NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS probability TEXT DEFAULT 'baixo'
    CHECK (probability IN ('baixo', 'médio', 'alto')),
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'organico'
    CHECK (source_type IN ('organico', 'campanha'));

CREATE INDEX IF NOT EXISTS idx_crm_leads_probability ON crm_leads(probability);
