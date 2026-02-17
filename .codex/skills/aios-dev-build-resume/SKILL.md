---
name: aios-dev-build-resume
description: "Resume an autonomous build from its last checkpoint after failure or interruption."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/build-resume.md"
command: "*build-resume {story-id}"
---

# AIOS Task Skill: Task: Build Resume

## Source of Truth
- Load `.aios-core/development/tasks/build-resume.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Canonical Command
- `*build-resume {story-id}`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
