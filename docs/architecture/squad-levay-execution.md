# Squad de Execucao - Levay OS (Sprint Sollu)

## Objetivo
Executar entregas de alto impacto para Sollu com fluxo coordenado entre API, Workers, Web e QA, reduzindo tempo de resposta e risco de regressao.

## Composicao do Squad
1. `aiox-master` (Orquestracao)
2. `aiox-architect` (Direcao tecnica e consistencia de arquitetura)
3. `aiox-dev` API/Workers (Implementacao backend e automacoes)
4. `aiox-dev` Web (Implementacao de view-model/dashboard)
5. `aiox-qa` (Qualidade e regressao)

## Estrategia de Passagem de Bastao
1. Arquitetura define contratos de evento e endpoints.
2. API entrega ingestao/stream/resumo de eventos operacionais.
3. Workers publicam eventos de follow-up/cobranca para API.
4. Web consome stream e transforma em view-model por perfil.
5. QA valida contratos, testes e comportamento de estados criticos.

## Regras de Handoff
1. Ownership por escopo de arquivos (sem sobreposicao).
2. Nenhum agente reverte alteracoes de outro.
3. Handoff sempre inclui: objetivo, arquivos alterados, testes executados e riscos residuais.
4. Integracao final centralizada no orquestrador.

## Tarefas Prioritarias Atuais
1. `operations/events/summary` (API) para visao operacional imediata.
2. `operations panel view-model` (Web) para leitura executiva e operacional.
3. Regressao completa `apps/api`, `apps/workers`, `apps/web`.

## Criterio de Pronto
1. Endpoints operacionais funcionando com filtros por tenant.
2. Workers publicando eventos com status (`success`, `retry`, `dead-letter`).
3. Web apresentando KPIs e eventos com estado `empty/loading/error/ready`.
4. Suite de testes passando em todos os apps afetados.
