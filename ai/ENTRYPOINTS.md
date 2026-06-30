# ENTRYPOINTS

## Objective
Enable any agent to quickly understand the technical structure of the project and start working with minimal friction.

## Recommended Reading Order

### 1. AI_CONTEXT.md
High-level system overview, business rules, and current project state.

---

### 2. docs/retake_suscripta.md
Summary of CRM Phase 4 database mutations, server actions (soft-deletes, resurrection), and Meta integration tests recovery.

---

### 3. package.json
Use this file to identify:
- tech stack
- key dependencies
- available tooling

---

### 4. supabase_setup.sql
Defines:
- data model
- multi-tenant structure
- RLS policies
- triggers

Read this file if:
- modifying the database
- understanding data relationships

---

### 5. src/middleware.ts
Defines:
- protected routes
- session handling logic

---

### 6. src/utils/supabase/middleware.ts
Complements:
- Supabase session handling
- cookie management

---

### 7. src/app/actions/auth.ts
Defines:
- authentication flow
- error handling strategy

---

### 8. src/app/actions/customers.ts
Defines:
- core business logic
- customer-related operations

---

### 9. docs/ESTADO_DEL_SISTEMA.md
Provides:
- architectural decisions
- external integrations (WhatsApp, OAuth, Webhooks)

---

## Usage Rules

- Do not assume system behavior without reviewing these files
- Prioritize these files before exploring the rest of the codebase
- Use this map to avoid breaking existing contracts
