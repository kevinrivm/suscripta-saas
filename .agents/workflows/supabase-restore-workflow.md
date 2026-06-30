---
description: This workflow provides step-by-step instructions for restoring the database schema and data in the **Suscripta SaaS** project, as well as reclaiming orphaned WhatsApp connections.
---

# Supabase Restore Workflow

This workflow provides step-by-step instructions for restoring the database schema and data in the **Suscripta SaaS** project, as well as reclaiming orphaned WhatsApp connections.

> [!CAUTION]
> Restoring a database is a destructive operation. Running these commands will overwrite or modify existing data in your active database environment. Ensure you have a recent backup before proceeding.

---

## 1. Restoration Procedure (SQL Dump)

Use this method to restore schema and data from previously generated SQL dumps.

### Step 1: Restore Schema (DDL)
Apply the table structures, RLS policies, and triggers. You can execute the contents of the base [supabase_setup.sql](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/supabase_setup.sql) or your latest `supabase_schema_backup.sql` directly in the Supabase **SQL Editor**, or run:
```bash
npx supabase db push
```

### Step 2: Restore Data (DML)
Execute the generated SQL insert statements from your `supabase_data_backup.sql` file inside the Supabase **SQL Editor** web panel.

---

## 2. Restoration from JSON Backup (Selective Import)

If you need to restore or seed data selectively from a JSON backup file (e.g., `backups/supabase_backup_YYYY-MM-DD.json`):
Write or execute a migration/seeding script in Node.js to read the JSON file and insert the rows utilizing the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS policies.

---

## 3. Reclaiming Orphaned WhatsApp Connections
If early testing of Meta integrations created connection configurations or logs with a `NULL` `user_id`, run the following SQL queries in the Supabase **SQL Editor** (replace `'ADMIN_UUID'` with the administrator's actual auth user ID):

```sql
UPDATE public.whatsapp_connections
SET user_id = 'ADMIN_UUID'
WHERE user_id IS NULL;

UPDATE public.whatsapp_message_events
SET user_id = 'ADMIN_UUID'
WHERE user_id IS NULL;
```
