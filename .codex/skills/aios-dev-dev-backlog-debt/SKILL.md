---
name: aios-dev-dev-backlog-debt
description: "Register technical debt item to backlog"
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/dev-backlog-debt.md"
command: "*backlog-debt"
---

# AIOS Task Skill: Dev Task: Register Technical Debt

## Source of Truth
- Load `.aios-core/development/tasks/dev-backlog-debt.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- This task requires user interaction points (`elicit=true`). Do not skip them.

## Canonical Command
- `*backlog-debt`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
