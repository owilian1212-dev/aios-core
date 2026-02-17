---
name: aios-dev-build-autonomous
description: "Start an autonomous build loop for a story, executing subtasks with automatic retries and self-critique."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/build-autonomous.md"
command: "*build-autonomous {story-id}"
---

# AIOS Task Skill: Task: Build Autonomous

## Source of Truth
- Load `.aios-core/development/tasks/build-autonomous.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Canonical Command
- `*build-autonomous {story-id}`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
