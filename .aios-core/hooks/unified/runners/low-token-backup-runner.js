/**
 * Low-Token Backup Runner — PreCompact Safety Hook
 *
 * Fires when context window approaches its limit (PreCompact event).
 * Delegates to session-backup.js to generate report + push to GitHub.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │              TOKEN MARGIN CALCULATION                           │
 * │                                                                 │
 * │  IDE         Context Window   Trigger Threshold   Headroom      │
 * │  ─────────   ─────────────    ─────────────────   ───────────   │
 * │  Claude      200,000 tokens   ≥ 185,000 used      15,000 left   │
 * │  Gemini      1,000,000 tok.   ≥ 985,000 used      15,000 left   │
 * │  Codex        128,000 tokens  ≥ 108,000 used      20,000 left   │
 * │                                                                 │
 * │  Procedure cost breakdown (worst case):                         │
 * │  - LLM reasoning / planning:          ~2,000 tokens            │
 * │  - Session report generation:         ~1,500 tokens            │
 * │  - Tool call overhead (×10 calls):    ~1,500 tokens            │
 * │  - Git add/commit/push execution:     ~  800 tokens            │
 * │  - User warning message:              ~  300 tokens            │
 * │  - Error handling buffer (1 retry):   ~2,000 tokens            │
 * │  - Safety margin (20%):              ~1,700 tokens            │
 * │  ─────────────────────────────────────────────────────────────  │
 * │  TOTAL REQUIRED:                      ~9,800 tokens            │
 * │  RECOMMENDED THRESHOLD:              10,000 tokens (rounded)   │
 * │  CONFIGURED THRESHOLD:               15,000 tokens (50% buf)  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * @module .aios-core/hooks/unified/runners/low-token-backup-runner
 */

'use strict';

const path   = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT  = path.resolve(__dirname, '..', '..', '..', '..');
const BACKUP_SCRIPT = path.join(PROJECT_ROOT, '.aios-core', 'scripts', 'session-backup.js');

/**
 * Token thresholds per provider.
 * Values represent tokens REMAINING (not used).
 */
const TOKEN_THRESHOLDS = {
  claude: 15_000,
  gemini: 15_000,
  codex:  20_000,
  default: 15_000,
};

/**
 * Detect provider from environment or context.
 * @param {object} context - Hook context
 * @returns {string}
 */
function detectProvider(context) {
  if (context?.provider)                    return context.provider.toLowerCase();
  if (process.env.GEMINI_SESSION_ID)        return 'gemini';
  if (process.env.CODEX_SESSION_ID)         return 'codex';
  if (process.env.CLAUDE_CODE_SESSION_ID)   return 'claude';
  return 'unknown';
}

/**
 * Run the session backup script as a child process.
 * @param {string} provider
 * @param {string} reason
 */
function runBackup(provider, reason) {
  try {
    execSync(
      `node "${BACKUP_SCRIPT}" --provider=${provider} --reason=${reason}`,
      { cwd: PROJECT_ROOT, stdio: 'inherit', timeout: 30_000 },
    );
  } catch (err) {
    // Silent failure — never block the user
    console.error('[low-token-backup] Backup script failed:', err.message);
  }
}

/**
 * PreCompact hook handler.
 *
 * Called by Claude Code when the context window is nearly full.
 * Always runs the backup since PreCompact = context limit reached.
 *
 * @param {object} context - Claude Code hook context
 * @param {string} context.sessionId
 * @param {string} context.projectDir
 * @param {string} [context.provider]
 */
async function onPreCompact(context) {
  const provider = detectProvider(context);

  console.log(`[low-token-backup] PreCompact triggered — provider: ${provider}`);
  console.log(`[low-token-backup] Threshold: ${TOKEN_THRESHOLDS[provider] ?? TOKEN_THRESHOLDS.default} tokens`);

  // Fire-and-forget: don't block the compact operation
  setImmediate(() => {
    runBackup(provider, 'precompact');
  });
}

/**
 * Manual trigger — call this from any IDE agent when you estimate
 * you're within TOKEN_THRESHOLDS tokens of the context limit.
 *
 * @param {string} provider - 'claude' | 'gemini' | 'codex'
 */
async function onManualTrigger(provider = 'unknown') {
  console.log(`[low-token-backup] Manual trigger — provider: ${provider}`);
  runBackup(provider, 'manual');
}

/**
 * Check if remaining tokens are below threshold.
 * Used by IDEs that expose token count via environment variables.
 *
 * @param {number} tokensRemaining
 * @param {string} provider
 * @returns {boolean}
 */
function isBelowThreshold(tokensRemaining, provider = 'default') {
  const threshold = TOKEN_THRESHOLDS[provider] ?? TOKEN_THRESHOLDS.default;
  return tokensRemaining <= threshold;
}

/**
 * Get hook configuration for registration.
 * @returns {object}
 */
function getHookConfig() {
  return {
    name:    'low-token-backup',
    event:   'PreCompact',
    handler: onPreCompact,
    timeout: 5_000, // Fire-and-forget — returns immediately
    description: 'Backup session before context limit is reached',
    tokenThresholds: TOKEN_THRESHOLDS,
  };
}

module.exports = {
  onPreCompact,
  onManualTrigger,
  isBelowThreshold,
  getHookConfig,
  TOKEN_THRESHOLDS,
};
