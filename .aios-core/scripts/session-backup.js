#!/usr/bin/env node
/**
 * AIOS Session Backup — Low Token Safety Net
 *
 * Triggered automatically before context runs out (PreCompact hook)
 * or manually by any IDE agent when approaching token limit.
 *
 * Actions:
 *   1. Collect full inventory: agents, squads, MCPs, skills, hooks
 *   2. Generate rich session report (.aios/session-reports/session-{ts}.md)
 *   3. git add + commit
 *   4. Push to backup remote (BACKUP_REMOTE_URL from .env)
 *   5. Print warning notice for the user
 *
 * Usage:
 *   node .aios-core/scripts/session-backup.js [--provider=claude|gemini|codex] [--reason=precompact|manual]
 *
 * Config (.env):
 *   GITHUB_TOKEN         — Personal Access Token (repo + workflow scopes)
 *   BACKUP_REMOTE_URL    — https://github.com/owner/repo.git
 *   BACKUP_REMOTE_BRANCH — branch to push to (default: main)
 */

'use strict';

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ─── Bootstrap ─────────────────────────────────────────────────────────────

const PROJECT_ROOT  = path.resolve(__dirname, '..', '..');
const REPORTS_DIR   = path.join(PROJECT_ROOT, '.aios', 'session-reports');

// Load .env
const envPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .forEach(l => {
      const [k, ...v] = l.split('=');
      if (!process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim();
    });
}

const GITHUB_TOKEN    = process.env.GITHUB_TOKEN || '';
const BACKUP_REMOTE   = process.env.BACKUP_REMOTE_URL || '';
const BACKUP_BRANCH   = process.env.BACKUP_REMOTE_BRANCH || 'main';

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.replace('--','').split('=')),
);
const PROVIDER = args.provider || process.env.AIOS_IDE_PROVIDER || 'unknown';
const REASON   = args.reason   || 'precompact';

// ─── Helpers ───────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 30000, ...opts }).trim();
  } catch (e) {
    return opts.fallback ?? '';
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function isoNow() { return new Date().toISOString(); }

function listDir(dirPath, ext = '') {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
      .filter(f => !ext || f.endsWith(ext))
      .filter(f => !f.startsWith('.'));
  } catch (_) { return []; }
}

function listDirRecursive(dirPath, maxDepth = 3) {
  const results = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, depth + 1);
        else results.push(path.relative(PROJECT_ROOT, full));
      }
    } catch (_) {}
  }
  walk(dirPath, 0);
  return results;
}

function readYamlField(filePath, field) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    return match ? match[1].trim() : null;
  } catch (_) { return null; }
}

// ─── Git Data ──────────────────────────────────────────────────────────────

function collectGitData() {
  const status   = run('git status --short');
  const branch   = run('git rev-parse --abbrev-ref HEAD', { fallback: 'main' });
  const lastHash = run('git rev-parse --short HEAD',      { fallback: 'unknown' });
  const lastMsg  = run('git log -1 --pretty=%s',          { fallback: '—' });
  const recentLog = run('git log --oneline -10',          { fallback: '' });
  const stagedFiles = run('git diff --cached --name-only', { fallback: '' });

  const modifiedFiles = status.split('\n').filter(Boolean)
    .map(l => `| \`${l.slice(3)}\` | ${statusLabel(l.slice(0,2).trim())} |`)
    .join('\n') || '| — | — |';

  return { status, branch, lastHash, lastMsg, recentLog, modifiedFiles, stagedFiles };
}

function statusLabel(code) {
  const map = { M: 'Modificado', A: 'Adicionado', D: 'Deletado', R: 'Renomeado', '?': 'Não rastreado' };
  return map[code[0]] || code;
}

// ─── Agents Inventory ──────────────────────────────────────────────────────

function collectAgents() {
  const sources = {
    'Canônicos (.aios-core/development/agents)': path.join(PROJECT_ROOT, '.aios-core', 'development', 'agents'),
    'Claude Code (.claude/commands/AIOS/agents)': path.join(PROJECT_ROOT, '.claude', 'commands', 'AIOS', 'agents'),
    'Claude Code (.claude/agents)':              path.join(PROJECT_ROOT, '.claude', 'agents'),
    'Codex (.codex/agents)':                     path.join(PROJECT_ROOT, '.codex', 'agents'),
    'Gemini (.gemini/rules/AIOS/agents)':        path.join(PROJECT_ROOT, '.gemini', 'rules', 'AIOS', 'agents'),
    'GitHub (.github/agents)':                   path.join(PROJECT_ROOT, '.github', 'agents'),
    'Antigravity (.antigravity/rules/agents)':   path.join(PROJECT_ROOT, '.antigravity', 'rules', 'agents'),
  };

  const rows = [];
  for (const [label, dir] of Object.entries(sources)) {
    const files = listDir(dir, '.md');
    if (files.length) {
      rows.push(`\n### ${label}\n`);
      files.forEach(f => rows.push(`- \`${f.replace('.md', '')}\``));
    }
  }
  return rows.join('\n') || '_Nenhum agente encontrado_';
}

