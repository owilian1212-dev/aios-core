#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllTasks } = require('../ide-sync/task-parser');
const { parseAllAgents } = require('../ide-sync/agent-parser');
const { isParsableAgent } = require('../skills-sync/contracts');
const { getTaskSkillId } = require('../skills-sync/renderers/task-skill');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    sourceAgentsDir: path.join(projectRoot, '.aios-core', 'development', 'agents'),
    catalogPath: path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
    strict: false,
    quiet: false,
    json: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(
    argv.filter((arg) => !arg.startsWith('--catalog=')),
  );
  const catalogArg = argv.find((arg) => arg.startsWith('--catalog='));

  return {
    strict: args.has('--strict'),
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
    catalogPath: catalogArg ? catalogArg.slice('--catalog='.length) : undefined,
  };
}

function readCatalog(catalogPath) {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Task skill catalog not found: ${catalogPath}`);
  }

  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = yaml.load(raw) || {};

  if (!Array.isArray(parsed.allowlist)) {
    throw new Error('Task skill catalog must define an allowlist array');
  }

  if (!parsed.targets || typeof parsed.targets !== 'object') {
    throw new Error('Task skill catalog must define targets');
  }

  return parsed;
}

function normalizeTaskId(value) {
  return String(value || '').trim().replace(/^aios-task-/, '');
}

function normalizeAllowlist(catalog) {
  const entries = [];
  const duplicates = [];
  const seen = new Set();

  for (const row of catalog.allowlist) {
    const taskId = normalizeTaskId(row && row.task_id);
    if (!taskId) continue;

    if (seen.has(taskId)) {
      duplicates.push(taskId);
      continue;
    }

    seen.add(taskId);
    entries.push({
      taskId,
      enabled: row.enabled !== false,
      targets: row.targets || {},
    });
  }

  return {
    entries: entries.sort((left, right) => left.taskId.localeCompare(right.taskId)),
    duplicates,
  };
}

function resolveEnabledTargets(catalog, projectRoot) {
  const targets = [];

  for (const [targetName, config] of Object.entries(catalog.targets || {})) {
    if (!config || config.enabled !== true) continue;

    const relPath = String(config.path || '').trim();
    if (!relPath) continue;

    targets.push({
      name: targetName,
      relPath,
      absPath: path.resolve(projectRoot, relPath),
    });
  }

  return targets.sort((left, right) => left.name.localeCompare(right.name));
}

function isEnabledForTarget(entry, targetName) {
  if (!entry.enabled) return false;

  if (entry.targets && Object.prototype.hasOwnProperty.call(entry.targets, targetName)) {
    return entry.targets[targetName] === true;
  }

  return true;
}

function toAgentSkillId(agentId) {
  const normalized = String(agentId || '').trim();
  if (normalized.startsWith('aios-')) return normalized;
  return `aios-${normalized}`;
}

function validateTaskSkillContent(content, expected) {
  const issues = [];

  const checks = [
    {
      ok: content.includes(`name: ${expected.skillId}`),
      reason: `missing frontmatter name "${expected.skillId}"`,
    },
    {
      ok: content.includes(`.aios-core/development/tasks/${expected.filename}`),
      reason: `missing canonical task path "${expected.filename}"`,
    },
    {
      ok: content.includes('AIOS Task Skill'),
      reason: 'missing AIOS task skill header',
    },
  ];

  for (const check of checks) {
    if (!check.ok) {
      issues.push(check.reason);
    }
  }

  return issues;
}

function listTaskSkillDirs(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('aios-task-'))
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function validateTaskSkills(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  const errors = [];
  const warnings = [];

  let catalog;
  try {
    catalog = readCatalog(resolved.catalogPath);
  } catch (error) {
    return {
      ok: false,
      errors: [error.message],
      warnings,
      metrics: {
        sourceTasks: 0,
        catalogTasks: 0,
        checkedSkills: 0,
      },
    };
  }

  const { entries, duplicates } = normalizeAllowlist(catalog);
  if (duplicates.length > 0) {
    errors.push(`Duplicate task_id in task skill catalog: ${duplicates.join(', ')}`);
  }

  if (entries.length === 0) {
    warnings.push('Task skill catalog allowlist is empty');
  }

  const parsedTasks = parseAllTasks(resolved.sourceDir).filter((task) => !task.error);
  const tasksById = new Map(parsedTasks.map((task) => [task.id, task]));

  for (const entry of entries) {
    if (!entry.enabled) continue;
    if (!tasksById.has(entry.taskId)) {
      errors.push(`Task from catalog not found in source: ${entry.taskId}`);
    }
  }

  const agentSkillIds = new Set(
    parseAllAgents(resolved.sourceAgentsDir)
      .filter(isParsableAgent)
      .map((agent) => toAgentSkillId(agent.id)),
  );

  for (const entry of entries) {
    if (!entry.enabled) continue;
    const skillId = getTaskSkillId(entry.taskId);
    if (agentSkillIds.has(skillId)) {
      errors.push(`Task skill id collides with agent skill id: ${skillId}`);
    }
  }

  const targets = resolveEnabledTargets(catalog, resolved.projectRoot);
  if (targets.length === 0) {
    warnings.push('No enabled targets in task skill catalog');
  }

  let checkedSkills = 0;

  for (const target of targets) {
    const expected = entries
      .filter((entry) => isEnabledForTarget(entry, target.name))
      .map((entry) => ({
        ...entry,
        skillId: getTaskSkillId(entry.taskId),
      }));

    if (expected.length > 0 && !fs.existsSync(target.absPath)) {
      errors.push(`Missing task skill target dir: ${path.relative(resolved.projectRoot, target.absPath)}`);
      continue;
    }

    for (const item of expected) {
      const task = tasksById.get(item.taskId);
      if (!task) continue;

      const skillPath = path.join(target.absPath, item.skillId, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        errors.push(`Missing task skill file: ${path.relative(resolved.projectRoot, skillPath)}`);
        continue;
      }

      let content = '';
      try {
        content = fs.readFileSync(skillPath, 'utf8');
      } catch (error) {
        errors.push(`${item.skillId}: unable to read skill file (${error.message})`);
        continue;
      }

      const issues = validateTaskSkillContent(content, {
        skillId: item.skillId,
        filename: task.filename,
      });
      for (const issue of issues) {
        errors.push(`${item.skillId}: ${issue}`);
      }

      checkedSkills += 1;
    }

    if (resolved.strict) {
      const expectedSkillIds = new Set(expected.map((item) => item.skillId));
      const actualSkillIds = listTaskSkillDirs(target.absPath);

      for (const actualSkillId of actualSkillIds) {
        if (!expectedSkillIds.has(actualSkillId)) {
          errors.push(`Orphaned task skill directory: ${path.join(path.relative(resolved.projectRoot, target.absPath), actualSkillId)}`);
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceTasks: parsedTasks.length,
      catalogTasks: entries.filter((entry) => entry.enabled).length,
      checkedSkills,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Task skills validation passed (${result.metrics.checkedSkills} skills checked)`,
    ];

    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((warning) => `⚠️ ${warning}`));
    }

    return lines.join('\n');
  }

  const lines = [
    `❌ Task skills validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((error) => `- ${error}`),
  ];

  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((warning) => `⚠️ ${warning}`));
  }

  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const runtimeOptions = { ...args };

  if (args.catalogPath) {
    runtimeOptions.catalogPath = path.resolve(process.cwd(), args.catalogPath);
  } else {
    delete runtimeOptions.catalogPath;
  }

  const result = validateTaskSkills(runtimeOptions);

  if (!args.quiet) {
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatHumanReport(result));
    }
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getDefaultOptions,
  parseArgs,
  readCatalog,
  normalizeAllowlist,
  resolveEnabledTargets,
  isEnabledForTarget,
  validateTaskSkillContent,
  listTaskSkillDirs,
  validateTaskSkills,
  formatHumanReport,
};
