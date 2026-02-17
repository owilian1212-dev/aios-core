---
name: aios-dev-gotchas
description: "List and search known gotchas (issues and workarounds) from the project's gotchas memory."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/gotchas.md"
command: "*gotchas [options]"
---

# AIOS Task Skill: Task: List Gotchas

## Source of Truth
- Load `.aios-core/development/tasks/gotchas.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Canonical Command
- `*gotchas [options]`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
