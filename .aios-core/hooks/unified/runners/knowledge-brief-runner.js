/**
 * Knowledge Brief Runner — Pre-Agent Activation Hook
 *
 * Fires before an agent is activated. Checks if the agent has
 * pending knowledge gaps and optionally blocks activation for
 * critical gaps (score < 0.30).
 *
 * Integration points:
 *   - Claude Code: UserPromptSubmit hook (detects @agent patterns)
 *   - Gemini CLI:  pre-agent.js hook
 *   - Codex CLI:   manual check in AGENTS.md
 *
 * Non-blocking mode (default): warns but does not prevent activation.
 * Blocking mode (KNOWLEDGE_GAPS_BLOCK=true): prevents activation until
 * critical gaps are resolved via `*acquire`.
 *
 * @module .aios-core/hooks/unified/runners/knowledge-brief-runner
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DATA_DIR     = path.join(PROJECT_ROOT, '.aios-core', 'data');

const PROFILES_PATH = path.join(DATA_DIR, 'agent-knowledge-profiles.yaml');
const GAPS_PATH     = path.join(DATA_DIR, 'knowledge-gaps.yaml');
const BRIEFS_DIR    = path.join(DATA_DIR, 'knowledge-briefs');
const QUEUE_PATH    = path.join(PROJECT_ROOT, '.synapse', 'l8-knowledge-queue.json');

/** Whether critical gaps block agent activation entirely. */
const BLOCKING_MODE = process.env.KNOWLEDGE_GAPS_BLOCK === 'true';

/**
 * Load and return knowledge profile for an agent.
 * @param {string} agentName
 * @returns {{ domains: object, persona: string } | null}
 */
function loadAgentProfile(agentName) {
  try {
    if (!fs.existsSync(PROFILES_PATH)) return null;
    const content = fs.readFileSync(PROFILES_PATH, 'utf8');

    // Find the agent block in YAML (simple regex-based extraction)
    const agentPattern = new RegExp(
      `^${agentName}:\\s*\\n((?:  .+\\n?)*)`, 'm',
    );
    const match = content.match(agentPattern);
    if (!match) return null;

    // Extract domain scores from the block
    const block = match[1];
    const domains = {};
    const domainBlocks = block.split(/(?=    [a-z][\w-]+:\s*\n)/);

    for (const domBlock of domainBlocks) {
      const nameMatch = domBlock.match(/^\s{4}([a-z][\w-]+):\s*\n/m);
      const scoreMatch = domBlock.match(/score:\s*([\d.]+)/);
      if (nameMatch && scoreMatch) {
        domains[nameMatch[1]] = parseFloat(scoreMatch[1]);
      }
    }

    return { domains, agentName };
  } catch (_) {
    return null;
  }
}

/**
 * Get pending critical gaps for an agent.
 * @param {string} agentName
 * @returns {Array<{ id: string, domain: string, score: number, severity: string }>}
 */
function getCriticalGaps(agentName) {
  try {
    if (!fs.existsSync(GAPS_PATH)) return [];
    const content = fs.readFileSync(GAPS_PATH, 'utf8');

    const gaps = [];
    // Simple YAML block extraction
    const gapPattern = /- id: (KG-\d+)\n((?:    .+\n?)*)/g;
    let match;

    while ((match = gapPattern.exec(content)) !== null) {
      const block = match[2];
      const agentMatch = block.match(/agent: ([^\n]+)/);
      const domainMatch = block.match(/domain: ([^\n]+)/);
      const severityMatch = block.match(/severity: ([^\n]+)/);
      const scoreMatch = block.match(/score: ([\d.]+)/);
      const statusMatch = block.match(/status: ([^\n]+)/);

      if (
        agentMatch &&
        agentMatch[1].trim() === agentName &&
        statusMatch &&
        statusMatch[1].trim() === 'pending' &&
        severityMatch &&
        severityMatch[1].trim() === 'critical'
      ) {
        gaps.push({
          id:       match[1],
          domain:   domainMatch ? domainMatch[1].trim() : 'unknown',
          score:    scoreMatch ? parseFloat(scoreMatch[1]) : 0,
          severity: severityMatch ? severityMatch[1].trim() : 'unknown',
        });
      }
    }

    return gaps;
  } catch (_) {
    return [];
  }
}

/**
 * Find the most recent knowledge brief for an agent.
 * @param {string} agentName
 * @returns {string|null} Path to the brief file or null
 */
