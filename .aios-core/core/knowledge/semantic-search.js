/**
 * Semantic Search — Knowledge Base Query Engine
 *
 * Provides keyword-based semantic search across all AIOS knowledge sources:
 *   - Entity Registry (508+ entities)
 *   - Knowledge Briefs
 *   - Gotchas Memory
 *   - Learned Patterns
 *   - Agent Profiles
 *
 * Uses TF-IDF-inspired relevance scoring without external dependencies.
 * Designed for fast in-process queries (< 50ms for most searches).
 *
 * @module core/knowledge/semantic-search
 * @version 1.0.0
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT  = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR      = path.join(PROJECT_ROOT, '.aios-core', 'data');
const REGISTRY_PATH = path.join(DATA_DIR, 'entity-registry.yaml');
const BRIEFS_DIR    = path.join(DATA_DIR, 'knowledge-briefs');
const GOTCHAS_PATH  = path.join(PROJECT_ROOT, '.aios', 'gotchas.json');
const PATTERNS_PATH = path.join(DATA_DIR, 'learned-patterns.yaml');
const PROFILES_PATH = path.join(DATA_DIR, 'agent-knowledge-profiles.yaml');

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * @typedef {object} SearchResult
 * @property {string} source - Source identifier
 * @property {string} type - 'entity' | 'brief' | 'gotcha' | 'pattern' | 'profile'
 * @property {string} title - Result title
 * @property {string} excerpt - Relevant excerpt (max 200 chars)
 * @property {number} score - Relevance score (0.0–1.0)
 * @property {string} [path] - File path if applicable
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeReadText(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) { return null; }
}

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) { return null; }
}

/**
 * Normalize text for comparison.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text.toLowerCase()
    .replace(/[_\-./]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize query into keywords.
 * @param {string} query
 * @returns {string[]}
 */
function tokenize(query) {
  return normalize(query).split(' ').filter(w => w.length > 2);
}

/**
 * Calculate TF-IDF-inspired relevance score.
 * @param {string[]} queryTokens - Query keywords
 * @param {string} text - Document text
 * @param {string} [title=''] - Document title (title matches weighted higher)
 * @returns {number} Score between 0.0 and 1.0
 */
function relevanceScore(queryTokens, text, title = '') {
  if (!text) return 0;

  const normText  = normalize(text);
  const normTitle = normalize(title);
  const words = normText.split(' ');

  let score = 0;

  for (const token of queryTokens) {
    // Title match (3x weight)
    if (normTitle.includes(token)) score += 0.30;

    // Count occurrences in text (log-scaled)
    const occurrences = (normText.match(new RegExp(token, 'g')) || []).length;
    if (occurrences > 0) {
      score += Math.min(0.20, 0.05 * Math.log2(occurrences + 1));
    }
  }

  // Normalize by query length
  return Math.min(1.0, score / Math.max(1, queryTokens.length));
}

/**
 * Extract a relevant excerpt from text.
 * @param {string} text - Full text
 * @param {string[]} tokens - Query tokens
 * @param {number} [maxLen=200] - Max excerpt length
 * @returns {string}
 */
function extractExcerpt(text, tokens, maxLen = 200) {
  if (!text) return '';

  const normText = normalize(text);
  let bestStart = 0;
  let bestScore = 0;

  // Find window with highest token density
  const windowSize = 150;
  for (let i = 0; i < text.length - windowSize; i += 50) {
    const window = normText.slice(i, i + windowSize);
    const wScore = tokens.reduce((s, t) => s + (window.includes(t) ? 1 : 0), 0);
    if (wScore > bestScore) {
      bestScore = wScore;
      bestStart = i;
    }
  }

  const excerpt = text.slice(bestStart, bestStart + maxLen).trim();
  return excerpt.length < text.length ? excerpt + '…' : excerpt;
}

// ─── Source Searchers ────────────────────────────────────────────────────────

/**
 * Search entity registry for domain/entity matches.
 * @param {string[]} tokens
 * @returns {SearchResult[]}
 */
