# Operations Page Runbook

## Objetivo
Executar e validar a pagina operacional do Levay OS com dados de stream e summary.

## Comandos
```bash
cd apps/web
npm run dev
```

## Acesso
- URL base: `http://localhost:3200/operations`
- Health: `http://localhost:3200/health`

## Query Params
- `tenantId` (default: `sollu`)
- `apiBaseUrl` (default: `http://localhost:3000`)

Exemplo:
`http://localhost:3200/operations?tenantId=sollu&apiBaseUrl=http://localhost:3000`

## Dependencias de dados
- API Levay rodando na porta `3000` para:
  - `GET /api/v1/operations/events/summary`
  - `GET /api/v1/operations/events/stream`
