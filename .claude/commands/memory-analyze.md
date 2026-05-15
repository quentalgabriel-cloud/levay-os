# Memory Analyze

Analisa um tema/processos/frente do negócio e adiciona à memória.

## Uso

/memory analyze [tema]

## Descrição

Executa análise profunda de um tema específico:
1. Coleta informações do contexto atual
2. Identifica entidades, processos, conexões
3. Identifica gargalos e oportunidades
4. Gera página de documentação interligada
5. Atualiza index.md e log.md

## Exemplos

```
/memory analyze fluxo de vendas
/memory analyze processo de atendimento
/memory analyze área de logística
/memory analyze sistema de gestão
```

## Tipo de Análise

A análise deve identificar:
- **Entidades**: pessoas, áreas, sistemas envolvidos
- **Processos**: fluxos, etapas, responsáveis
- **Gargalos**: pontos de lentidão, gargalos, problemas
- **Oportunidades**: melhorias, novas frentes, automatização
- **Conexões**: como se relaciona com outras partes do negócio

## Saída

Gera arquivo em `.memory/processes/` ou `.memory/entities/` conforme o tipo.