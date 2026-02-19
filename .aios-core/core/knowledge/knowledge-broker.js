/**
 * Knowledge Broker — Pattern Transfer Between Agents
 *
 * Transfers knowledge patterns discovered by one agent to other agents.
 * Sources: gotchas.json, knowledge-briefs/, learned-patterns.yaml
 * Output: personalized brief files + Synapse L8 queue updates + profile score increments
 *
 * @module core/knowledge/knowledge-broker
 * @version 1.0.0
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT    = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR        = path.join(PROJECT_ROOT, '.aios-core', 'data');
const BRIEFS_DIR      = path.join(DATA_DIR, 'knowledge-briefs');
const PROFILES_PATH   = path.join(DATA_DIR, 'agent-knowledge-profiles.yaml');
const GOTCHAS_PATH    = path.join(PROJECT_ROOT, '.aios', 'gotchas.json');
const PATTERNS_PATH   = path.join(DATA_DIR, 'learned-patterns.yaml');
const QUEUE_PATH      = path.join(PROJECT_ROOT, '.synapse', 'l8-knowledge-queue.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) { return null; }
}

function safeReadText(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) { return null; }
}

function isoNow() { return new Date().toISOString(); }

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ─── Pattern Locator ─────────────────────────────────────────────────────────

/**
 * Find a pattern by name/keyword across all sources.
 *
 * @param {string} patternName - Pattern identifier or keyword
 * @param {string} fromAgent - Source agent name
 * @returns {{ content: string, source: string, title: string } | null}
 */
function findPattern(patternName, fromAgent) {
  const kwLower = patternName.toLowerCase().replace(/[- ]/g, '.');

  // 1. Search in gotchas.json
  const gotchas = safeReadJson(GOTCHAS_PATH);
  if (Array.isArray(gotchas)) {
    const match = gotchas.find(g => {
      const text = JSON.stringify(g).toLowerCase();
      return kwLower.split('.').some(kw => text.includes(kw));
    });
    if (match) {
      return {
        content: JSON.stringify(match, null, 2),
        source:  'gotchas',
        title:   match.title || match.description || patternName,
      };
    }
  }

  // 2. Search in knowledge-briefs/
  try {
    if (fs.existsSync(BRIEFS_DIR)) {
      const files = fs.readdirSync(BRIEFS_DIR)
        .filter(f => f.startsWith(`${fromAgent}-`) && f.endsWith('.md'));

      for (const file of files) {
        if (file.toLowerCase().includes(kwLower.split('.')[0])) {
          const content = safeReadText(path.join(BRIEFS_DIR, file));
          if (content) {
            return { content, source: 'brief', title: file.replace('.md', '') };
          }
        }
      }
    }
  } catch (_) {}

  // 3. Search in learned-patterns.yaml
  const patterns = safeReadText(PATTERNS_PATH);
  if (patterns && patterns.toLowerCase().includes(kwLower.split('.')[0])) {
    return { content: patterns, source: 'learned-patterns', title: patternName };
  }

  return null;
}

// ─── Brief Generator ─────────────────────────────────────────────────────────

/**
 * Agent-specific role context for brief adaptation.
 * @type {Object.<string, string>}
 */
const AGENT_CONTEXT = {
  dev:           'Desenvolve código TypeScript/JavaScript. Foca em implementação prática e exemplos de código.',
  architect:     'Projeta arquitetura de sistemas. Foca em decisões de design, trade-offs e diagramas.',
  qa:            'Garante qualidade. Foca em como testar, validar e detectar falhas relacionadas ao padrão.',
  pm:            'Gerencia produto. Foca em impacto no usuário, requisitos e riscos de negócio.',
  analyst:       'Pesquisa e analisa. Foca em métricas, evidências e frameworks de avaliação.',
  'data-engineer': 'Engenheiro de dados. Foca em esquemas, queries e pipelines de dados.',
  sm:            'Scrum Master. Foca em como o padrão afeta estimativas e planejamento de sprints.',
  po:            'Product Owner. Foca em como o padrão afeta priorização e valor de negócio.',
  devops:        'Engenheiro DevOps. Foca em deployment, monitoramento e operações do padrão.',
  'aios-master': 'Orquestrador do framework AIOS. Foca em como o padrão pode ser usado no framework.',
};

