---
task: Levay Master Orchestrate Sprint
responsavel: "@levay-master"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - sprint_goal: Current Sollu goal for current cycle
  - business_kpi: Target KPI for this iteration
Saida: |
  - sprint_contract: Scope, owners and expected outputs
  - handoff_sequence: Ordered chain for PO, SM, Dev, UX and QA
Checklist:
  - "[ ] Confirm one clear business goal for the slice"
  - "[ ] Lock scope and non-goals for the cycle"
  - "[ ] Assign handoff owner for each stage"
  - "[ ] Define measurable exit criteria"
  - "[ ] Open execution window and start PO handoff"
---

# *levay-master-orchestrate-sprint

Creates the execution contract for the current Sollu cycle.
