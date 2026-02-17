---
name: aios-master-test-as-user
description: "Emulate authenticated user for RLS policy testing"
owner: "master"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/test-as-user.md"
---

# AIOS Task Skill: Task: Test As User (RLS Testing)

## Source of Truth
- Load `.aios-core/development/tasks/test-as-user.md`.
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
