-- Companies: typed DNA fields + cluster + escopo
-- Generated: 2026-05-13
-- Rationale: extend companies with typed columns for the operational
-- vocabulary defined in PLANO-MELHORIAS-V1.1.md. Coexists with existing
-- JSONB `dna` column for backwards compat. No data loss.

-- ============================================================
-- Add typed columns (all NULL-able, additive)
-- ============================================================
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS cluster TEXT,
  ADD COLUMN IF NOT EXISTS escopo TEXT,
  ADD COLUMN IF NOT EXISTS dna_oneliner TEXT,
  ADD COLUMN IF NOT EXISTS promessa TEXT,
  ADD COLUMN IF NOT EXISTS tom_voz TEXT,
  ADD COLUMN IF NOT EXISTS anti_publico TEXT,
  ADD COLUMN IF NOT EXISTS principal_desafio TEXT,
  ADD COLUMN IF NOT EXISTS principal_oportunidade TEXT,
  ADD COLUMN IF NOT EXISTS proximo_marco TEXT,
  ADD COLUMN IF NOT EXISTS compartilha_predio_com TEXT,
  ADD COLUMN IF NOT EXISTS compartilha_cozinha_com TEXT;

-- ============================================================
-- Escopo CHECK constraint (5 escopos válidos)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_escopo_check'
  ) THEN
    ALTER TABLE companies
      ADD CONSTRAINT companies_escopo_check
      CHECK (escopo IS NULL OR escopo IN ('SOLLU','BICA','AMP213','PESSOAL_ERICK','GERAL'));
  END IF;
END $$;

-- ============================================================
-- Indexes for filter queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_companies_cluster ON companies(cluster) WHERE cluster IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_escopo ON companies(escopo) WHERE escopo IS NOT NULL;

-- ============================================================
-- Seed/backfill the 3 known companies (idempotent — uses slug as key)
-- ============================================================
UPDATE companies SET
  escopo = COALESCE(escopo, 'SOLLU'),
  dna_oneliner = COALESCE(dna_oneliner, 'Especialista em limpa nome / crédito')
WHERE slug = 'sollu';

UPDATE companies SET
  escopo = COALESCE(escopo, 'BICA'),
  cluster = COALESCE(cluster, 'bica+amp'),
  compartilha_predio_com = COALESCE(compartilha_predio_com, 'amp213'),
  compartilha_cozinha_com = COALESCE(compartilha_cozinha_com, 'amp213'),
  dna_oneliner = COALESCE(dna_oneliner, 'Speakeasy sensorial — experiência premium 65 pessoas')
WHERE slug = 'bica';

UPDATE companies SET
  escopo = COALESCE(escopo, 'AMP213'),
  cluster = COALESCE(cluster, 'bica+amp'),
  compartilha_predio_com = COALESCE(compartilha_predio_com, 'bica'),
  compartilha_cozinha_com = COALESCE(compartilha_cozinha_com, 'bica'),
  dna_oneliner = COALESCE(dna_oneliner, 'Casa de eventos — Rua do Amparo 213, Sítio Histórico de Olinda')
WHERE slug = 'amp213';

-- ============================================================
-- Documentation
-- ============================================================
COMMENT ON COLUMN companies.cluster IS 'Operational cluster: NULL = isolated (e.g. Sollu), "bica+amp" = shared building/kitchen/team';
COMMENT ON COLUMN companies.escopo IS 'Operational scope: SOLLU | BICA | AMP213 | PESSOAL_ERICK | GERAL';
COMMENT ON COLUMN companies.dna IS 'Legacy JSONB DNA — superseded by typed columns dna_oneliner/promessa/tom_voz/etc. Kept for backwards compat.';
