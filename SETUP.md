# Levay OS - Guia de Configuração

Este documento fornece instruções para configurar o projeto em um novo ambiente de desenvolvimento.

## Requisitos

- **Node.js** 18+ (recomendado: 20 LTS)
- **npm** 10+ (vem com Node.js)
- **Docker Desktop** (opcional - necessário apenas para serviços externos)

> **Nota**: O projeto usa SQLite, então você pode rodar localmente sem Docker!

##快速开始 (Quick Start)

```bash
# 1. Clone o repositório
git clone git@github.com:quentalgabriel-cloud/sistemainterno-grupo-levay.git
cd sistemainterno-grupo-levay

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de ambiente
cp .env.example .env

# 4. Inicie o banco de dados (SQLite - já incluso)
# O banco já existe em prisma/dev.db, ou execute:
npx prisma db push

# 5. Inicie o projeto
npm run dev
```

## Estrutura do Projeto

```
sistemainterno-grupo-levay/
├── apps/
│   ├── api/          # API REST (Fastify)
│   ├── web/          # Frontend (Next.js)
│   ├── workers/      # Processamento em background
│   └── levay-os/     # App principal
├── packages/         # Pacotes compartilhados
├── prisma/           # Schema do banco de dados (SQLite)
└── scripts/          # Scripts de automação
```

## Configuração de Variáveis de Ambiente

### Arquivos necessários

Cada app possui seu próprio `.env.example`:

- `.env` - Raiz (variáveis globais)
- `apps/api/.env.example` - API
- `apps/web/.env.example` - Frontend
- `apps/workers/.env.example` - Workers

### Variáveis Principais

```env
# Banco de dados (SQLite - padrão)
DATABASE_URL="file:./prisma/dev.db"

# Ambiente
NODE_ENV="development"

# API (apps/api/.env)
PORT=3000
ALLOWED_ORIGIN="http://localhost:3201"
LOG_LEVEL="info"
ENABLE_AUTH="false"
ENABLE_RATE_LIMIT="false"

# Frontend (apps/web/.env)
API_BASE_URL="http://localhost:3000"
PORT=3201

# Workers (apps/workers/.env)
PORT=3400
WORKERS_POLL_INTERVAL_MS=5000
LEVAY_API_BASE_URL="http://localhost:3000"
```

## Desenvolvimento Local

### Modo Desenvolvimento (sem Docker)

```bash
# Iniciar apenas a API
cd apps/api && npm start

# Iniciar apenas o Frontend
cd apps/web && npm run dev

# Iniciar Workers
cd apps/workers && npm start

# OU usar o script principal
npm run dev
```

### Com Docker (Produção/Estágio)

```bash
# Iniciar todos os serviços
docker-compose up

# Ou em background
docker-compose up -d
```

## Scripts Disponíveis

```bash
npm run dev          # Iniciar o stack completo
npm run test         # Executar todos os testes
npm run lint         # Verificar código
npm run typecheck    # Verificar tipos
npm run build        # Build de produção
npm run smoke        # Teste rápido de saúde
npm run status       # Ver status dos serviços
```

## Solução de Problemas

### "Module not found"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro no banco de dados

```bash
# Recriar o banco
npx prisma db push --force-reset
npx prisma db seed
```

### Porta já em uso

```bash
# Matar processos na porta
lsof -ti:3001 | xargs kill -9  # API
lsof -ti:3201 | xargs kill -9  # Web
```

## Próximos Passos

Após a configuração inicial:

1. Leia a documentação em `docs/`
- Explore os módulos em `apps/api/src/modules/`
- Configure integrações em `.env` (se necessário)

## Troubleshooting

Para mais ajuda, execute:

```bash
# Verificar ambiente
node scripts/setup/check-env.js

# Ver status
npm run status
```