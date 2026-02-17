'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  parseTaskFile,
  parseAllTasks,
} = require('../../../.aios-core/infrastructure/scripts/ide-sync/task-parser');

describe('task-parser', () => {
  let tmpRoot;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-task-parser-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('parses frontmatter, title, summary, task yaml and elicit=true', () => {
    const filePath = path.join(tmpRoot, 'sample-task.md');
    fs.writeFileSync(
      filePath,
      [
        '---',
        'name: sample-task',
        'elicit: true',
        '---',
        '',
        '# Sample Task',
        '',
        'This task validates parser behavior.',
        '',
        '```yaml',
        'task: sampleTask()',
        'elicit: true',
        '```',
        '',
      ].join('\n'),
      'utf8',
    );

    const parsed = parseTaskFile(filePath);
    expect(parsed.error).toBe(null);
    expect(parsed.id).toBe('sample-task');
    expect(parsed.title).toBe('Sample Task');
    expect(parsed.summary).toBe('This task validates parser behavior.');
    expect(parsed.frontmatter.name).toBe('sample-task');
    expect(parsed.taskDefinition.task).toBe('sampleTask()');
    expect(parsed.elicit).toBe(true);
  });

  it('falls back to filename title when markdown heading is missing', () => {
    const filePath = path.join(tmpRoot, 'no-heading.md');
    fs.writeFileSync(filePath, 'Plain text without heading.', 'utf8');

    const parsed = parseTaskFile(filePath);
    expect(parsed.title).toBe('no-heading');
    expect(parsed.summary).toBe('Plain text without heading.');
    expect(parsed.elicit).toBe(false);
  });

  it('parses all markdown tasks from directory', () => {
    fs.writeFileSync(path.join(tmpRoot, 'b.md'), '# B\n\nSummary B', 'utf8');
    fs.writeFileSync(path.join(tmpRoot, 'a.md'), '# A\n\nSummary A', 'utf8');
    fs.writeFileSync(path.join(tmpRoot, 'ignore.txt'), 'noop', 'utf8');

    const tasks = parseAllTasks(tmpRoot);
    const ids = tasks.map((task) => task.id);

    expect(tasks).toHaveLength(2);
    expect(ids).toEqual(['a', 'b']);
  });
});
