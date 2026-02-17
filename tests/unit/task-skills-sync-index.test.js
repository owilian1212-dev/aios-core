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
  let catalogPath;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-task-skills-sync-'));
    sourceDir = path.join(process.cwd(), '.aios-core', 'development', 'tasks');
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
        '  - task_id: create-doc',
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
      catalogPath,
      dryRun: false,
    });

    expect(result.targets).toHaveLength(2);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'aios-task-execute-checklist', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.claude', 'skills', 'aios-task-create-doc', 'SKILL.md'))).toBe(true);
  });

  it('prunes orphaned task skill dirs when prune is enabled', () => {
    const orphanDir = path.join(tmpRoot, '.codex', 'skills', 'aios-task-legacy');
    write(path.join(orphanDir, 'SKILL.md'), '# legacy');

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      catalogPath,
      target: 'codex',
      dryRun: false,
      prune: true,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].pruned).toContain('aios-task-legacy');
    expect(fs.existsSync(orphanDir)).toBe(false);
  });
});
