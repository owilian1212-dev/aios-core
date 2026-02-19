#!/usr/bin/env node
/**
 * Claude Code Hook: PreCompact Low-Token Backup
 *
 * Fires automatically when Claude Code's context window is nearly full.
 * Triggers session backup (report + git push) to preserve work.
 *
 * TOKEN MARGIN:
 *   Context window: 200,000 tokens
 *   This hook fires at: ~185,000+ tokens used (15,000 remaining)
 *   Procedure cost:     ~9,800 tokens (see runner for breakdown)
 *   Safety buffer:      ~5,200 tokens
 *
 * Registration: Claude Code auto-discovers hooks in .claude/hooks/
 * Event: PreCompact
 *
 * @see .aios-core/hooks/unified/runners/low-token-backup-runner.js
 */

'use strict';

const path = require('path');

const PROJECT_ROOT  = path.resolve(__dirname, '..', '..');
const runnerPath    = path.join(
  PROJECT_ROOT,
  '.aios-core', 'hooks', 'unified', 'runners', 'low-token-backup-runner.js',
);

try {
  const { onPreCompact } = require(runnerPath);

  module.exports = async (context) => {
    return await onPreCompact({ ...context, provider: 'claude' });
  };
} catch (error) {
  console.error('[PreCompact-LowToken] Failed to load runner:', error.message);

  // Graceful degradation
  module.exports = async () => {
    console.log('[PreCompact-LowToken] Runner unavailable, skipping backup');
  };
}