// ─── Squads Inventory ──────────────────────────────────────────────────────

function collectSquads() {
  const squadsDir = path.join(PROJECT_ROOT, 'squads');
  const rows = [];

  try {
    const squads = fs.readdirSync(squadsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.endsWith('.tar') && !e.name.endsWith('.tar.1'));

    for (const squad of squads) {
      const squadPath = path.join(squadsDir, squad.name);
      const yamlPath  = path.join(squadPath, 'squad.yaml');
      const name    = readYamlField(yamlPath, 'name')        || squad.name;
      const purpose = readYamlField(yamlPath, 'purpose')     || readYamlField(yamlPath, 'description') || '—';
      const agentsDir = path.join(squadPath, 'agents');
      const agentCount = listDir(agentsDir).length || listDir(agentsDir, '.md').length || listDir(agentsDir, '.yaml').length;

      rows.push(`| \`${squad.name}\` | ${name} | ${agentCount} agentes | ${purpose.slice(0, 60)}${purpose.length > 60 ? '…' : ''} |`);
    }
  } catch (_) {}

  if (!rows.length) return '_Nenhum squad encontrado_';

  return [
    '| Diretório | Nome | Agentes | Propósito |',
    '|-----------|------|---------|-----------|',
    ...rows,
  ].join('\n');
}

// ─── MCPs Inventory ────────────────────────────────────────────────────────

function collectMCPs() {
  const sections = [];

  // 1. Global Claude config (~/.claude.json)
  const globalClaude = path.join(process.env.HOME || '/root', '.claude.json');
  if (fs.existsSync(globalClaude)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(globalClaude, 'utf8'));
      const servers = Object.keys(cfg.mcpServers || {});
      if (servers.length) {
        sections.push('**Global Claude Code (~/.claude.json):**');
        servers.forEach(s => sections.push(`- \`${s}\``));
      }
    } catch (_) {}
  }

  // 2. Project MCP config (.claude/mcp.json)
  const projectMcp = path.join(PROJECT_ROOT, '.claude', 'mcp.json');
  if (fs.existsSync(projectMcp)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(projectMcp, 'utf8'));
      const servers = Object.keys(cfg.mcpServers || cfg.servers || {});
      if (servers.length) {
        sections.push('\n**Projeto (.claude/mcp.json):**');
        servers.forEach(s => sections.push(`- \`${s}\``));
      }
    } catch (_) {}
  }

  // 3. core-config.yaml MCP section
  const coreConfig = path.join(PROJECT_ROOT, '.aios-core', 'core-config.yaml');
  if (fs.existsSync(coreConfig)) {
    try {
      const content = fs.readFileSync(coreConfig, 'utf8');
      const mcpEnabled = content.match(/^  enabled:\s*(.+)$/m);
      const dockerEnabled = content.match(/enabled:\s*(true|false)/g);
      if (mcpEnabled) {
        sections.push(`\n**core-config.yaml:**`);
        sections.push(`- MCP habilitado: \`${mcpEnabled[1]}\``);
        const dockerMatch = content.match(/docker_mcp[\s\S]{0,200}enabled:\s*(true|false)/);
        if (dockerMatch) sections.push(`- Docker MCP: \`${dockerMatch[1]}\``);
      }
    } catch (_) {}
  }

  // 4. MCP core module files
  const mcpCore = path.join(PROJECT_ROOT, '.aios-core', 'core', 'mcp');
  const mcpFiles = listDir(mcpCore, '.js');
  if (mcpFiles.length) {
    sections.push(`\n**Módulos MCP (.aios-core/core/mcp):**`);
    mcpFiles.forEach(f => sections.push(`- \`${f}\``));
  }

  return sections.join('\n') || '_Nenhum MCP configurado_';
}

// ─── Skills Inventory ──────────────────────────────────────────────────────

