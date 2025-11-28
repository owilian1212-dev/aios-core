# STORY: Development Module Creation

**ID:** 2.3 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 8 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-11-28
**Status:** 📋 Ready for Development

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)

---

## 📊 User Story

**Como** developer, **Quero** module `development/`, **Para** acessar agents, tasks, workflows

---

## ✅ Acceptance Criteria

- [ ] Directory structure created matching ADR-002
- [ ] 248+ files migrated to correct locations
- [ ] All imports updated (relative paths)
- [ ] Agent activation works (`@dev`, `@qa`, etc.)
- [ ] Task execution works
- [ ] Workflow navigation works
- [ ] Smoke tests pass (DEV-01 to DEV-09)

---

## 🔧 Scope (per ADR-002)

```
.aios-core/development/
├── agents/                     # 16 agent definitions
│   ├── dev.md
│   ├── qa.md
│   ├── architect.md
│   ├── pm.md
│   ├── po.md
│   ├── sm.md
│   ├── analyst.md
│   ├── ux-expert.md
│   ├── devops.md
│   ├── aios-master.md
│   ├── aios-developer.md
│   ├── aios-installer.md
│   └── ... (16 total)
├── agent-teams/                # 5 team configurations (keep name per Aria)
│   └── ... (5 configs)
├── tasks/                      # 120+ task definitions
│   └── ... (all from tasks/)
├── workflows/                  # 7 workflow definitions
│   └── ... (all from workflows/)
└── scripts/                    # 24 agent-related scripts
    ├── agent-assignment-resolver.js
    ├── agent-config-loader.js
    ├── agent-exit-hooks.js
    ├── generate-greeting.js
    ├── greeting-builder.js
    ├── greeting-preference-manager.js
    ├── story-manager.js
    ├── story-update-hook.js
    ├── story-index-generator.js
    ├── backlog-manager.js
    ├── decision-recorder.js
    ├── workflow-navigator.js
    └── ... (24 total)
```

---

## 📋 Tasks

- [ ] 2.3.1: Create directory structure (1h)
- [ ] 2.3.2: Migrate agents/ (16 files) (2h)
- [ ] 2.3.3: Migrate agent-teams/ (5 files) (1h)
- [ ] 2.3.4: Migrate tasks/ (120+ files) (3h)
- [ ] 2.3.5: Migrate workflows/ (7 files) (1h)
- [ ] 2.3.6: Migrate scripts/ (24 files) (3h)
- [ ] 2.3.7: Update all imports referencing moved files (3h)
- [ ] 2.3.8: Test agent activation for all 16 agents (2h)
- [ ] 2.3.9: Run validation scripts (1h)
- [ ] 2.3.10: Run regression tests DEV-01 to DEV-09 (2h)

**Total:** 19h

---

## ⚠️ Dependency Violations to Fix

From [ADR-002-dependency-matrix.md](../../architecture/decisions/ADR-002-dependency-matrix.md):

| Violation | Current | Solution |
|-----------|---------|----------|
| `agent-config-loader.js` → `performance-tracker.js` | dev → infra | Make performance tracking optional/injectable |
| `greeting-builder.js` → `git-config-detector.js` | dev → infra | Inject as optional dependency |
| `greeting-builder.js` → `project-status-loader.js` | dev → infra | Inject as optional dependency |

---

## 🔗 Dependencies

**Depends on:**
- [Story 2.1](./story-2.1-module-structure-design.md) ✅ Done
- [Story 2.2](./story-2.2-core-module.md) (core/ must exist first)

**Blocks:** Story 2.6 (Service Registry)

---

## 📋 Rollback Plan

Per [ADR-002-regression-tests.md](../../architecture/decisions/ADR-002-regression-tests.md):

| Condition | Action |
|-----------|--------|
| Any P0 test fails (DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-07) | Immediate rollback |
| Agent activation broken | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |

```bash
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/development/` directory structure
- `.aios-core/development/README.md` (per Aria's recommendation)

**To Move:**
- 248+ files as specified in ADR-002

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-28
