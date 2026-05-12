# Levay Sollu Execution Squad

Squad local para executar a evolucao do Levay OS com foco inicial na Sollu.

## Objetivo

Industrializar o fluxo operacional critico da Sollu (CRM, follow-up, cobranca e quality gates) com ciclos curtos e handoff explicito entre agentes.

## Sequencia de handoff

1. `@levay-master` executa `*orchestrate-sprint`
2. `@levay-master` executa `*publish-implementation-status`
3. `@levay-po` executa `*validate-scope`
4. `@levay-master` executa `*publish-implementation-status`
5. `@levay-sm` executa `*refine-backlog`
6. `@levay-master` executa `*publish-implementation-status`
7. `@levay-dev` executa `*implement-sollu-slice`
8. `@levay-master` executa `*publish-implementation-status`
9. `@levay-ux` executa `*harden-operations-ui`
10. `@levay-master` executa `*publish-implementation-status`
11. `@levay-qa` executa `*run-quality-gate`
12. `@levay-master` executa `*publish-implementation-status`
13. `@levay-master` fecha ciclo e inicia o proximo slice

## Foco atual

- Tenant prioritario: `sollu`
- Impacto alvo: reduzir perdas por falta de follow-up/cobranca e tornar a tela operacional usavel no dia a dia.

## Atualizacao de implementacao

- O squad agora publica atualizacoes de implementacao apos cada handoff relevante.
- O ponto oficial de consolidacao e `docs/status/levay-continuity.md`.
- O formato padrao fica em `templates/implementation-status-update-tmpl.md`.
- Em caso de bloqueio ou mudanca de foco, o update deve ser publicado imediatamente, sem esperar o fim do ciclo.

## Componentes de orquestracao

- Workflow principal: `workflows/sollu-daily-execution.yaml`
- Checklist de release: `checklists/sollu-release-gate.md`
- Tool de priorizacao: `tools/operational-priority-tool.js`
- Health script: `scripts/run-squad-health.sh`
