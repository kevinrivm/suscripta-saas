# AI_CONTEXT: Suscripta SaaS

**Objective:** AI Agent handoff and context preservation document. Contains the definitive source of truth for the project's current state, tech stack, and roadmap for seamless development continuation.

## 1. Tech Stack & Environment
- **Core Framework:** Next.js 16.1.6 (App Router), React 19.2.3.
- **Language:** TypeScript (`strict: true` via `tsconfig`).
- **Styling:** Tailwind CSS v4 + PostCSS, emphasizing a "Premium" dark mode UI with glass-morphic surfaces, micro-interactions, and emerald/purple accents.
- **Database & Auth:** Supabase (v2.98.0) and `@supabase/ssr` (v0.9.0) using PostgreSQL. Authentication works via Supabase Auth.
- **File Handling & Parsing:** `react-dropzone` (File Upload UX), `papaparse` (CSV ingestion), `xlsx` / SheetJS (Excel ingestion), `libphonenumber-js` (E.164 verification & visual parsing).
- **Environment Variables:** Must use `.env.local` locally for Vercel/Supabase variables. Never commit `.env`.

## 2. Architecture & Data Models
The application relies heavily on **Server Actions** for database operations and Server Components for initial rendering, moving interactivity to isolated Client Components. The Supabase SSR pattern is fully implemented (Server, Middleware, and Client).

**Key Database Tables (`supabase_setup.sql`):**
- `profiles`: Tied logically via triggers to `auth.users`, serving as the primary source of metadata (Company Name, Role) per SaaS Tenant.
- `whatsapp_connections`: Stores Meta credentials (`waba_id`, `access_token`) mapped strictly via RLS to `user_id`.
- `whatsapp_message_events`: Log aggregation for Meta's webhooks. Fully multi-tenant mapped securely via `user_id`.
- `customers`:
  - **Core Schema**: `id` (UUID), `user_id`, `phone_number` (E.164 format), `first_name`, `last_name_1`, `last_name_2`.
  - **Business Schema**: `payment_status` (`'pending'`, `'paid'`, `'overdue'`, `'cancelled'`), `billing_cycle`, `next_payment_date`, `anchor_day` (SMALLINT 1-31).
  - **Lifecycle Schema (Soft Deletes)**: `is_active` (boolean), `inactive_at` (timestamp), `deleted_at` (timestamp).
  - Conflicts handled with `UNIQUE(user_id, phone_number)`.

## 3. Completed Features
- **Project Structure & Security:** Robust Next.js architecture initialized. Server-side middleware route-guarding bounds `/dashboard/*` applying strict SSR authentication.
- **Tenant Auth UI:** Dark-mode native `<SignIn>` and `<SignUp>`.
- **Mass Customer Import Module (`/dashboard/clients`):**
  - Mapped organically under "Clientes" > "Carga Masiva" in the sidebar.
  - Smart E.164 phone sanitization (pre-processing to remove legacy `+521` prefixes, etc.).
  - Automatic country code inference with UI warnings for ambiguous regions.
- **CRM Contact Core (`/dashboard/contacts`):**
  - Robust 7-column layout, sortable via Next.js `searchParams` (`?sort=...&dir=...`).
  - Implements the **"Modelo de Ancla"** for billing cycles:
    - Component `RescheduleDateModal` featuring "Prórroga Única" (shifts only the upcoming payment) vs "Cambio Permanente" (mutates both date and `anchor_day`).
  - Action primitives separated logically into `CycleSelector`, `DateSelector`, `StatusToggleAction`, and `DeleteAction`.
  - Real-time E.164 visual parsing breaking down standard formats cleanly (e.g. `(+52) 551...`).

## 4. Core Business Rules & Constraints
- **WhatsApp Sending Criteria (CRITICAL):** The engine fetching automated reminders **MUST ONLY FETCH** customers whose `payment_status` is explicitly (`'pending'` or `'overdue'`) **AND** evaluate `is_active = true` AND `deleted_at IS NULL`.
- **Billing Cycles Handling:** Cycles coming from imports MUST pass through `CYCLE_NORMALIZE` matching either canonical English (`'monthly'`) or localized Spanish variations (`'mensual'`). Unrecognized values are explicitly driven to blank (`''`) demanding user intervention instead of defaulting to wrong periodicities.
- **Resurrection Logic:** Bulk imports natively restore/resurrect an archived Soft-Deleted client (`deleted_at = null`) if an exact matched E.164 hits standard upsert.
- **Language / Interaction Profile:** Always respond to the end-user natively in **advanced technological Spanish**.

## 5. Active Context & Next Steps
- **Paused At:** Implementation of the "Modelo de Ancla" in the Database (`anchor_day`) + UI (`RescheduleDateModal`), sorting logic in the contacts table, and final verifications of the Supabase `@supabase/ssr` boilerplate integrity.
- **Immediate Next Technical Tasks:**
  - Establishing cron job intervals or scheduling systems to analyze the populated `customers` constraints and pipe the payload iteratively against the Meta integrations.
  - Construction of the custom WhatsApp Template engine mapping `customer` dynamic data nodes to generate notifications.
