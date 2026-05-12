---
task: Validate Scope Acceptance
responsavel: "@levay-po"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - business_context: Current Sollu objective and pain point
  - proposed_slice: Proposed story slice from orchestration
Saida: |
  - accepted_scope: Approved scope boundaries
  - acceptance_criteria: Testable criteria for completion
Checklist:
  - "[ ] Confirm slice solves immediate Sollu operational pain"
  - "[ ] Validate measurable acceptance criteria"
  - "[ ] Reject scope creep outside current slice"
  - "[ ] Align dependencies and assumptions"
  - "[ ] Approve handoff to SM"
---

# *validate-scope-acceptance

Validates scope and acceptance criteria before implementation.
