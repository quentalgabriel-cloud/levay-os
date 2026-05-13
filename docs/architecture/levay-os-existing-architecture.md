# Levay OS — Arquitetura Existente e Plano de Integração Multi-Tenant

> **Data:** 12/05/2026  
> **Status:** Análise Completa

---

## 1. Arquitetura Atual do Sistema

O Levay OS já possui uma arquitetura robusta baseada em:

### 1.1 Modelo de Dados Existente

| Entidade | Descrição | Relações |
|----------|-----------|----------|
| `workspaces` | Workspace principal (1 por grupo) | Raiz do modelo |
| `companies` | Empresas/tenants dentro do workspace (Sollu, AMP 213, Bica) | Pertencem ao workspace |
| `collaborators` | Usuários vinculados ao workspace | Pertencem ao workspace |
| `workspace_members` | Associação user↔workspace com papel | user_id, workspace_id, role |
| `tasks` | Tarefas com inbox, status, priority | company_id opcional, workspace_id |
| `projects` | Projetos com company_id | company_id, workspace_id |
| `decisions` | Decisões com company_id | company_id, workspace_id |
| `crm_clients` | Clientes CRM | company_id, workspace_id |
| `captures` | Capturas de áudio/texto | workspace_id |
| `audit_log` | Log de auditoria | workspace_id |

### 1.2 Estrutura de Diretórios

```
apps/levay-os/src/
├── app/
│   ├── (app)/           # Rotas protegidas (mesa, tarefas, etc)
│   │   ├── mesa/        # Mesa do Diretor - Cockpit principal
│   │   ├── tarefas/     # Lista de tarefas
│   │   ├── projetos/     # Projetos
│   │   ├── decisoes/    # Decisões
│   │   └── empresas/    # Gestão de empresas
│   ├── (auth)/          # Rotas de autenticação
│   │   ├── login/       # Página de login (magic link)
│   │   └── auth/        # Callback e logout
│   └── layout.tsx       # Layout raiz
├── lib/
│   ├── supabase/        # Cliente e servidor Supabase
│   ├── actions/        # Server Actions (createTask, etc)
│   ├── agents/          # Nonô (IA) - inteligência
│   ├── vocabulary.ts   # Labels e constantes
│   └── tenant-context.ts # CONTEXTO MULTI-TENANT
├── components/         # Componentes compartilhados
├── middleware.ts       # Middleware de proteção
└── types/
    └── database.ts     # Tipos do banco (278 tabelas!)
```

### 1.3 Sistema de Autenticação

- **Magic Link** via Supabase Auth
- **Workspace-based** - usuário pertenece ao workspace, não diretamente ao tenant
- **Collaborators** linked via `user_id` do Supabase Auth

### 1.4 Fluxo de Dados

```
User → Supabase Auth → workspace_members → workspaces → companies → [entities]
                                          → collaborators
                                          → tasks/projects/decisions/etc
```

---

## 2. Componentes já Implementados (Story 1.1)

### 2.1 Arquivos Criados

| Arquivo | Propósito |
|---------|----------|
| `/apps/levay-os/src/lib/tenant-context.ts` | Contexto de workspace + permissões |
| `/apps/levay-os/src/middleware.ts` | Proteção de rotas + headers de contexto |
| `/apps/levay-os/src/app/(auth)/auth/callback/route.ts` | Callback com log de auditoria |
| `/apps/levay-os/src/app/(auth)/auth/logout/actions.ts` | Logout com auditoria |

### 2.2 Funcionalidades Implementadas

✅ **Tenant Context Service**
- `getTenantContext()` - extrai contexto do usuário logado
- `requireAuth()` - proteção de rotas
- `canAccessWorkspace()`, `canManageUsers()`, etc - permissões

✅ **Middleware**
- Proteção de rotas: `/mesa`, `/tarefas`, `/projetos`, `/decisoes`, `/empresas`
- Verificação de sessão
- Headers de contexto: `x-workspace-id`, `x-user-role`

✅ **Audit Logging**
- `logAuditEvent()` - registra ações no `audit_log`
- AUTH_LOGIN, AUTH_LOGOUT automáticos

---

## 3. Estratégia de Integração (Não Substituir!)

### 3.1 Princípio: Workspace como Tenant

O sistema já tem uma arquitetura multi-tenant funcional:
- **workspace** = tenant principal (holding)
- **companies** = subdivisões (Sollu, AMP 213, Bica Bar)

### 3.2 Mapeamento para Story 1.1

| Story 1.1 AC | Implementação Atual | Status |
|--------------|---------------------|--------|
| 1. tenant_id obrigatório | ✅ Todas entidades têm `workspace_id` | Completo |
| 2. Auth + papel | ✅ `workspace_members.role` + middleware | Completo |
| 3. Bloquear cross-tenant | ✅ Queries filtram por workspace_id | Completo |
| 4. Dashboard dinâmico | 🔄 Precisa de métricas por company | Parcial |
| 5. Auditoria | ✅ `audit_log` com actor_user_id | Completo |
| 6. Testes | ❌ Pendentes | A fazer |

### 3.3 O que NÃO fazer (Evitar sobreposição)

1. ❌ **Não criar novo modelo de Tenant** - usar `companies` como tenant
2. ❌ **Não substituir workspace_members** - usar como está
3. ❌ **Não duplicar middleware** - o existente está funcional

---

## 4. Próximos Passos Recomendados

### Fase 1: Completar Dashboard (Story 1.3 foundation)

```typescript
// Em /apps/levay-os/src/lib/dashboard-metrics.ts
export async function getDashboardMetrics(workspaceId: string, companySlug?: string) {
  const supabase = await createClient()
  
  // Base metrics
  const [tasks, projects, decisions, clients] = await Promise.all([
    supabase.from('tasks').select('*').eq('workspace_id', workspaceId),
    supabase.from('projects').select('*').eq('workspace_id', workspaceId),
    supabase.from('decisions').select('*').eq('workspace_id', workspaceId),
    supabase.from('crm_clients').select('*').eq('workspace_id', workspaceId)
  ])
  
  // Filter by company if specified
  // Group by company for multi-tenant view
  // Return structured metrics for cockpit
}
```

### Fase 2: Company-Scoped Queries

```typescript
// Criar helpers para filtrar por company
export async function getCompanyTasks(workspaceId: string, companyId: string) {
  const supabase = await createClient()
  return supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('company_id', companyId)
}
```

### Fase 3: Permissões por Company

```typescript
// Verificar se usuário pode acessar uma company específica
export async function canAccessCompany(workspaceId: string, companyId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('id', companyId)
    .single()
  return !!company
}
```

---

## 5. Resumo de Status

| Componente | Status | Observação |
|------------|--------|------------|
| Schema DB | ✅ | Já suporta multi-tenant via workspace_id |
| Auth Flow | ✅ | Magic link + middleware funcional |
| Tenant Context | ✅ | `tenant-context.ts` criado |
| Audit Log | ✅ | AUTH_LOGIN/LOGOUT automatizados |
| Repositories | ⚠️ | Criados mas podem conflitar com actions existentes |
| Dashboard | 🔄 | Métricas existem mas não agrupadas por company |
| Tests | ❌ | Pendentes |

---

## 6. Ação Recomendada

1. **Manter arquitetura atual** - workspace + companies é o caminho certo
2. **Integrar** ao que existe, não substituir
3. **Focar em métricas** - criar `getCompanyMetrics()` para dashboard
4. **Escrever testes** - validar isolamento de workspace

O plano de Story 1.1 está correto, mas precisa ser refinado para **integrar** com a arquitetura existente, não criar uma paralela.