/**
 * Generate a personalized knowledge brief for an agent.
 *
 * @param {string} patternName - Pattern to transfer
 * @param {string} fromAgent - Source agent
 * @param {string} toAgent - Target agent
 * @param {object} pattern - Pattern content from findPattern()
 * @returns {string} Brief markdown content
 */
function generateBriefForAgent(patternName, fromAgent, toAgent, pattern) {
  const agentContext = AGENT_CONTEXT[toAgent] || `Agente @${toAgent}.`;
  const ts = isoNow();

  return `# Pattern Transfer: ${patternName}
**De:** @${fromAgent}
**Para:** @${toAgent}
**Via:** @knowledge-monitor (Sage) — Knowledge Broker
**Data:** ${ts}
**Fonte original:** ${pattern.source}

---

## Contexto do Padrão

Este padrão foi descoberto por @${fromAgent} e é relevante para @${toAgent}.

**${agentContext}**

---

## Conteúdo do Padrão

${pattern.content}

---

## Instruções para @${toAgent}

1. Consulte este padrão antes de trabalhar em domínios relacionados a: **${patternName}**
2. Adapte os exemplos ao seu contexto de trabalho como @${toAgent}
3. Se encontrar variações ou novos insights, registre via: \`*gotcha\`
4. Após aplicar o padrão com sucesso, atualize o score: \`*update-profile ${toAgent} ${patternName.split('-').slice(0,2).join('-')} {novo-score}\`

---

*Gerado por @knowledge-monitor (Sage) — Knowledge Broker v1.0.0*
`;
}

// ─── L8 Queue ────────────────────────────────────────────────────────────────

/**
 * Add brief to Synapse L8 injection queue.
 *
 * @param {string} agentName
 * @param {string} briefPath - Absolute or relative path
 * @param {string} [priority='broker']
 */
function enqueueBrief(agentName, briefPath, priority = 'broker') {
  try {
    let queue = safeReadJson(QUEUE_PATH) || [];
    if (!Array.isArray(queue)) queue = [];

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const relPath = path.relative(PROJECT_ROOT, briefPath);

    queue.push({
      agent:      agentName,
      briefPath:  relPath,
      priority,
      source:     'broker',
      enqueuedAt: isoNow(),
      expiresAt,
    });

    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf8');
  } catch (_) {}
}

// ─── Profile Updater ─────────────────────────────────────────────────────────

/**
 * Increment domain score for agent in profiles YAML.
 * Uses simple text replacement to avoid YAML parser dependency.
 *
 * @param {string} agentName
 * @param {string} domain - Domain to increment
 * @param {number} increment - Score increment (default: 0.10)
 * @returns {{ oldScore: number, newScore: number } | null}
 */
