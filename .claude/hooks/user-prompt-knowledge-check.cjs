#!/usr/bin/env node
/**
 * Claude Code Hook: UserPromptSubmit — Knowledge Gap Check
 *
 * Fires before each user prompt is processed.
 * Detects @agent activation patterns and checks for critical knowledge gaps.
 *
 * Behavior:
 *   - If @agent-name detected AND agent has critical gaps → warn user
 *   - If latest brief exists → enqueue it in Synapse L8 queue for injection
 *   - Non-blocking by default (KNOWLEDGE_GAPS_BLOCK=true to enable blocking)
 *
 * Registration: Claude Code auto-discovers hooks in .claude/hooks/
 * Event: UserPromptSubmit
 *
 * @see .aios-core/hooks/unified/runners/knowledge-brief-runner.js
 */

'use strict';

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const runnerPath   = path.join(
  PROJECT_ROOT,
  '.aios-core', 'hooks', 'unified', 'runners', 'knowledge-brief-runner.js',
);

try {
  const { onUserPromptSubmit } = require(runnerPath);

  module.exports = async (context) => {
    return await onUserPromptSubmit(context);
  };
} catch (error) {
  // Graceful degradation: never block user prompts on runner failure
  module.exports = async () => undefined;
}
