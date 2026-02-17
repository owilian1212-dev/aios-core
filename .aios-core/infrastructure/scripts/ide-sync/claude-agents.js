'use strict';

const yaml = require('js-yaml');
const { normalizeCommands, getVisibleCommands } = require('./agent-parser');

function trimText(text, max = 220) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3).trim()}...`;
}

function uniqueCommands(commands) {
  const seen = new Set();
  const result = [];

  for (const command of commands) {
    const name = String(command?.name || '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(command);
  }

  return result;
}

function buildStarterCommands(agentData) {
  const commands = normalizeCommands(agentData.commands || []);
  const quick = getVisibleCommands(commands, 'quick');
  const key = getVisibleCommands(commands, 'key');
  const selected = uniqueCommands([...quick, ...key]).slice(0, 8);

  if (selected.length === 0) {
    return '- `*help` - Show available commands';
  }

  return selected
    .map((command) => `- \`*${command.name}\` - ${command.description || 'No description'}`)
    .join('\n');
}

function getNativeAgentName(agentData) {
  const id = String(agentData?.id || '').trim();
  if (!id) return 'aios-agent';
  return id;
}

function buildFrontmatter(agentData) {
  const agent = agentData.agent || {};
  const description = trimText(
    agent.whenToUse || `Use @${agentData.id} for specialized AIOS workflows.`,
    240,
  );

  return {
    name: getNativeAgentName(agentData),
    description,
    memory: 'project',
    model: 'sonnet',
  };
}

function renderFrontmatter(data) {
  const body = yaml.dump(data, { lineWidth: 1000, noRefs: true }).trimEnd();
  return `---\n${body}\n---`;
}

function transform(agentData) {
  const agent = agentData.agent || {};
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOS Agent';
  const whenToUse = trimText(
    agent.whenToUse || `Use @${agentData.id} for specialized AIOS workflows.`,
    320,
  );
  const starterCommands = buildStarterCommands(agentData);
  const sourcePath = `.aios-core/development/agents/${agentData.filename}`;

  return `${renderFrontmatter(buildFrontmatter(agentData))}

# AIOS ${title} (${name})

## Purpose
${whenToUse}

## Source of Truth
- Load \`${sourcePath}\` and follow it as canonical definition.
- Keep behavior and dependency usage aligned with the source file.

## Activation Flow
1. Read the full source agent definition before acting.
2. Adopt persona, commands, and constraints exactly as defined.
3. Run \`node .aios-core/development/scripts/generate-greeting.js ${agentData.id}\` and present the greeting.
4. Stay in this persona until explicit exit.

## Starter Commands
${starterCommands}

## Compatibility
- Legacy command adapter remains at \`.claude/commands/AIOS/agents/${agentData.filename}\`.
`;
}

function getFilename(agentData) {
  return agentData.filename;
}

module.exports = {
  getNativeAgentName,
  transform,
  getFilename,
  format: 'claude-native-agent',
};