function collectSkills() {
  const rows = [];

  // Codex skills
  const codexSkillsDir = path.join(PROJECT_ROOT, '.codex', 'skills');
  const codexSkills = listDir(codexSkillsDir);
  if (codexSkills.length) {
    rows.push('**Codex Skills (.codex/skills):**');
    codexSkills.forEach(skill => {
      const skillMd = path.join(codexSkillsDir, skill, 'SKILL.md');
      const desc = fs.existsSync(skillMd)
        ? (fs.readFileSync(skillMd, 'utf8').match(/^description:\s*(.+)$/m) || [])[1]?.slice(0, 60) || '—'
        : '—';
      rows.push(`- \`${skill}\` — ${desc}`);
    });
  }

  // Claude commands (slash commands)
  const claudeCommands = path.join(PROJECT_ROOT, '.claude', 'commands', 'AIOS');
  try {
    const commandDirs = fs.readdirSync(claudeCommands, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name !== 'agents');
    if (commandDirs.length) {
      rows.push('\n**Claude Code Commands (.claude/commands/AIOS):**');
      commandDirs.forEach(d => rows.push(`- \`${d.name}/\``));
    }
  } catch (_) {}

  return rows.join('\n') || '_Nenhuma skill encontrada_';
}

// ─── Hooks Inventory ───────────────────────────────────────────────────────

function collectHooks() {
  const rows = [];

  const hookDirs = {
    'Claude Code (.claude/hooks)':       path.join(PROJECT_ROOT, '.claude', 'hooks'),
    'Gemini (.aios-core/hooks/gemini)':  path.join(PROJECT_ROOT, '.aios-core', 'hooks', 'gemini'),
    'Unified Runners':                   path.join(PROJECT_ROOT, '.aios-core', 'hooks', 'unified', 'runners'),
    'Git Hooks (.aios-core/hooks)':      path.join(PROJECT_ROOT, '.aios-core', 'hooks'),
  };

  for (const [label, dir] of Object.entries(hookDirs)) {
    const files = listDir(dir).filter(f => f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.py') || f.endsWith('.sh'));
    if (files.length) {
      rows.push(`\n**${label}:**`);
      files.forEach(f => rows.push(`- \`${f}\``));
    }
  }

  return rows.join('\n') || '_Nenhum hook encontrado_';
}

// ─── Session Activity ──────────────────────────────────────────────────────

function collectSessionActivity() {
  const sessionFilesPath = path.join(PROJECT_ROOT, '.aios', 'session-files.json');
  let sessionFiles = [];
  if (fs.existsSync(sessionFilesPath)) {
    try { sessionFiles = JSON.parse(fs.readFileSync(sessionFilesPath, 'utf8')); } catch (_) {}
  }

  const sessionLogPath = path.join(PROJECT_ROOT, '.aios', 'logs', 'session.jsonl');
  let agentsActivated = [], mcpsUsed = [], skillsCreated = [];
  if (fs.existsSync(sessionLogPath)) {
    try {
      fs.readFileSync(sessionLogPath, 'utf8').split('\n').filter(Boolean).forEach(line => {
        try {
          const e = JSON.parse(line);
          if (e.type === 'agent_activated') agentsActivated.push(e.agent);
          if (e.type === 'mcp_called')      mcpsUsed.push(e.mcp);
          if (e.type === 'skill_created')   skillsCreated.push(e.skill);
        } catch (_) {}
      });
    } catch (_) {}
  }

  return {
    sessionFiles,
    agentsActivated: [...new Set(agentsActivated)],
    mcpsUsed:        [...new Set(mcpsUsed)],
    skillsCreated,
  };
}

// ─── Report Generator ──────────────────────────────────────────────────────

function generateReport({ git, agents, squads, mcps, skills, hooks, session, ts }) {
  const reasonLabel = {
    precompact: 'Contexto próximo do limite (PreCompact hook automático)',
    manual:     'Backup manual solicitado pelo agente',
    stop:       'Fim de sessão (Stop hook)',
  }[REASON] || REASON;

  const backupTarget = BACKUP_REMOTE
    ? BACKUP_REMOTE.replace(/ghp_[^@]+@/, '***@')
    : '_não configurado_';

  return `# AIOS Session Backup Report

> **Gerado em:** ${isoNow()}
> **Provider/IDE:** \`${PROVIDER}\`
> **Motivo:** ${reasonLabel}
> **Branch:** \`${git.branch}\`
> **Último commit:** \`${git.lastHash}\` — ${git.lastMsg}
> **Backup remoto:** ${backupTarget}

---

## Estado do Repositório

| Arquivo | Status |
|---------|--------|
${git.modifiedFiles}

### Commits Recentes
\`\`\`
${git.recentLog || '—'}
\`\`\`

---

## Atividade desta Sessão

### Agentes Ativados na Sessão
${session.agentsActivated.length
  ? session.agentsActivated.map(a => `- ${a}`).join('\n')
  : '_Não rastreados (ative o session logger para rastrear)_'}

### MCPs Utilizados na Sessão
${session.mcpsUsed.length
  ? session.mcpsUsed.map(m => `- ${m}`).join('\n')
  : '_Não rastreados_'}

### Skills Criadas na Sessão
${session.skillsCreated.length
  ? session.skillsCreated.map(s => `- ${s}`).join('\n')
  : '_Nenhuma criada nesta sessão_'}

### Arquivos Modificados na Sessão
${session.sessionFiles.length
  ? session.sessionFiles.map(f => `- \`${f}\``).join('\n')
  : '_Log de sessão indisponível — verifique git diff_'}

