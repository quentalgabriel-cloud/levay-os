# Security Gate — Levay OS

## Quando ativar

Ativar o Security Gate (checklist obrigatório antes do BUILD) em **todo** modo Deep que toque:
- Tabelas de banco de dados (nova tabela, nova coluna)
- RLS policies (criar, alterar, dropar)
- Auth flow ou middleware
- Variáveis de ambiente (especialmente não-`NEXT_PUBLIC_*`)
- Server Actions com input de usuário

## Checklist (resposta deve ser SIM para todas)

### Banco de Dados
- [ ] Nova tabela tem RLS habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)?
- [ ] Todas as 4 policies necessárias existem: SELECT, INSERT, UPDATE, DELETE?
- [ ] Policies usam `public.current_workspace_id()` (com schema explícito)?
- [ ] Migration é idempotente (`IF NOT EXISTS` / `IF EXISTS` em todas as operações)?
- [ ] Índices parciais necessários foram criados para queries frequentes?

### Código
- [ ] Módulo em `lib/` que acessa DB ou secrets tem `import 'server-only'`?
- [ ] Parâmetro `supabase` tipado como `SupabaseServerClient` (não `any`)?
- [ ] Erros não expõem mensagens internas do Postgres ao cliente?
- [ ] Server Action tem validação Zod do input antes de qualquer operação?

### Auth
- [ ] Endpoint novo verifica `requireAuth()` ou está na rota pública intencionalmente?
- [ ] Webhook tem validação de assinatura HMAC?

## Se alguma resposta for NÃO

**Parar.** Resolver o gap antes de implementar. Registrar decisão em `docs/adr/` se for uma exceção deliberada.

## Referência

ADRs relacionados: ADR-001 (RLS helper), ADR-002 (server-only), ADR-003 (client typing)