function searchEntityRegistry(tokens) {
  const content = safeReadText(REGISTRY_PATH);
  if (!content) return [];

  const results = [];
  const lines = content.split('\n');
  const entityBlocks = [];
  let current = null;

  for (const line of lines) {
    if (line.match(/^  [a-z]/i) && line.includes(':')) {
      if (current) entityBlocks.push(current);
      current = { name: line.split(':')[0].trim(), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) entityBlocks.push(current);

  for (const entity of entityBlocks.slice(0, 200)) { // cap at 200 entities
    const blockText = entity.lines.join('\n');
    const score = relevanceScore(tokens, blockText, entity.name);
    if (score > 0.05) {
      results.push({
        source:  'entity-registry',
        type:    'entity',
        title:   entity.name,
        excerpt: extractExcerpt(blockText, tokens, 150),
        score:   parseFloat(score.toFixed(3)),
      });
    }
  }

  return results;
}

/**
 * Search knowledge briefs.
 * @param {string[]} tokens
 * @param {string} [agentFilter] - Only search briefs for specific agent
 * @returns {SearchResult[]}
 */
function searchBriefs(tokens, agentFilter) {
  const results = [];

  try {
    if (!fs.existsSync(BRIEFS_DIR)) return [];

    const files = fs.readdirSync(BRIEFS_DIR)
      .filter(f => f.endsWith('.md'))
      .filter(f => !agentFilter || f.startsWith(`${agentFilter}-`));

    for (const file of files) {
      const content = safeReadText(path.join(BRIEFS_DIR, file));
      if (!content) continue;

      const score = relevanceScore(tokens, content, file.replace('.md', ''));
      if (score > 0.05) {
        results.push({
          source:  'knowledge-briefs',
          type:    'brief',
          title:   file.replace('.md', ''),
          excerpt: extractExcerpt(content, tokens),
          score:   parseFloat(score.toFixed(3)),
          path:    path.join(BRIEFS_DIR, file),
        });
      }
    }
  } catch (_) {}

  return results;
}

/**
 * Search gotchas memory.
 * @param {string[]} tokens
 * @returns {SearchResult[]}
 */
function searchGotchas(tokens) {
  const gotchas = safeReadJson(GOTCHAS_PATH);
  if (!Array.isArray(gotchas)) return [];

  return gotchas
    .map(g => {
      const text = JSON.stringify(g, null, 2);
      const title = g.title || g.description || g.id || 'gotcha';
      const score = relevanceScore(tokens, text, title);
      return { gotcha: g, text, title, score };
    })
    .filter(r => r.score > 0.05)
    .map(r => ({
      source:  'gotchas',
      type:    'gotcha',
      title:   r.title,
      excerpt: extractExcerpt(r.text, tokens),
      score:   parseFloat(r.score.toFixed(3)),
    }));
}

/**
 * Search learned patterns.
 * @param {string[]} tokens
 * @returns {SearchResult[]}
 */
function searchPatterns(tokens) {
  const content = safeReadText(PATTERNS_PATH);
  if (!content) return [];

  const score = relevanceScore(tokens, content, 'learned-patterns');
  if (score <= 0.05) return [];

  return [{
    source:  'learned-patterns',
    type:    'pattern',
    title:   'learned-patterns',
    excerpt: extractExcerpt(content, tokens),
    score:   parseFloat(score.toFixed(3)),
    path:    PATTERNS_PATH,
  }];
}

/**
 * Search agent profiles for domain knowledge.
 * @param {string[]} tokens
 * @returns {SearchResult[]}
 */
function searchProfiles(tokens) {
  const content = safeReadText(PROFILES_PATH);
  if (!content) return [];

  const results = [];
  const agentBlocks = content.match(/^[a-z][\w-]+:\s*\n(?:  .+\n?)*/gm) || [];

  for (const block of agentBlocks) {
    if (block.startsWith('meta:')) continue;
    const agentName = block.match(/^([a-z][\w-]+):/)?.[1];
    if (!agentName) continue;

    const score = relevanceScore(tokens, block, agentName);
    if (score > 0.05) {
      results.push({
        source:  'agent-profiles',
        type:    'profile',
        title:   `@${agentName}`,
        excerpt: extractExcerpt(block, tokens),
        score:   parseFloat(score.toFixed(3)),
      });
    }
  }

  return results;
}

// ─── Main Search Function ────────────────────────────────────────────────────

/**
 * Search across all knowledge sources.
 *
 * @param {string} query - Natural language or keyword query
 * @param {object} [options]
 * @param {string[]} [options.sources] - Limit to specific sources
 * @param {string} [options.agentFilter] - Filter by agent name
 * @param {number} [options.limit=10] - Max results to return
 * @param {number} [options.minScore=0.05] - Minimum relevance score
 * @returns {SearchResult[]} Sorted by relevance score descending
 */
function search(query, options = {}) {
  const {
    sources   = ['entity-registry', 'briefs', 'gotchas', 'patterns', 'profiles'],
    agentFilter,
    limit    = 10,
    minScore = 0.05,
  } = options;

  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const allResults = [];

  if (sources.includes('entity-registry')) {
    allResults.push(...searchEntityRegistry(tokens));
  }
  if (sources.includes('briefs')) {
    allResults.push(...searchBriefs(tokens, agentFilter));
  }
  if (sources.includes('gotchas')) {
    allResults.push(...searchGotchas(tokens));
  }
  if (sources.includes('patterns')) {
    allResults.push(...searchPatterns(tokens));
  }
  if (sources.includes('profiles')) {
    allResults.push(...searchProfiles(tokens));
  }

  return allResults
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find related domains for a query (used by knowledge-brief to contextualize).
 *
 * @param {string} query
 * @param {string} agentName
 * @returns {string[]} List of related domain names
 */
function findRelatedDomains(query, agentName) {
  const results = search(query, {
    sources: ['entity-registry', 'profiles'],
    agentFilter: agentName,
    limit: 20,
  });

  return [...new Set(
    results
      .filter(r => r.type === 'profile' || r.type === 'entity')
      .map(r => r.title.replace('@', '').toLowerCase().replace(/\s+/g, '-'))
      .filter(d => d.length > 2),
  )].slice(0, 5);
}

module.exports = {
  search,
  findRelatedDomains,
  tokenize,
  relevanceScore,
  extractExcerpt,
  searchEntityRegistry,
  searchBriefs,
  searchGotchas,
  searchPatterns,
  searchProfiles,
};
