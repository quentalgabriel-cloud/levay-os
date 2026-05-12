---
task: Levay QA Run Quality Gate
responsavel: "@levay-qa"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - delivery_increment: Latest code and UX updates
  - acceptance_criteria: Approved PO acceptance criteria
Saida: |
  - gate_decision: Go/no-go with blocking findings
  - qa_report: Regression and risk report
Checklist:
  - "[ ] Validate criteria end-to-end"
  - "[ ] Run regression checks for critical flows"
  - "[ ] Verify tenant and role isolation"
  - "[ ] Register blocking and non-blocking findings"
  - "[ ] Publish go/no-go decision"
---

# *levay-qa-run-quality-gate

Executes final quality gate before release.
