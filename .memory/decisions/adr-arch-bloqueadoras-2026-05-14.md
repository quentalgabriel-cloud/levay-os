---
title: ADR — 3 decisões arquiteturais bloqueadoras antes da Sprint 3
type: decision
created: 2026-05-14
updated: 2026-05-14
confidence: high
tags: [adr, arquitetura, sprint-3-blocker, godmode-2026-05-14, financeiro, idempotencia, numeric]
connections: [[sequencia-implementacao-funcional-2026-05-14]], [[arquitetura-ecossistema-definitivo]], [[sprint-foundation-v1.1-2026-05-13]]
related: [[parking-lot-central-financeira]]
---

# ADR — 3 decisões arquiteturais bloqueadoras antes da Sprint 3

Esta ADR resolve as 3 decisões marcadas como "bloqueadoras" em [[sequencia-implementacao-funcional-2026-05-14]] (linhas 84-86). Decididas em godmode 2026-05-14 para destravar Sprint 1 (Compras) e Sprint 3 (Retiradas Erick).

## Decisão #1 — Migrations: consolidar em `/supabase/migrations/` raiz

**Status:** APROVADO
**Vence:** raiz (`/supabase/migrations/`)

**Estado atual auditado:**
- `/supabase/migrations/` → 9 migrations principais (v1.1 foundation, RLS, workspace_config, CRM Sollu, reservations RLS)
- `/apps/levay-os/supabase/migrations/` → 1 arquivo solto (`20260514_crm_leads_extend.sql`)

**Por quê raiz vence:**
1. Raiz tem 9× mais migrations — é onde o histórico real está.
2. Raiz é onde `supabase db push` aponta por convenção quando há `supabase/config.toml` no nível do projeto.
3. Sub-app `apps/levay-os/supabase/` foi criado quando `apps/levay-os` ainda era submódulo (resolvido em 2026-05-13).
4. Manter dois diretórios fragmenta o histórico e força CI a saber escolher entre eles.

**Plano de migração:**
1. Mover `apps/levay-os/supabase/migrations/20260514_crm_leads_extend.sql` para `supabase/migrations/20260514_crm_leads_extend.sql` (renomear se houver conflito de prefixo).
2. Remover diretório `apps/levay-os/supabase/`.
3. Garantir que `supabase/config.toml` (raiz) está apontando para o projeto Supabase de produção.
4. Adicionar `apps/levay-os/supabase/` ao `.gitignore` para evitar reaparecimento.

**Convenção de nomenclatura adotada:**
```
{YYYYMMDD}_{nnn}_{descrição-em-kebab}.sql
```
onde `nnn` é incremento de 010 (Sprint 1 começa em 100 para evitar colisão com v1.1 foundation que terminou em 060).

## Decisão #2 — Tipo numérico financeiro: `numeric(14,2)` + BigInt em JS

**Status:** APROVADO
**Vence:** `numeric(14,2)` no DB, `bigint` (centavos) em JS, conversão em borda

**Trade-offs:**

| Opção | Pro | Contra |
|---|---|---|
| `numeric(14,2)` DB + `number` JS | Simples | Precisão flutuante no JS — soma de 100 itens já desvia centavos |
| `numeric(14,2)` DB + `string` JS | Sem perda | UI precisa parsear toda vez; cálculos client-side viram cerimônia |
| **`numeric(14,2)` DB + `bigint` JS (centavos)** | Aritmética exata, sem perda, JS suporta nativo | Conversão obrigatória nas bordas (zod) |
| `integer` (centavos) DB | Mais rápido | `numeric` é o padrão Postgres para dinheiro — suporta agregações com `SUM` corretas |

**Por quê `numeric(14,2)`:**
- 14 dígitos totais → suporta até R$ 999.999.999.999,99 (trilhões) — mais que suficiente para LEVAY pelos próximos 50 anos.
- 2 casas decimais → centavos exatos.
- Postgres garante precisão em `SUM`, `AVG`, agregações.

