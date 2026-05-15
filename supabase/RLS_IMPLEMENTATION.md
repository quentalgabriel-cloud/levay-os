# RLS Implementation Guide

## Status
✅ Migration file ready: `supabase/migrations/20260512_enable_rls_workspace_isolation.sql`
✅ Supabase CLI installed (`npx supabase`)

## How to Apply (3 Options)

### Option 1: Via Supabase Dashboard SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/anwtivdognjrghipardd/sql/new
2. Copy the SQL from: `supabase/migrations/20260512_enable_rls_workspace_isolation.sql`
3. Paste and click **Run**

### Option 2: Via Supabase CLI (Requires Login)

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link project
npx supabase link --project-ref anwtivdognjrghipardd

# 3. Push migration
npx supabase db push
```

### Option 3: Direct PSQL Connection

Get connection string from: Dashboard → Settings → Database → Connection string

```bash
psql "postgresql://postgres.[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

## What the RLS Policies Do

| Table | Protection |
|-------|------------|
| `companies` | Only see companies in your workspace |
| `tasks` | Only see tasks in your workspace |
| `projects` | Only see projects in your workspace |
| `decisions` | Only see decisions in your workspace |
| `events` | Only see events in your workspace |
| `crm_clients` | Only see clients in your workspace |
| `captures` | Only see captures in your workspace |
| `workspace_members` | Only see your own memberships |
| `audit_log` | Only admins can view, only for their workspace |
| `collaborators` | See collaborators in your workspace |

## Key Security Points

1. **auth.workspace_id() function** - Secure helper that returns the user's workspace based on `auth.uid()`
2. **WITH CHECK** - For INSERT/UPDATE, ensures data is created in correct workspace
3. **USING** - For SELECT/DELETE, filters rows based on workspace

## Testing RLS

After applying, verify:

```sql
-- Should return only your workspace's data
SELECT * FROM tasks;

-- Should return only your workspace's companies
SELECT * FROM companies;
```

## Troubleshooting

If users can't access data:
1. Check they're authenticated (RLS only applies to authenticated users)
2. Verify they have a `workspace_members` entry
3. Check the `workspace_id` matches in the table

## Rollback

```sql
-- Drop all policies created by this migration
-- (Run the inverse of each CREATE POLICY statement)
```

---

*Generated: 2026-05-12*
*Purpose: Enforce cross-tenant isolation at database level*