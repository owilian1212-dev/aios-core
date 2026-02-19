/**
 * L8 Knowledge Brief Layer Processor
 *
 * Injects knowledge briefs for the active agent before session activation.
 * Reads the L8 knowledge queue (.synapse/l8-knowledge-queue.json) and
 * injects pending briefs for the current agent as contextual rules.
 *
 * This layer is non-blocking: if no queue exists or agent has no pending
 * briefs, it returns null and the pipeline continues normally.
 *
 * @module core/synapse/layers/l8-knowledge
 * @version 1.0.0
 * @created Story KNW-1 - Knowledge Monitor Agent (@knowledge-monitor / Sage)
 */

const fs   = require('fs');
const path = require('path');
const LayerProcessor = require('./layer-processor');

/**
 * Maximum number of brief rules to inject per session to avoid token bloat.
 * Briefs are truncated to this length.
 */
const MAX_BRIEF_CHARS = 3000;

/**
 * L8 Knowledge Brief Processor
 *
 * Fires when an agent is active in the session and there are
 * knowledge briefs queued for that agent.
 *
 * @extends LayerProcessor
 */
class L8KnowledgeProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'knowledge', layer: 8, timeout: 20 });
  }

  /**
   * Inject knowledge brief rules for the active agent.
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt
   * @param {object} context.session - Session state
   * @param {object} context.config - Config with synapsePath
   * @returns {{ rules: string[], metadata: object } | null}
   */
  process(context) {
    const { session, config } = context;
    const { synapsePath } = config;

    if (!synapsePath) return null;

    // Detect active agent from session
    const activeAgent = this._detectAgent(session, context.prompt);
    if (!activeAgent) return null;

    // Load the L8 queue file
    const queuePath = path.join(synapsePath, 'l8-knowledge-queue.json');
    const queue = this._loadQueue(queuePath);
    if (!queue || queue.length === 0) return null;

    // Filter entries for this agent that haven't expired
    const now = new Date();
    const relevant = queue.filter(entry => {
      if (entry.agent !== activeAgent) return false;
      if (entry.expiresAt && new Date(entry.expiresAt) < now) return false;
      return true;
    });

    if (relevant.length === 0) return null;

    // Load brief content
    const rules = [];
    const loadedBriefs = [];

    for (const entry of relevant) {
      if (!entry.briefPath) continue;

      // Resolve brief path (relative to PROJECT_ROOT or absolute)
      const briefPath = path.isAbsolute(entry.briefPath)
        ? entry.briefPath
        : path.join(synapsePath, '..', '..', entry.briefPath);

      const content = this._loadBrief(briefPath);
      if (!content) continue;

      const truncated = content.length > MAX_BRIEF_CHARS
        ? content.slice(0, MAX_BRIEF_CHARS) + '\n...[brief truncado — leia o arquivo completo se necessário]'
        : content;

      rules.push(`[KNOWLEDGE BRIEF para @${activeAgent}]`);
      rules.push(truncated);
      loadedBriefs.push(path.basename(briefPath));
    }

    if (rules.length === 0) return null;

    // Add footer instruction
    rules.push(
      `[/KNOWLEDGE BRIEF] Consulte as lacunas listadas antes de tomar decisões nestes domínios.`,
    );

    return {
      rules,
      metadata: {
        layer: 8,
        agent: activeAgent,
        briefs: loadedBriefs,
        count: loadedBriefs.length,
      },
    };
  }

  /**
   * Detect the active agent from session state or prompt context.
   *
   * @param {object} session - Session state
   * @param {string} prompt - Current prompt text
   * @returns {string|null} Agent name (e.g., "dev") or null
   * @private
   */
  _detectAgent(session, prompt) {
    // From session state (standard AIOS session schema)
    if (session && session.activeAgent) return session.activeAgent;
    if (session && session.active_agent) return session.active_agent;

    // From prompt: detect @agent-name patterns
    if (prompt) {
      const match = prompt.match(/@([a-z][\w-]*)/);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Load and parse the L8 knowledge queue JSON file.
   *
   * @param {string} queuePath - Absolute path to queue file
   * @returns {Array|null} Queue entries or null if unavailable
   * @private
   */
  _loadQueue(queuePath) {
    try {
      if (!fs.existsSync(queuePath)) return null;
      const raw = fs.readFileSync(queuePath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (parsed.queue || null);
    } catch (_) {
      return null;
    }
  }

  /**
   * Load knowledge brief file content.
   *
   * @param {string} briefPath - Absolute path to brief file
   * @returns {string|null} Brief content or null if unavailable
   * @private
   */
  _loadBrief(briefPath) {
    try {
      if (!fs.existsSync(briefPath)) return null;
      return fs.readFileSync(briefPath, 'utf8');
    } catch (_) {
      return null;
    }
  }
}

module.exports = L8KnowledgeProcessor;