**Por quê `bigint` no JS (centavos):**
- BigInt em JS é nativo desde ES2020, suportado por Next.js 14+.
- Multiplicar/dividir por 100 só na borda (zod transform).
- Sem perda de precisão em loops, somas, multiplicações.

**Padrão de código (a ser adotado em toda Server Action financeira):**

```typescript
const PayableSchema = z.object({
  amount_cents: z.coerce.bigint().positive(),
  description: z.string().min(1),
  due_date: z.coerce.date()
});

const dbValue = (Number(parsed.amount_cents) / 100).toFixed(2);
await supabase.from('bica_payables').insert({
  amount: dbValue,
  ...
});

const fromDb: bigint = BigInt(Math.round(parseFloat(row.amount) * 100));
```

**Helper compartilhado a criar:** `apps/levay-os/src/lib/money.ts`
```typescript
export const toCents = (decimal: string | number): bigint =>
  BigInt(Math.round(Number(decimal) * 100));
export const toDecimal = (cents: bigint): string =>
  (Number(cents) / 100).toFixed(2);
export const formatBRL = (cents: bigint): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(cents) / 100);
```

## Decisão #3 — Idempotência: UUID client-side + unique constraint

**Status:** APROVADO
**Vence:** `idempotency_key UUID NOT NULL` em toda tabela transacional com unique constraint

**Por quê:**
- Briefing R6 ("idempotência IA") + briefing financeiro insistem em garantia de no-double-write
- Server Actions em Next.js podem ser retried por React 19 (form retry, network blip)
- IA agents (Nonô futuro) podem disparar duplicado se network falhar entre LLM call e save
- Padrão simples, sem dependência externa (sem Redis, sem Inngest), implementável hoje

**Padrão a adotar:**

1. **Client-side:** UUID v4 gerado no momento da intenção (botão submit clicado, não no submit handler):
```typescript
const idempotencyKeyRef = useRef(crypto.randomUUID());
await registerWithdrawal({ ...data, idempotency_key: idempotencyKeyRef.current });
```

2. **Server Action:** receber, validar, passar ao insert:
```typescript
const schema = z.object({
  idempotency_key: z.string().uuid(),
  amount_cents: z.coerce.bigint().positive(),
  ...
});
```

3. **DB:** unique constraint:
```sql
CREATE TABLE personal_inflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  idempotency_key UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  ...
  UNIQUE (workspace_id, idempotency_key)
);
```

4. **Handling de retry:**
```typescript
const { data, error } = await supabase.from('personal_inflows').insert(...).select().single();
if (error?.code === '23505') {
  const { data: existing } = await supabase
    .from('personal_inflows')
    .select()
    .eq('workspace_id', wsId)
    .eq('idempotency_key', key)
    .single();
  return { ok: true, data: existing, deduped: true };
}
```

5. **Limpeza:** TTL não necessário para tabelas transacionais (mantém histórico). Para `outbox` events futuro, considerar TTL 7d.

**Tabelas que recebem idempotency_key (Sprint 1+):**
- `procurement_requests` (Sprint 1)
- `personal_inflows` (Sprint 3)
- `*_payables` × 4 (Sprint 3-4)
- `payment_window_batches` (Sprint 4)

## Resumo das decisões — quick reference

| # | Decisão | Vencedor | Onde fica |
|---|---|---|---|
| 1 | Migrations | `/supabase/migrations/` raiz | Mover 1 arquivo, deletar sub-app |
| 2 | Numeric | `numeric(14,2)` DB + `bigint` JS | Helper em `src/lib/money.ts` |
| 3 | Idempotência | UUID client-side + unique constraint | Toda tabela transacional |

## Como reverter

Esta ADR pode ser revertida com nova ADR documentada que apresente:
- Decisão #1: evidência de que ter migrations em apps/ traz benefício > custo de fragmentação
- Decisão #2: evidência de que `bigint` em JS quebra DX em algum caminho crítico
- Decisão #3: evidência de que outra estratégia (Inngest, queue) é necessária por escala

Até lá, **estas decisões são lei.**
