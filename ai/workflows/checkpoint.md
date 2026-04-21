---
description: Forces the AI agent to pause, deeply analyze the current state of the project, and update the ai/AI_CONTEXT.md file. This prevents context degradation, hallucinations, and ensures seamless handoffs.
---

# Context Checkpoint Workflow

**Objective:** Stop current tasks, analyze the workspace, and update the project's cognitive state. This includes maintaining `ai/AI_CONTEXT.md` as the source of truth and updating `ai/ENTRYPOINTS.md` when structural changes occur.

---

## Step 1: Workspace & State Analysis

- Review the recent conversation history to understand the latest changes.
- Analyze the project structure, dependency files (e.g., `package.json`, `requirements.txt`, `pom.xml`), and key configuration files.
- Inspect the current state of the database schemas or data models, if applicable.
- Identify which features are fully functional and which are currently in progress.
- Detect any structural changes in the project (new modules, renamed folders, architectural shifts).

---

## Step 2: Update `ai/AI_CONTEXT.md`

Create or overwrite the `ai/AI_CONTEXT.md` file. You must strictly follow this structure:

1. **Tech Stack & Environment:** Core languages, frameworks, major libraries, and critical environmental configurations.
2. **Architecture & Data Models:** Current state of the database schema, API structure, or state management architecture.
3. **Completed Features:** A concise list of modules/features that are currently working at 100% without errors.
4. **Core Business Rules & Constraints:** Crucial architectural decisions, edge cases handled, and specific instructions that dictate how the system must behave.
5. **Active Context & Next Steps:** The exact point where the development paused and the immediate next technical tasks required to move forward.

---

## Step 3: Conditionally Update `ai/ENTRYPOINTS.md`

Evaluate whether the project structure has changed significantly.

Update `ai/ENTRYPOINTS.md` ONLY if one or more of the following conditions are met:

- New core modules, features, or directories were added
- File structure was reorganized or renamed
- New critical entry points (APIs, services, flows) were introduced
- Existing entry points are no longer valid

When updating:

- Keep it concise and navigational (not descriptive)
- Prioritize files that a new agent must read first
- Remove outdated or irrelevant entry points

---

## Step 4: Confirmation & Halt

- Once updates are complete, STOP all other background processes or coding tasks.
- Respond to the user with exactly this message:

*"✅ Checkpoint successfully saved in `ai/AI_CONTEXT.md`. Your project state is secure. What would you like to build next?"*
