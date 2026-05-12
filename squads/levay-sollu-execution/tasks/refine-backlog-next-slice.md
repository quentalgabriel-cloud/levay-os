---
task: Refine Backlog Next Slice
responsavel: "@levay-sm"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - accepted_scope: Scope approved by PO
  - acceptance_criteria: Completion criteria to preserve
Saida: |
  - executable_stories: Small stories with technical notes
  - implementation_order: Suggested build order
Checklist:
  - "[ ] Split work into small executable stories"
  - "[ ] Keep each story independently testable"
  - "[ ] Attach technical dependencies and risks"
  - "[ ] Confirm no overlap between parallel tasks"
  - "[ ] Publish handoff package to Dev and UX"
---

# *refine-backlog-next-slice

Breaks approved scope into executable stories.
