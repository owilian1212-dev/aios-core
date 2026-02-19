/**
 * Score Engine — Knowledge Proficiency Calculator
 *
 * Computes knowledge proficiency scores (0.0–1.0) for agents
 * based on evidence from entity-registry, gotchas, briefs, and stories.
 *
 * Score scale:
 *   0.00–0.30 → critical (acquisition mandatory)
 *   0.30–0.60 → gap (brief required)
 *   0.60–0.80 → adequate
 *   0.80–1.00 → proficient/expert
 *
 * @module core/knowledge/score-engine
 * @version 1.0.0
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT  = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR      = path.join(PROJECT_ROOT, '.aios-core', 'data');
const DOCS_DIR      = path.join(PROJECT_ROOT, 'docs', 'stories');
const GOTCHAS_PATH  = path.join(PROJECT_ROOT, '.aios', 'gotchas.json');
const REGISTRY_PATH = path.join(DATA_DIR, 'entity-registry.yaml');
const BRIEFS_DIR    = path.join(DATA_DIR, 'knowledge-briefs');

// ─── Thresholds ─────────────────────────────────────────────────────────────

const THRESHOLDS = {
  critical: 0.30,
  gap:      0.60,
  expert:   0.80,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Load JSON file safely.
 * @param {string} filePath
 * @returns {any} Parsed JSON or null
 */
function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) { return null; }
}

/**
 * Load text file safely.
 * @param {string} filePath
 * @returns {string|null}
 */
function safeReadText(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) { return null; }
}

// ─── Evidence Collectors ────────────────────────────────────────────────────

/**
 * Check if domain is covered in entity-registry.yaml.
 * @param {string} domain - Domain identifier (e.g., "security-owasp")
 * @returns {{ covered: boolean, depth: number }} Coverage info
 */
function checkEntityRegistry(domain) {
  const content = safeReadText(REGISTRY_PATH);
  if (!content) return { covered: false, depth: 0 };

  const keywords = domain.split('-');
  let matches = 0;

  for (const kw of keywords) {
    const pattern = new RegExp(kw, 'gi');
    const found = (content.match(pattern) || []).length;
    matches += Math.min(found, 5); // cap per keyword
  }

  return {
    covered: matches >= 3,
    depth:   matches,
  };
}

/**
 * Count gotchas related to domain for an agent.
 * @param {string} agentName
 * @param {string} domain
 * @returns {number} Number of relevant gotchas
 */
function countGotchas(agentName, domain) {
  const gotchas = safeReadJson(GOTCHAS_PATH);
  if (!Array.isArray(gotchas)) return 0;

  const keywords = domain.split('-');
  return gotchas.filter(g => {
    const text = JSON.stringify(g).toLowerCase();
    return keywords.some(kw => text.includes(kw));
  }).length;
}

/**
 * Count completed stories involving agent and domain.
 * @param {string} agentName
 * @param {string} domain
 * @returns {number}
 */
function countCompletedStories(agentName, domain) {
  try {
    const completedDir = path.join(DOCS_DIR, 'completed');
    if (!fs.existsSync(completedDir)) return 0;

    const files = fs.readdirSync(completedDir).filter(f => f.endsWith('.md'));
    const keywords = domain.split('-');
    let count = 0;

    for (const file of files) {
      const content = safeReadText(path.join(completedDir, file));
      if (!content) continue;
      const hasAgent = content.toLowerCase().includes(`@${agentName}`);
      const hasDomain = keywords.some(kw => content.toLowerCase().includes(kw));
      if (hasAgent && hasDomain) count++;
    }

    return count;
  } catch (_) { return 0; }
}

/**
 * Check if a knowledge brief exists for agent/domain.
 * @param {string} agentName
 * @param {string} domain
 * @returns {boolean}
 */
function hasBrief(agentName, domain) {
  try {
    if (!fs.existsSync(BRIEFS_DIR)) return false;
    const files = fs.readdirSync(BRIEFS_DIR);
    return files.some(f => f.startsWith(`${agentName}-`) && f.includes(domain));
  } catch (_) { return false; }
}

