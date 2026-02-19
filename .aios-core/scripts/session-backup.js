#!/usr/bin/env node
/**
 * AIOS Session Backup — Low Token Safety Net
 *
 * Triggered automatically before context runs out (PreCompact hook)
 * or manually by any IDE agent when approaching token limit.
 *
 * Actions:
 *   1. Generate session report (.aios/session-reports/session-{ts}.md)
 *   2. git add + commit + push (backup to GitHub)
 *   3. Print warning notice for the user
 *
 * Usage:
 *   node .aios-core/scripts/session-backup.js [--provider=claude|gemini|codex] [--reason=precompact|manual]
 *
 * Exit codes:
 *   0 = success
 *   1 = git push failed (report still saved locally)
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, '.aios', 'session-reports');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace('--', '').split('=')),
);
const PROVIDER = args.provider || process.env.AIOS_IDE_PROVIDER || 'unknown';
const REASON   = args.reason   || 'precompact';

// ─── Helpers ───────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf8', ...opts }).trim();
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

// ─── Data Collection ───────────────────────────────────────────────────────

function collectGitData() {
  const status   = run('git status --short');
  const branch   = run('git rev-parse --abbrev-ref HEAD', { fallback: 'main' });
  const lastHash = run('git rev-parse --short HEAD', { fallback: 'unknown' });
  const lastMsg  = run('git log -1 --pretty=%s', { fallback: '—' });

  // Files changed this session (since last push or last 50 commits max)
  const recentLog = run('git log --oneline -10', { fallback: '' });

  // Staged + unstaged changes
  const modifiedFiles = status
    .split('\n')
    .filter(Boolean)
    .map((l) => `- \`${l.slice(3)}\` (${l.slice(0,2).trim()})`)
    .join('\n') || '_Nenhum arquivo pendente_';

  return { status, branch, lastHash, lastMsg, recentLog, modifiedFiles };
}

function collectSessionData() {
  // Try to read session files tracked by before-tool hooks
  const sessionFilesPath = path.join(PROJECT_ROOT, '.aios', 'session-files.json');
  let sessionFiles = [];
  if (fs.existsSync(sessionFilesPath)) {
    try { sessionFiles = JSON.parse(fs.readFileSync(sessionFilesPath, 'utf8')); }
    catch (_) {}
  }

  // Try to read session log for agents activated
  const sessionLogPath = path.join(PROJECT_ROOT, '.aios', 'logs', 'session.jsonl');
  let agentsActivated = [];
  let mcpsUsed = [];
  let skillsCreated = [];
  if (fs.existsSync(sessionLogPath)) {
    try {
      const lines = fs.readFileSync(sessionLogPath, 'utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type === 'agent_activated') agentsActivated.push(entry.agent);
          if (entry.type === 'mcp_called')      mcpsUsed.push(entry.mcp);
          if (entry.type === 'skill_created')   skillsCreated.push(entry.skill);
        } catch (_) {}
      }
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

function generateReport(git, session, ts) {
  const reasonLabel = {
    precompact: 'Contexto próximo do limite (PreCompact hook)',
    manual:     'Backup manual solicitado pelo agente',
    stop:       'Fim de sessão (Stop hook)',
  }[REASON] || REASON;

  const agentsList = session.agentsActivated.length
    ? session.agentsActivated.map((a) => `- ${a}`).join('\n')
    : '_Nenhum agente registrado nesta sessão_';

  const mcpsList = session.mcpsUsed.length
    ? session.mcpsUsed.map((m) => `- ${m}`).join('\n')
    : '_Nenhum MCP utilizado_';

  const skillsList = session.skillsCreated.length
    ? session.skillsCreated.map((s) => `- ${s}`).join('\n')
    : '_Nenhuma skill criada_';

  return `# Session Backup Report

> **Gerado em:** ${isoNow()}
> **Provider/IDE:** ${PROVIDER}
> **Motivo:** ${reasonLabel}
> **Branch:** ${git.branch}
> **Último commit:** \`${git.lastHash}\` — ${git.lastMsg}

---

## Estado do Repositório

${git.modifiedFiles}

## Commits Recentes

\`\`\`
${git.recentLog || '—'}
\`\`\`

---

## Atividade da Sessão

### Agentes Ativados
${agentsList}

### MCPs Utilizados
${mcpsList}

### Skills Criadas
${skillsList}

### Arquivos Modificados na Sessão
${session.sessionFiles.length
  ? session.sessionFiles.map((f) => `- \`${f}\``).join('\n')
  : '_Não rastreados (log de sessão indisponível)_'}

---

## Ação Necessária

⚠️ **O contexto desta sessão está próximo do limite.**
Retome a conversa em uma nova sessão referenciando este relatório:

\`\`\`
Arquivo de retomada: .aios/session-reports/session-${ts}.md
Branch: ${git.branch}
Último hash: ${git.lastHash}
\`\`\`

---

_AIOS Session Backup — gerado automaticamente pelo low-token safety hook_
`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const ts  = timestamp();
  const git = collectGitData();
  const session = collectSessionData();

  // 1. Ensure reports directory exists
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // 2. Write report
  const reportFile = path.join(REPORTS_DIR, `session-${ts}.md`);
  const report = generateReport(git, session, ts);
  fs.writeFileSync(reportFile, report);
  console.log(`[session-backup] Report saved: ${reportFile}`);

  // 3. Git add + commit
  const relReport = path.relative(PROJECT_ROOT, reportFile);
  run(`git add "${relReport}"`);

  // Also add any staged changes that were pending
  if (git.status) {
    run('git add -A');
  }

  const commitMsg = `chore(session-backup): auto-backup before context limit [${PROVIDER}] ${ts}`;
  const committed = run(`git commit -m "${commitMsg}"`, { fallback: null });
  if (committed === null) {
    console.log('[session-backup] Nothing to commit — report already saved locally.');
  } else {
    console.log(`[session-backup] Committed: ${commitMsg}`);
  }

  // 4. Git push
  try {
    run('git push', { stdio: 'inherit' });
    console.log('[session-backup] Pushed to GitHub successfully.');
  } catch (e) {
    console.error('[session-backup] Push failed — report saved locally only.');
    console.error('[session-backup] Run: git push   to backup manually.');
    process.exit(1);
  }

  // 5. Print user-facing warning
  const divider = '═'.repeat(60);
  console.log(`
${divider}
⚠️  AVISO: LIMITE DE CONTEXTO PRÓXIMO
${divider}

📄 Relatório salvo em:
   .aios/session-reports/session-${ts}.md

🔒 Backup realizado no GitHub (branch: ${git.branch})

💡 Para continuar o trabalho em nova sessão:
   "Retome a partir do relatório .aios/session-reports/session-${ts}.md"

${divider}
`);
}

main().catch((err) => {
  console.error('[session-backup] Fatal error:', err.message);
  process.exit(1);
});
