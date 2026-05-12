---
task: Levay PO Validate Scope
responsavel: "@levay-po"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - sprint_contract: Scope and expected outcomes from master
  - stakeholder_context: Critical constraints from operation and CEO
Saida: |
  - accepted_scope: Final approved slice
  - acceptance_criteria: Testable acceptance checks
Checklist:
  - "[ ] Validate direct impact on Sollu loss-reduction goals"
  - "[ ] Confirm criteria are objective and testable"
  - "[ ] Remove scope creep from current slice"
  - "[ ] Register assumptions and dependencies"
  - "[ ] Handoff accepted scope to SM"
---

# *levay-po-validate-scope

Approves scope and criteria before technical breakdown.
