---
task: Levay Master Publish Implementation Status
responsavel: "@levay-master"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - current_stage: Current workflow stage that just finished
  - story_scope: Stories or slice currently being implemented
  - latest_outputs: Most relevant outputs, files touched and evidence
  - blockers: Current blockers, risks or decisions needed
Saida: |
  - status_update: Concise implementation update for stakeholders
  - next_action: Immediate next handoff or unblock action
Checklist:
  - "[ ] Capture stage completed and current owner"
  - "[ ] Summarize what changed in implementation terms"
  - "[ ] Record evidence, validation and blockers"
  - "[ ] State the immediate next action and responsible agent"
  - "[ ] Publish update to docs/status/levay-continuity.md using the squad template"
---

# *levay-master-publish-implementation-status

Publishes a concise implementation update after each meaningful handoff so stakeholders can track execution in near real time.
