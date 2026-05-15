-- Projects: add foco_trimestral
-- Generated: 2026-05-13
-- Rationale: projects already has `modality` column ✅, only `foco_trimestral`
-- is missing per PLANO-MELHORIAS-V1.1.md operational vocabulary.
-- Format: "YYYY-Tn" (e.g. "2026-T1", "2026-T2")

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS foco_trimestral TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_foco_trimestral
  ON projects(foco_trimestral)
  WHERE foco_trimestral IS NOT NULL;

COMMENT ON COLUMN projects.foco_trimestral IS 'Quarter focus tag, format YYYY-Tn (e.g. "2026-T1"). NULL = no quarter assigned yet.';