/**
 * Calculate staleness penalty based on lastUpdated date.
 * @param {string|null} lastUpdated - ISO date string
 * @returns {number} Penalty value (negative)
 */
function calculateStalenessPenalty(lastUpdated) {
  if (!lastUpdated) return 0; // never assessed — no staleness penalty (no score to penalize)
  const days = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  if (days > 90) return -0.15;
  if (days > 30) return -0.05;
  return 0;
}

// ─── Score Calculator ────────────────────────────────────────────────────────

/**
 * Compute evidence-based proficiency score for agent/domain.
 *
 * @param {string} agentName - e.g., "dev"
 * @param {string} domain - e.g., "security-owasp"
 * @param {object} [hints] - Optional hints to skip expensive lookups
 * @param {string|null} [hints.lastUpdated] - Existing lastUpdated date
 * @returns {{
 *   score: number,
 *   evidence: object,
 *   descriptor: string,
 *   severity: string
 * }}
 */
function computeScore(agentName, domain, hints = {}) {
  const evidence = {
    entityRegistry: checkEntityRegistry(domain),
    gotchasCount:   countGotchas(agentName, domain),
    storiesCount:   countCompletedStories(agentName, domain),
    hasBrief:       hasBrief(agentName, domain),
    staleness:      calculateStalenessPenalty(hints.lastUpdated || null),
  };

  let score = 0;

  // Entity registry coverage
  if (evidence.entityRegistry.covered) score += 0.20;
  if (evidence.entityRegistry.depth >= 10) score += 0.15; // deep coverage

  // Gotchas (learned from mistakes)
  if (evidence.gotchasCount > 0)  score += 0.10;

  // Knowledge brief exists
  if (evidence.hasBrief) score += 0.15;

  // Completed stories (practical experience)
  if (evidence.storiesCount >= 1) score += 0.10;
  if (evidence.storiesCount >= 3) score += 0.10; // bonus

  // Staleness penalty
  score += evidence.staleness;

  // Bounds
  score = Math.max(0, Math.min(1.0, score));

  // Confidence cap: can't be > 0.55 with no lastUpdated AND score > 0.60
  if (!hints.lastUpdated && score > 0.60) score = 0.55;

  const descriptor = getDescriptor(score);
  const severity = getSeverity(score);

  return { score: parseFloat(score.toFixed(2)), evidence, descriptor, severity };
}

/**
 * Get human-readable descriptor for score.
 * @param {number} score
 * @returns {string}
 */
function getDescriptor(score) {
  if (score >= 0.90) return 'Expert';
  if (score >= 0.80) return 'Proficiente';
  if (score >= 0.70) return 'Adequado';
  if (score >= 0.60) return 'Aceitável';
  if (score >= 0.45) return 'Lacuna';
  if (score >= 0.30) return 'Lacuna significativa';
  if (score >= 0.10) return 'Crítico';
  return 'Desconhecido';
}

/**
 * Get severity classification for score.
 * @param {number} score
 * @returns {string} "critical" | "high" | "medium" | "ok"
 */
function getSeverity(score) {
  if (score < THRESHOLDS.critical) return 'critical';
  if (score < 0.50)                return 'high';
  if (score < THRESHOLDS.gap)      return 'medium';
  return 'ok';
}

/**
 * Compute scores for all domains of an agent.
 * @param {string} agentName
 * @param {object} currentProfile - Current domains from profiles YAML
 * @returns {object} Map of domain → score result
 */
function computeAllScores(agentName, currentProfile) {
  const results = {};
  const domains = currentProfile.domains || {};

  for (const [domain, info] of Object.entries(domains)) {
    results[domain] = computeScore(agentName, domain, {
      lastUpdated: info.lastUpdated || null,
    });
  }

  return results;
}

module.exports = {
  computeScore,
  computeAllScores,
  checkEntityRegistry,
  countGotchas,
  countCompletedStories,
  hasBrief,
  calculateStalenessPenalty,
  getDescriptor,
  getSeverity,
  THRESHOLDS,
};
