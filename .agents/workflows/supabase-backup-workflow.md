# Supabase Backup Workflow

This workflow provides step-by-step instructions for backing up the database schema and data in the **Suscripta SaaS** project. It is strictly for generating backups. For restoration steps, refer to the restore workflow.

---

## 1. Password-less Data Backup (Using Node.js Utility)
Use this method to quickly download and consolidate data from the main public tables (`profiles`, `customers`, `whatsapp_connections`, `whatsapp_message_events`, `test`) using your admin client service key. This method **does not** require the Postgres database master password.

### Steps:
1. Ensure your `.env.local` file contains valid credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run the backup utility script:
   ```bash
   node backups/create_backup.js
   ```
3. A consolidated JSON file will be generated at:
   `backups/supabase_backup_YYYY-MM-DD.json`

---

## 2. Complete Schema and Data Backup (Using Supabase CLI)
Use this method to dump the full PostgreSQL schema (definitions, triggers, RLS policies) and data records in SQL format. This method **requires** the remote database password.

### Prerequisite:
You must know the remote database password (set during Supabase project creation).

### Step 1: Link the remote project
```bash
npx supabase login
npx supabase link --project-ref ibvehrtierxbqxzqyfgm
```
*(Enter your remote Postgres database password when prompted).*

### Step 2: Dump the Schema (DDL)
```bash
npx supabase db dump --linked --file backups/supabase_schema_backup.sql
```

### Step 3: Dump the Data (DML)
```bash
npx supabase db dump --linked --data-only --file backups/supabase_data_backup.sql
```

---

## 3. Schema Verification & Divergence Check (Alternative if Password is Lost)
If you do not have the database master password to run a CLI schema dump, you can verify if the current remote database structure has diverged from your local [supabase_setup.sql](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/supabase_setup.sql) by executing verification queries using your service key or the SQL Editor.

### 1. Check Table Columns and Constraints
Run the following SQL query to inspect the actual database columns and compare them with [supabase_setup.sql](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/supabase_setup.sql):
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### 2. Check Active Row Level Security (RLS) Policies
Run this query to check if the security policies match the ones declared in the setup script:
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Check Active Database Triggers
Run this query to verify that automation triggers are active:
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

*If all tables, columns, RLS policies, and triggers match the DDL definitions in [supabase_setup.sql](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/supabase_setup.sql), your local setup file serves as the valid structure backup.*
