'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

function parseYamlBlock(content) {
  try {
    return yaml.load(content);
  } catch (_) {
    return null;
  }
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  return {
    frontmatter: parseYamlBlock(match[1]),
    body: content.slice(match[0].length),
  };
}

function extractInlineYamlTaskDefinition(content) {
  const matches = content.match(/```yaml\s*\n([\s\S]*?)\n```/g);
  if (!matches) return null;

  for (const block of matches) {
    const innerMatch = block.match(/```yaml\s*\n([\s\S]*?)\n```/);
    if (!innerMatch) continue;
    const candidate = innerMatch[1].trim();
    if (!/(^|\n)\s*task\s*:/i.test(candidate)) {
      continue;
    }

    const parsed = parseYamlBlock(candidate);
    if (parsed) return parsed;
  }

  return null;
}

function extractTitle(content, fallback) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  return fallback;
}

function extractSummary(content) {
  const lines = content.split(/\r?\n/);
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (/^---+$/.test(trimmed)) continue;
    return trimmed;
  }

  return '';
}

function detectElicit({ frontmatter, taskDefinition, rawContent }) {
  if (frontmatter && typeof frontmatter === 'object' && frontmatter.elicit === true) {
    return true;
  }

  if (taskDefinition && typeof taskDefinition === 'object' && taskDefinition.elicit === true) {
    return true;
  }

  return /(^|\n)\s*elicit\s*:\s*true\b/i.test(rawContent);
}

function parseTaskFile(filePath) {
  const result = {
    path: filePath,
    filename: path.basename(filePath),
    id: path.basename(filePath, '.md'),
    title: '',
    summary: '',
    frontmatter: null,
    taskDefinition: null,
    elicit: false,
    raw: null,
    error: null,
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    result.raw = content;

    const { frontmatter, body } = extractFrontmatter(content);
    result.frontmatter = frontmatter;
    result.taskDefinition = extractInlineYamlTaskDefinition(content);
    result.title = extractTitle(body, result.id);
    result.summary = extractSummary(body);
    result.elicit = detectElicit({
      frontmatter,
      taskDefinition: result.taskDefinition,
      rawContent: content,
    });
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

function parseAllTasks(tasksDir) {
  if (!fs.existsSync(tasksDir)) {
    console.error(`Tasks directory not found: ${tasksDir}`);
    return [];
  }

  const files = fs.readdirSync(tasksDir)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((file) => parseTaskFile(path.join(tasksDir, file)));
}

module.exports = {
  parseAllTasks,
  parseTaskFile,
  extractFrontmatter,
  extractInlineYamlTaskDefinition,
  extractTitle,
  extractSummary,
  detectElicit,
};
