---
task: Orchestrate Sollu Sprint
responsavel: "@levay-master"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - current_sprint_goal: Goal and KPI target for this slice
  - known_blockers: Current blockers and risks
Saida: |
  - execution_plan: Ordered handoff plan with owners
  - gate_definition: Required quality gates for this cycle
Checklist:
  - "[ ] Confirm top business goal for Sollu"
  - "[ ] Confirm priority story and scope boundaries"
  - "[ ] Assign PO and SM handoff with explicit expected outputs"
  - "[ ] Set implementation and UX checkpoints"
  - "[ ] Define QA gate and exit criteria"
---

# *orchestrate-sollu-sprint

Orchestrates the current Sollu delivery cycle with explicit handoffs.
