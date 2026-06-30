---
name: context-checkpoint
description: Preserve and refresh the project handoff state for long sessions, context degradation, session handoff, agent handoff, or before starting a new conversation. Use when the user asks for a checkpoint, context checkpoint, handoff, session save, project state update, anti-hallucination pause, or wants another Codex/Gemini/Claude/Antigravity agent to resume work safely.
---

# Context Checkpoint

## Overview

Create a reliable continuation point for this project by updating the portable AI handoff documents under `ai/`. This skill is intentionally agent-agnostic: Codex should produce files that another Codex session or another vendor's agent can read to resume the project with minimal drift.

Use this skill as a stopping workflow. Do not continue feature implementation after saving the checkpoint unless the user explicitly asks.

## Source Files

Read these first:

- `ai/README.md`
- `ai/AI_CONTEXT.md`
- `ai/ENTRYPOINTS.md`

Ignore these backup-only paths unless the user explicitly asks to migrate or compare them:

- `ai/rules/`
- `ai/skills/`

## Workflow

1. Pause current implementation work.
2. Review the recent conversation and the current workspace state.
3. Inspect the project structure and key files that define the current implementation:
   - dependency and framework files such as `package.json`, `next.config.ts`, `tsconfig.json`, and config files
   - database/schema files such as `supabase_setup.sql`
   - active docs under `docs/` when they are referenced by `ai/ENTRYPOINTS.md`
   - core app entry points listed in `ai/ENTRYPOINTS.md`
4. Identify what is complete, what changed during the session, what is in progress, and what remains risky or unverified.
5. Update `ai/AI_CONTEXT.md` as the source of truth for continuation.
6. Update `ai/ENTRYPOINTS.md` only if the structure changed materially.
7. Stop and report the checkpoint result.

## `ai/AI_CONTEXT.md` Contract

Overwrite or revise `ai/AI_CONTEXT.md` so it remains current and concise. Preserve this structure:

1. **Tech Stack & Environment:** core languages, frameworks, major libraries, and critical environment requirements.
2. **Architecture & Data Models:** current database schema, API structure, state-management approach, auth/session patterns, and important service boundaries.
3. **Completed Features:** features that are implemented and believed to work; do not claim 100% certainty unless verified in this session.
4. **Core Business Rules & Constraints:** durable project rules, security constraints, edge cases, and product invariants that future agents must not break.
5. **Active Context & Next Steps:** exact stopping point, incomplete work, known verification gaps, and immediate next technical tasks.

Write for handoff quality, not marketing quality. Prefer concrete file paths, commands, and constraints over broad summaries.

## `ai/ENTRYPOINTS.md` Contract

Update `ai/ENTRYPOINTS.md` only when one or more are true:

- new core modules, features, routes, scripts, schemas, or docs were added
- file structure was reorganized or renamed
- new critical entry points were introduced
- existing entry points became stale or misleading

When updating it, keep it navigational. Prioritize the files a new agent should read first and remove stale entries.

## Safety Rules

- Do not alter runtime behavior while checkpointing unless the user explicitly asks.
- Do not modify `.env*`, secrets, credentials, or production data.
- Do not invent completed work. If verification was not run, state that clearly in `Active Context & Next Steps`.
- Do not treat `ai/` as active runtime config. It is portable context and onboarding documentation.
- If Supabase, RLS, auth, or Postgres behavior is material to the checkpoint, also use the relevant Supabase skills before making claims.

## Final Response

After the files are updated, stop any checkpoint-related work and answer exactly:

`Checkpoint saved in ai/AI_CONTEXT.md. Project state is ready for a new session. What would you like to build next?`
