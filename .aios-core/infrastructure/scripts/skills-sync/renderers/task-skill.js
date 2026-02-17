'use strict';

const { trimText } = require('./agent-skill');

function getTaskSkillId(taskId) {
  const id = String(taskId || '').trim().replace(/^aios-task-/, '');
  return `aios-task-${id}`;
}

function buildTaskSkillContent(taskSpec) {
  const skillId = getTaskSkillId(taskSpec.id);
  const title = taskSpec.title || taskSpec.id;
  const summary = trimText(
    taskSpec.summary || `Reusable AIOS task workflow skill for ${taskSpec.id}.`,
    180,
  );
  const interactionNote = taskSpec.elicit
    ? '- This task requires user interaction points (`elicit=true`). Do not skip them.'
    : '- Execute non-interactive flow unless blocked by missing context.';

  return `---
name: ${skillId}
description: ${summary}
---

# AIOS Task Skill: ${title}

## Source of Truth
- Load \`.aios-core/development/tasks/${taskSpec.filename}\`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
${interactionNote}

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
`;
}

module.exports = {
  getTaskSkillId,
  buildTaskSkillContent,
};
