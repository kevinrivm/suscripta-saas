# Suscripta SaaS Project Instructions

This file contains build/test commands and code style guidelines for Codex and other OpenAI agents working in this repository.

## Build and Development Commands

- Run development server: `npm run dev`
- Build production bundle: `npm run build`
- Run linter: `npm run lint`
- Type check: `npx tsc --noEmit`

## Code Style and Architecture Guidelines

- Architecture: use Next.js 16 App Router. Prefer Server Components for initial rendering and Server Actions under `src/app/actions/` for data mutations. Isolate Client Components and declare them with `'use client'`.
- TypeScript: keep strict type checking. Declare interfaces and types explicitly. Avoid `any` and do not bypass TypeScript compiler checks.
- Imports: use the `@/` path alias for internal imports, for example `@/actions/customers` or `@/components/ui/modal`.
- Supabase and database security: preserve strict multi-tenant architecture. Every table in the `public` schema must enforce Row Level Security policies that map resources to `auth.uid()`.
- Client/database boundary: never perform direct database operations from Client Components. Use Server Actions or Next.js Route Handlers.
- Phone data: validate and store all user phone numbers strictly in international E.164 format, for example `+521234567890`, using `libphonenumber-js`.
- Styling: use Tailwind CSS v4 plus PostCSS. Preserve the curated emerald/purple accents and glass-morphic dark surfaces for UI consistency.

## Project Context

- For current project state and handoff context, read `ai/AI_CONTEXT.md`.
- For the recommended technical reading order, read `ai/ENTRYPOINTS.md`.
- Treat `ai/rules/` and `ai/skills/` as portable backups unless the user explicitly asks to migrate or compare them.
