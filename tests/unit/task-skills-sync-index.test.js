'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncTaskSkills,
} = require('../../.aios-core/infrastructure/scripts/task-skills-sync/index');

describe('task-skills-sync index', () => {
  let tmpRoot;
  let sourceDir;
  let sourceAgentsDir;
  let catalogPath;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-task-skills-sync-'));
    sourceDir = path.join(process.cwd(), '.aios-core', 'development', 'tasks');
    sourceAgentsDir = path.join(process.cwd(), '.aios-core', 'development', 'agents');
    catalogPath = path.join(
      tmpRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    );

    write(
      catalogPath,
      [
        'schema_version: 1',
        'targets:',
        '  codex:',
        '    enabled: true',
        '    path: .codex/skills',
        '  claude:',
        '    enabled: true',
        '    path: .claude/skills',
        'allowlist:',
        '  - task_id: execute-checklist',
        '    agent: qa',
        '  - task_id: create-doc',
        '    agent: po',
      ].join('\n'),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('generates task skills for all enabled targets', () => {
    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'catalog',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(2);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'aios-qa-execute-checklist', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.claude', 'skills', 'aios-po-create-doc', 'SKILL.md'))).toBe(true);
  });

  it('prunes orphaned task skill dirs when prune is enabled', () => {
    const orphanDir = path.join(tmpRoot, '.codex', 'skills', 'aios-dev-legacy');
    write(path.join(orphanDir, 'SKILL.md'), 'Load .aios-core/development/tasks/legacy.md');

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
      prune: true,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].pruned).toContain('aios-dev-legacy');
    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it('supports full scope with fallback agent and task-owned agent extraction', () => {
    const sourceTaskCount = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md')).length;

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'full',
      fallbackAgent: 'master',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].generated).toBe(sourceTaskCount);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'aios-devops-environment-bootstrap', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'aios-master-analyze-brownfield', 'SKILL.md'))).toBe(true);
  });

  it('normalizes github-devops alias to devops in catalog entries', () => {
    write(
      catalogPath,
      [
        'schema_version: 1',
        'targets:',
        '  codex:',
        '    enabled: true',
        '    path: .codex/skills',
        'agent_aliases:',
        '  github-devops: devops',
        'allowlist:',
        '  - task_id: publish-npm',
        '    agent: github-devops',
      ].join('\n'),
    );

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].generated).toBe(1);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'aios-devops-publish-npm', 'SKILL.md'))).toBe(true);
  });
});
