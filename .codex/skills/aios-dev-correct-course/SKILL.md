---
name: aios-dev-correct-course
description: "Guide a structured response to a change trigger using the .aios-core/product/checklists/change-checklist.md."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/correct-course.md"
---

# AIOS Task Skill: Correct Course Task

## Source of Truth
- Load `.aios-core/development/tasks/correct-course.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