function incrementScore(agentName, domain, increment = 0.10) {
  try {
    if (!fs.existsSync(PROFILES_PATH)) return null;
    const content = fs.readFileSync(PROFILES_PATH, 'utf8');

    // Find domain score within the agent block
    const agentBlockPattern = new RegExp(
      `(^${agentName}:\\s*\\n(?:  .+\\n?)*)`,
      'gm',
    );
    const agentMatch = agentBlockPattern.exec(content);
    if (!agentMatch) return null;

    const domainKeywords = domain.split('-');
    // Find the closest domain name match in the agent's block
    const domainPattern = new RegExp(
      `(    (?:${domainKeywords.join('|')}[\\w-]*):\\s*\\n` +
      `      score:\\s*)([0-9.]+)`,
      'i',
    );

    const agentBlock = agentMatch[1];
    const domainMatch = domainPattern.exec(agentBlock);
    if (!domainMatch) return null;

    const oldScore = parseFloat(domainMatch[2]);
    const newScore = Math.min(1.0, parseFloat((oldScore + increment).toFixed(2)));

    const updatedContent = content.replace(
      domainMatch[0],
      `${domainMatch[1]}${newScore}`,
    );

    // Also update lastUpdated and source for this domain
    const datePattern = new RegExp(
      `(    (?:${domainKeywords.join('|')}[\\w-]*):\\s*\\n` +
      `      score:\\s*${newScore}\\n` +
      `      lastUpdated:\\s*)[^\\n]*`,
    );
    const withDate = updatedContent.replace(datePattern, `$1'${new Date().toISOString().slice(0,10)}'`);

    const sourcePattern = new RegExp(
      `(    (?:${domainKeywords.join('|')}[\\w-]*):\\s*\\n` +
      `      score:\\s*${newScore}\\n` +
      `      lastUpdated:\\s*'[^']*'\\n` +
      `      source:\\s*)[^\\n]*`,
    );
    const withSource = withDate.replace(sourcePattern, `$1'broker:${agentName}'`);

    fs.writeFileSync(PROFILES_PATH, withSource, 'utf8');
    return { oldScore, newScore };
  } catch (_) {
    return null;
  }
}

// ─── Main Broker Function ────────────────────────────────────────────────────

/**
 * Transfer a knowledge pattern from one agent to others.
 *
 * @param {string} patternName - Pattern identifier
 * @param {string} fromAgent - Source agent
 * @param {string[]} toAgents - Target agents
 * @param {object} [options]
 * @param {boolean} [options.updateScores=true] - Increment scores after transfer
 * @param {boolean} [options.enqueueL8=true] - Add to Synapse L8 queue
 * @returns {{
 *   success: boolean,
 *   pattern: object | null,
 *   briefsCreated: string[],
 *   scoresUpdated: object[],
 *   errors: string[]
 * }}
 */
function brokerPattern(patternName, fromAgent, toAgents, options = {}) {
  const { updateScores = true, enqueueL8 = true } = options;
  const result = {
    success:       false,
    pattern:       null,
    briefsCreated: [],
    scoresUpdated: [],
    errors:        [],
  };

  // 1. Find pattern
  const pattern = findPattern(patternName, fromAgent);
  if (!pattern) {
    result.errors.push(`Padrão '${patternName}' não encontrado nos sources de @${fromAgent}`);
    return result;
  }
  result.pattern = pattern;

  // 2. Ensure briefs directory
  try {
    fs.mkdirSync(BRIEFS_DIR, { recursive: true });
  } catch (_) {}

  // 3. Generate brief for each target agent
  const ts = timestamp();
  for (const toAgent of toAgents) {
    try {
      const briefContent = generateBriefForAgent(patternName, fromAgent, toAgent, pattern);
      const briefName    = `${toAgent}-broker-${patternName.replace(/[^a-z0-9-]/g, '-')}-${ts}.md`;
      const briefPath    = path.join(BRIEFS_DIR, briefName);

      fs.writeFileSync(briefPath, briefContent, 'utf8');
      result.briefsCreated.push(briefPath);

      // 4. Enqueue for L8 injection
      if (enqueueL8) {
        enqueueBrief(toAgent, briefPath, 'broker');
      }

      // 5. Increment score
      if (updateScores) {
        const domainName = patternName.split('-').slice(0, 2).join('-');
        const scoreResult = incrementScore(toAgent, domainName);
        if (scoreResult) {
          result.scoresUpdated.push({ agent: toAgent, domain: domainName, ...scoreResult });
        }
      }
    } catch (err) {
      result.errors.push(`Erro ao processar @${toAgent}: ${err.message}`);
    }
  }

  result.success = result.briefsCreated.length > 0;
  return result;
}

module.exports = {
  brokerPattern,
  findPattern,
  generateBriefForAgent,
  enqueueBrief,
  incrementScore,
};
