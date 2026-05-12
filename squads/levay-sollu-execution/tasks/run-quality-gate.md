---
task: Run Quality Gate
responsavel: "@levay-qa"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - code_changes: Delivered implementation and UX updates
  - acceptance_criteria: Approved PO criteria
Saida: |
  - gate_decision: Pass or fail with blocking findings
  - validation_report: Risks, regressions and recommendations
Checklist:
  - "[ ] Validate acceptance criteria end to end"
  - "[ ] Run regression checks on CRM, billing and operations"
  - "[ ] Confirm role-based visibility and tenant isolation"
  - "[ ] Record blocking and non-blocking findings"
  - "[ ] Publish final go/no-go decision"
---

# *run-quality-gate

Runs the final quality gate before closing the slice.
