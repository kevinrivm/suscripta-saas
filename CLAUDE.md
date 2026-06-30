# CLAUDE.md (SaaS Suscripta)

This file contains build/test commands and code style guidelines for this repository.

## Build and Development Commands

*   **Run Development Server:** `npm run dev`
*   **Build Production Bundle:** `npm run build`
*   **Run Linter (ESLint):** `npm run lint`
*   **Type Check (TypeScript):** `npx tsc --noEmit`

---

## Code Style & Architecture Guidelines

*   **Architecture:** Next.js 16 (App Router) utilizing Server Components for initial rendering and Server Actions (`src/app/actions/`) for data mutations. Client Components must be isolated and declared with `'use client'`.
*   **TypeScript:** Strict type checking. Declare interfaces/types explicitly. Avoid using `any` or bypassing typescript compiler checks.
*   **Imports:** Use path alias `@/` for imports (e.g. `@/actions/customers`, `@/components/ui/modal`).
*   **Database & Security (Supabase):**
    *   Strict multi-tenant architecture: every table in the `public` schema must enforce Row Level Security (RLS) policies mapping resources to `auth.uid()`.
    *   Never perform direct DB operations from client components; utilize Server Actions or Next.js Route Handlers.
*   **Data Validation:**
    *   All user phone numbers must be validated and stored strictly in the international **E.164** format (e.g. `+521234567890`) utilizing `libphonenumber-js`.
*   **Styling:** Tailwind CSS v4 + PostCSS. Stick to the curated emerald/purple accents and glass-morphic dark surfaces for UI consistency.
