# Memory Setup

Setup inicial da estrutura de memória organizacional.

## Descrição

Cria toda a estrutura de memória `.memory/` na raiz do projeto:
- purpose.md com objetivos do negócio
- schema.md com regras de estrutura
- log.md vazio para registros
- Estrutura de diretórios para entities, processes, bottlenecks, opportunities, operations

## Como executar

Execute e o sistema irá:
1. Perguntar sobre o negócio (o que faz, principais áreas)
2. Gerar purpose.md com base nas respostas
3. Gerar schema.md com estrutura de entidades
4. Criar estrutura de diretórios
5. Criar overview.md em operations (mapa inicial)

## Após o setup

Após o setup inicial, use:
- `/memory operations` - Mapear operações atuais
- `/memory bottlenecks` - Identificar gargalos
- `/memory analyze [tema]` - Analisar áreas específicas
- `/memory opportunities` - Identificar oportunidades

## Estrutura criada

```
.memory/
├── purpose.md
├── schema.md
├── index.md
├── log.md
├── entities/
├── processes/
├── bottlenecks/
├── opportunities/
└── operations/
```