---

## Inventário Completo do Projeto

### Agentes

${agents}

---

### Squads

${squads}

---

### MCPs (Model Context Protocol)

${mcps}

---

### Skills & Commands

${skills}

---

### Hooks

${hooks}

---

## Como Retomar em Nova Sessão

\`\`\`
Arquivo de retomada: .aios/session-reports/session-${ts}.md
Branch: ${git.branch}
Último commit: ${git.lastHash}
Backup: ${backupTarget}
\`\`\`

Mensagem para nova sessão:
> "Retome o trabalho a partir do relatório de sessão em
>  \`.aios/session-reports/session-${ts}.md\`.
>  Branch: \`${git.branch}\`, último commit: \`${git.lastHash}\`"

---

_AIOS Session Backup v2.0 — gerado automaticamente pelo low-token safety hook_
_Providers: Claude Code (PreCompact) | Gemini CLI (manual) | Codex CLI (manual)_
`;
}

// ─── Git Push ──────────────────────────────────────────────────────────────

function pushToBackup(ts) {
  if (!BACKUP_REMOTE) {
    console.log('[session-backup] BACKUP_REMOTE_URL não configurado — pulando push remoto.');
    return false;
  }

  if (!GITHUB_TOKEN) {
    console.log('[session-backup] GITHUB_TOKEN não configurado — pulando push remoto.');
    return false;
  }

  // Build authenticated URL
  const authUrl = BACKUP_REMOTE.replace('https://', `https://${GITHUB_TOKEN}@`);
  const remoteName = `_backup_${ts}`;

  try {
    run(`git remote add ${remoteName} "${authUrl}"`);
    run(`git push ${remoteName} ${git.branch || 'main'}:${BACKUP_BRANCH}`, { stdio: 'pipe' });
    console.log(`[session-backup] Push OK → ${BACKUP_REMOTE.replace(/ghp_[^@]+@/, '***@')}`);
    return true;
  } catch (e) {
    console.error('[session-backup] Push falhou:', e.message?.split('\n')[0]);
    return false;
  } finally {
    run(`git remote remove ${remoteName}`, { fallback: null });
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

let git; // make available to pushToBackup

async function main() {
  const ts = timestamp();
  git = collectGitData();

  console.log('[session-backup] Coletando inventário do projeto...');
  const agents  = collectAgents();
  const squads  = collectSquads();
  const mcps    = collectMCPs();
  const skills  = collectSkills();
  const hooks   = collectHooks();
  const session = collectSessionActivity();

  // 1. Ensure reports directory
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // 2. Write report
  const reportFile = path.join(REPORTS_DIR, `session-${ts}.md`);
  const report = generateReport({ git, agents, squads, mcps, skills, hooks, session, ts });
  fs.writeFileSync(reportFile, report);
  console.log(`[session-backup] Relatório salvo: ${path.relative(PROJECT_ROOT, reportFile)}`);

  // 3. Git add + commit
  const relReport = path.relative(PROJECT_ROOT, reportFile);
  run(`git add "${relReport}"`);
  if (git.status) run('git add -A');

  const commitMsg = `chore(session-backup): auto-backup [${PROVIDER}] ${ts} — ${REASON}`;
  const committed = run(`git commit -m "${commitMsg}"`, { fallback: null });
  if (committed === null) {
    console.log('[session-backup] Nada novo para commitar — relatório salvo localmente.');
  } else {
    console.log(`[session-backup] Commit: ${commitMsg}`);
  }

  // 4. Push to backup remote
  const pushed = pushToBackup(ts);

  // 5. User-facing warning
  const divider = '═'.repeat(62);
  console.log(`
${divider}
⚠️  AVISO: LIMITE DE CONTEXTO PRÓXIMO
${divider}

📄 Relatório salvo em:
   .aios/session-reports/session-${ts}.md

${pushed
  ? `🔒 Backup enviado para GitHub:\n   ${BACKUP_REMOTE}`
  : `⚠️  Backup local apenas (configure GITHUB_TOKEN + BACKUP_REMOTE_URL no .env)`}

💡 Para continuar em nova sessão, diga:
   "Retome a partir do relatório session-${ts}.md"

${divider}
`);
}

main().catch(err => {
  console.error('[session-backup] Erro fatal:', err.message);
  process.exit(1);
});
