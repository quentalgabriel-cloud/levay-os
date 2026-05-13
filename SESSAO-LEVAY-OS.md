# Levay OS - Sessão de Desenvolvimento

## Contexto
Sistema operacional do Grupo Levay para gerenciar operações de múltiplas empresas (Bica Bar, AMP 213, Sollu) com recursos compartilhados.

---

## 🎯 Objetivo Principal
Criar visualização unificada para o Erick com informações cruzadas das operações Bica + AMP (duas empresas separadas com recursos compartilhados na coluna central).

---

## 🔧 Stack Técnico
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link / OTP)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

---

## 📊 Estrutura do Banco

### Workspaces
```
ID: 00000000-0000-0000-0000-000000000001 (Grupo Levay)
```

### Companies
| ID | Nome | Slug |
|----|------|------|
| 10000000-0000-0000-0000-000000000001 | Sollu | sollu |
| 10000000-0000-0000-0000-000000000002 | AMP 213 | amp213 |
| 10000000-0000-0000-0000-000000000003 | Bica Bar Sensorial | bica |

### Tabelas Principais
- `tasks` - Tarefas com company_id, due_date, tags, priority
- `collaborators` - Colaboradores com profile_data (JSONB)
- `collaborator_notes` - Anotações sobre colaboradores
- `decisions` - Decisões estratégicas
- `companies` - Empresas
- `projects` - Projetos/Iniciativas

---

## 📂 Arquivos Importantes

### Páginas Criadas
- `/bica-amp` - Visualização 3 colunas (Bica | Compartilhado | AMP)
- `/colaboradores` - Lista de pessoas com filtros
- `/colaboradores/[id]` - Perfil individual completo
- `/login` - Login com magic link (corrigido para URL dinâmica)
- `/auth/callback` - Callback de autenticação

### Scripts de Importação
- `scripts/import-notion-tasks-v2.mjs` - 204 tarefas importadas
- `scripts/import-collaborators.mjs` - 6 colaboradores
- `scripts/import-decisions.mjs` - 9 decisões
- `scripts/update-collaborators-profile.mjs` - Atualiza profile_data

### Migration
- `migrations/expand_collaborators_v1.sql` - Adiciona colunas + notas + empresas

---

## ⚠️ Problemas Resolvidos

1. **RLS Stack Overflow**: Dropadas políticas problemáticas em `get_my_workspace_id()`
2. **Login URL Fixa**: Corrigido para usar `window.location.origin` dinâmica
3. **Conflito de Rota**: Removido `route.ts` duplicado em `/auth/callback`
4. **Email não confirmado**: Criado usuário teste erick@levay.com.br

---

## 🔐 Autenticação

### Usuário Criado
- **Email**: erick@levay.com.br
- **ID**: 5014da3a-8358-40ef-8901-165f194281dd
- **Status**: Email precisa ser confirmado no Dashboard

### Login Flow
1. Usuário acessa `/login`
2. Insere email → Recebe magic link
3. Clica link → `/auth/callback` → Redireciona para `/mesa`

---

## 🧠 Decisões Arquiteturais

### Colaboradores - Estrutura Híbrida
- **Tabela única** com colunas para dados fixos (nome, email, whatsapp)
- **JSONB profile_data** para dados flexíveis (forces, specialty, impact_phrase)
- **Tabela separada collaborator_notes** para anotações crescentes
- **Decisão**: Balance entre performance e flexibilidade

### Layout Bica+AMP
- 3 colunas: BICA | COMPARTILHADO | AMP
- Recursos compartilhados: Lana, Cozinha, Prédio, Equipe
- Cada empresa tem marca, comercial e planejamento próprios

---

## 📝 Dados Importados do Notion

### Tarefas
- 204 tarefas (114 do Erick + 90 do Gabriel)
- Mapeadas por company_id

### Colaboradores
- Thaynan (role: Operadora principal, strengths: Calma sob pressão...)
- Lana, Ruan, Cigano, Guilherme, Jade
- Com observações, contract_type

### Decisões
- 9 decisões estratégicas importadas
- Tipos: financeira, operacional, estratégica

---

## 🚀 Próximos Passos

1. Confirmar email do usuário no Supabase Dashboard
2. Testar login em http://localhost:3000/login
3. Validar páginas /colaboradores e /bica-amp
4. Adicionar tarefas ao colaborar (assignee_id)
5. Popular collaborator_companies para multi-empresa

---

## 📌 Arquivo de Configuração
- `.env.local` com NEXT_PUBLIC_SUPABASE_URL e ANON_KEY
- Produção usa redirect para https://levay-os.vercel.app