-- Decisions: enforce practical_change (impacto_pratico) as required
-- Generated: 2026-05-13
-- Rationale: PLANO-MELHORIAS-V1.1.md treats "O que muda na prática" as
-- an operational invariant. The column `practical_change` already exists
-- in `decisions` but is nullable. Make it NOT NULL with non-empty CHECK.

UPDATE decisions
SET practical_change = '[pendente]'
WHERE practical_change IS NULL
   OR trim(practical_change) = '';

ALTER TABLE decisions
  ALTER COLUMN practical_change SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'decisions_practical_change_not_empty'
  ) THEN
    ALTER TABLE decisions
      ADD CONSTRAINT decisions_practical_change_not_empty
      CHECK (trim(practical_change) <> '');
  END IF;
END $$;

COMMENT ON COLUMN decisions.practical_change IS 'REQUIRED: "O que muda na prática" — operational invariant from manifest. Cannot be NULL or empty. Use "[pendente]" placeholder only during draft state.';
