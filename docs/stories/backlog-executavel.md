# Levay OS - Backlog de Historias Executaveis

Fonte: `docs/architecture/implementation-plan.md` + `docs/architecture/implementation-plan.yaml` + `docs/prd.md`

## Ordem de Execucao Recomendada

1. 2.1 - CRM e Pipeline Comercial Sollu
2. 2.2 - Workers de Follow-up D+0/D+1/D+3
3. 2.3 - Contas a Receber e Cobranca
4. 3.1 - Ingestao de Leads via Webhook n8n
5. 3.2 - Calendario de Eventos AMP 213
6. 4.1 - Reservas, Mesas e Fila Bica Bar
7. 4.2 - Membership BICA CLUB
8. 5.1 - Quality Gates por Fluxo
9. 5.2 - Integracao Google Drive para Contratos
10. 6.1 - Endpoint Analitico Executivo
11. 6.2 - Dashboard Executivo Cross-tenant

## Criterio de Tamanho

Cada historia foi quebrada para execucao em uma sessao focada de 2-4 horas por agente de desenvolvimento, com escopo fechado, verificacao objetiva e dependencia explicita.

## Dependencias Criticas

- Historias 2.x dependem de 1.1, 1.2 e 1.3 prontas.
- 5.1 depende de modulo de automacoes minimamente funcional.
- 6.2 depende de 6.1.

