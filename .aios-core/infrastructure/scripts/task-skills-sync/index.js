#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllTasks } = require('../ide-sync/task-parser');
const {
  buildTaskSpecsFromParsedTasks,
  buildTaskSkillPlan,
  writeSkillPlan,
} = require('../skills-sync');

const SUPPORTED_TARGETS = ['codex', 'claude', 'gemini'];

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    catalogPath: path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
    target: 'all',
    dryRun: false,
    prune: true,
    quiet: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    target: 'all',
    dryRun: false,
    prune: true,
    quiet: false,
    catalogPath: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--target' && argv[i + 1]) {
      options.target = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--target=')) {
      options.target = arg.slice('--target='.length);
      continue;
    }

    if (arg === '--catalog' && argv[i + 1]) {
      options.catalogPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--catalog=')) {
      options.catalogPath = arg.slice('--catalog='.length);
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--no-prune') {
      options.prune = false;
      continue;
    }

    if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    }
  }

  return options;
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

function parseRequestedTargets(value) {
  const normalized = String(value || 'all').trim();
  if (!normalized || normalized === 'all') {
    return SUPPORTED_TARGETS;
  }

  const requested = normalized
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const invalid = requested.filter((name) => !SUPPORTED_TARGETS.includes(name));
  if (invalid.length > 0) {
    throw new Error(`Unsupported task-skill target(s): ${invalid.join(', ')}`);
  }

  return [...new Set(requested)];
}

function resolveTargets(catalog, options) {
  const requestedTargets = parseRequestedTargets(options.target);
  const targets = [];

  for (const targetName of requestedTargets) {
    const config = catalog.targets[targetName];
    if (!config || config.enabled !== true) {
      continue;
    }

    const relPath = String(config.path || '').trim();
    if (!relPath) {
      throw new Error(`Task skill target "${targetName}" is missing path in catalog`);
    }

    targets.push({
      name: targetName,
      relPath,
      absPath: path.resolve(options.projectRoot, relPath),
    });
  }

  if (targets.length === 0) {
    throw new Error('No enabled task-skill targets resolved from catalog/flags');
  }

  return targets;
}

function normalizeAllowlistEntries(catalog) {
  const entries = [];
  const seen = new Set();

  for (const row of catalog.allowlist) {
    const taskId = normalizeTaskId(row && row.task_id);
    if (!taskId) {
      continue;
    }

    if (seen.has(taskId)) {
      throw new Error(`Duplicate task_id in task skill catalog: ${taskId}`);
    }

    seen.add(taskId);
    entries.push({
      taskId,
      enabled: row.enabled !== false,
      targets: row.targets || {},
    });
  }

  return entries.sort((left, right) => left.taskId.localeCompare(right.taskId));
}

function isEntryEnabledForTarget(entry, targetName) {
  if (!entry.enabled) return false;

  if (entry.targets && Object.prototype.hasOwnProperty.call(entry.targets, targetName)) {
    return entry.targets[targetName] === true;
  }

  return true;
}

function collectSelectedTaskSpecs(entries, taskSpecsById, targetName) {
  const specs = [];
  const skillIds = [];

  for (const entry of entries) {
    if (!isEntryEnabledForTarget(entry, targetName)) {
      continue;
    }

    const spec = taskSpecsById.get(entry.taskId);
    if (!spec) {
      throw new Error(`Task from catalog not found in source: ${entry.taskId}`);
    }

    specs.push(spec);
    skillIds.push(`aios-task-${entry.taskId}`);
  }

  return {
    specs,
    expectedSkillIds: skillIds,
  };
}

function pruneOrphanTaskSkills(targetDir, expectedSkillIds, options = {}) {
  const resolved = { dryRun: false, ...options };

  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const expected = new Set(expectedSkillIds || []);
  const existing = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('aios-task-'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const orphaned = existing.filter((skillId) => !expected.has(skillId));

  if (!resolved.dryRun) {
    for (const skillId of orphaned) {
      fs.removeSync(path.join(targetDir, skillId));
    }
  }

  return orphaned;
}

function syncTaskSkills(options = {}) {
  const resolved = {
    ...getDefaultOptions(),
    ...options,
  };

  const catalog = readCatalog(resolved.catalogPath);
  const targets = resolveTargets(catalog, resolved);
  const entries = normalizeAllowlistEntries(catalog);

  const parsedTasks = parseAllTasks(resolved.sourceDir);
  const taskSpecs = buildTaskSpecsFromParsedTasks(parsedTasks);
  const taskSpecsById = new Map(taskSpecs.map((task) => [task.id, task]));

  const targetResults = [];

  for (const target of targets) {
    const selected = collectSelectedTaskSpecs(entries, taskSpecsById, target.name);
    const plan = buildTaskSkillPlan(selected.specs, target.absPath);
    writeSkillPlan(plan, resolved);

    const pruned = resolved.prune
      ? pruneOrphanTaskSkills(target.absPath, selected.expectedSkillIds, resolved)
      : [];

    targetResults.push({
      target: target.name,
      targetPath: target.relPath,
      generated: plan.length,
      pruned,
    });
  }

  return {
    catalogPath: path.relative(resolved.projectRoot, resolved.catalogPath),
    sourceDir: path.relative(resolved.projectRoot, resolved.sourceDir),
    dryRun: resolved.dryRun,
    targets: targetResults,
  };
}

function formatSummary(result) {
  const lines = [
    `✅ Task skills sync complete (${result.targets.reduce((sum, target) => sum + target.generated, 0)} generated)`,
    `- catalog: ${result.catalogPath}`,
    `- source: ${result.sourceDir}`,
  ];

  for (const target of result.targets) {
    lines.push(`- ${target.target}: ${target.generated} generated${target.pruned.length > 0 ? `, ${target.pruned.length} pruned` : ''}`);
  }

  if (result.dryRun) {
    lines.push('ℹ️ Dry-run mode: no files written');
  }

  return lines.join('\n');
}

function main() {
  const cli = parseArgs();
  const runtimeOptions = { ...cli };

  if (cli.catalogPath) {
    runtimeOptions.catalogPath = path.resolve(process.cwd(), cli.catalogPath);
  } else {
    delete runtimeOptions.catalogPath;
  }

  const result = syncTaskSkills(runtimeOptions);

  if (!cli.quiet) {
    console.log(formatSummary(result));
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  SUPPORTED_TARGETS,
  getDefaultOptions,
  parseArgs,
  readCatalog,
  parseRequestedTargets,
  resolveTargets,
  normalizeAllowlistEntries,
  collectSelectedTaskSpecs,
  isEntryEnabledForTarget,
  pruneOrphanTaskSkills,
  syncTaskSkills,
  formatSummary,
};