function findLatestBrief(agentName) {
  try {
    if (!fs.existsSync(BRIEFS_DIR)) return null;
    const files = fs.readdirSync(BRIEFS_DIR)
      .filter(f => f.startsWith(`${agentName}-`) && f.endsWith('.md'))
      .sort()
      .reverse();
    return files.length > 0 ? path.join(BRIEFS_DIR, files[0]) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Enqueue a brief into the Synapse L8 knowledge queue.
 * @param {string} agentName
 * @param {string} briefPath
 */
function enqueueBrief(agentName, briefPath) {
  try {
    const queue = fs.existsSync(QUEUE_PATH)
      ? JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
      : [];

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Remove stale entries for the same agent
    const filtered = Array.isArray(queue)
      ? queue.filter(e => e.agent !== agentName)
      : [];

    filtered.push({
      agent:       agentName,
      briefPath:   path.relative(PROJECT_ROOT, briefPath),
      priority:    'pre-activation',
      enqueuedAt:  new Date().toISOString(),
      expiresAt,
    });

    fs.writeFileSync(QUEUE_PATH, JSON.stringify(filtered, null, 2), 'utf8');
  } catch (_) {
    // Non-blocking: queue failure should never prevent activation
  }
}

/**
 * Pre-agent activation check.
 *
 * Called when a @agent pattern is detected in the user prompt.
 * Returns a warning message (and optionally blocks) based on knowledge state.
 *
 * @param {string} agentName - Agent being activated (e.g., "dev")
 * @param {object} [options]
 * @param {boolean} [options.silent=false] - Suppress console output
 * @returns {{
 *   allowed: boolean,
 *   warnings: string[],
 *   criticalGaps: Array,
 *   briefPath: string|null
 * }}
 */
function checkBeforeActivation(agentName, options = {}) {
  const { silent = false } = options;

  const result = {
    allowed:      true,
    warnings:     [],
    criticalGaps: [],
    briefPath:    null,
  };

  // 1. Load profile
  const profile = loadAgentProfile(agentName);
  if (!profile) {
    result.warnings.push(`⚠️ @${agentName}: perfil de conhecimento não encontrado`);
    return result;
  }

  // 2. Check for critical gaps
  const criticalGaps = getCriticalGaps(agentName);
  result.criticalGaps = criticalGaps;

  if (criticalGaps.length > 0) {
    const domains = criticalGaps.map(g => g.domain).join(', ');
    result.warnings.push(
      `⚠️ @${agentName} possui ${criticalGaps.length} gap(s) crítico(s) [score < 0.30]:`,
      `   Domínios: ${domains}`,
      `   Execute: *acquire ${agentName} ${criticalGaps[0].domain}`,
      `   Ou ative com conhecimento limitado: *knowledge-brief ${agentName}`,
    );

    if (BLOCKING_MODE) {
      result.allowed = false;
      result.warnings.push(`🛑 BLOQUEADO (KNOWLEDGE_GAPS_BLOCK=true): resolva os gaps críticos antes de ativar.`);
    }
  }

  // 3. Find and queue available brief
  const briefPath = findLatestBrief(agentName);
  result.briefPath = briefPath;

  if (briefPath) {
    enqueueBrief(agentName, briefPath);
    result.warnings.push(`📚 Brief injetado via Synapse L8: ${path.basename(briefPath)}`);
  }

  // 4. Console output
  if (!silent && result.warnings.length > 0) {
    console.log('\n[knowledge-brief-runner]');
    result.warnings.forEach(w => console.log(w));
    console.log('');
  }

  return result;
}

/**
 * UserPromptSubmit hook handler.
 * Detects @agent patterns in the prompt and runs pre-activation check.
 *
 * @param {object} context - Hook context
 * @param {string} context.prompt - User prompt text
 * @returns {{ continueWithOutput?: string } | undefined}
 */
function onUserPromptSubmit(context) {
  const { prompt } = context;
  if (!prompt) return;

  // Detect @agent-name patterns (e.g., @dev, @architect)
  const agentMatches = [...prompt.matchAll(/@([a-z][\w-]*)/g)];
  if (agentMatches.length === 0) return;

  const agentName = agentMatches[0][1];
  const result = checkBeforeActivation(agentName, { silent: false });

  if (!result.allowed) {
    // Return blocking message as continueWithOutput to inject into conversation
    return {
      continueWithOutput: result.warnings.join('\n'),
    };
  }
}

module.exports = {
  checkBeforeActivation,
  onUserPromptSubmit,
  getCriticalGaps,
  loadAgentProfile,
  findLatestBrief,
  enqueueBrief,
};
