# STORY: Core Module Creation

**ID:** 2.2 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 5 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-11-28
**Status:** 📋 Ready for Development

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)

---

## 📊 User Story

**Como** arquiteto, **Quero** criar module `core/`, **Para** centralizar framework essentials

---

## ✅ Acceptance Criteria

- [ ] Directory structure created matching ADR-002
- [ ] 22 files migrated to correct locations
- [ ] All imports updated (relative paths)
- [ ] `require('./.aios-core/core')` works
- [ ] No circular dependencies introduced
- [ ] Smoke tests pass (CORE-01 to CORE-07)

---

## 🔧 Scope (per ADR-002)

```
.aios-core/core/
├── config/                     # Configuration system
│   ├── config-loader.js        # from scripts/
│   └── config-cache.js         # from scripts/
├── data/                       # Knowledge base and patterns
│   ├── aios-kb.md              # from data/
│   ├── workflow-patterns.yaml  # from data/
│   └── agent-config-requirements.yaml
├── docs/                       # Core documentation
│   ├── component-creation-guide.md
│   ├── session-update-pattern.md
│   ├── SHARD-TRANSLATION-GUIDE.md
│   ├── template-syntax.md
│   └── troubleshooting-guide.md
├── elicitation/                # Interactive prompting engine
│   ├── elicitation-engine.js   # from scripts/
│   ├── session-manager.js      # from scripts/elicitation-session-manager.js
│   ├── agent-elicitation.js    # from elicitation/
│   ├── task-elicitation.js     # from elicitation/
│   └── workflow-elicitation.js # from elicitation/
├── session/                    # Runtime state management
│   ├── context-loader.js       # from scripts/session-context-loader.js
│   └── context-detector.js     # from scripts/
├── utils/                      # Core utilities
│   ├── output-formatter.js     # from scripts/
│   └── yaml-validator.js       # from scripts/
├── index.js                    # Core exports (from root)
├── index.esm.js                # ESM entry (from root)
└── index.d.ts                  # TypeScript defs (from root)
```

---

## 📋 Tasks

- [ ] 2.2.1: Create directory structure (1h)
- [ ] 2.2.2: Migrate config/ files (2h)
- [ ] 2.2.3: Migrate data/ files (1h)
- [ ] 2.2.4: Migrate docs/ files (1h)
- [ ] 2.2.5: Migrate elicitation/ files (2h)
- [ ] 2.2.6: Migrate session/ files (1h)
- [ ] 2.2.7: Migrate utils/ files (1h)
- [ ] 2.2.8: Create index.js exports (1h)
- [ ] 2.2.9: Update all imports referencing moved files (2h)
- [ ] 2.2.10: Run validation scripts (1h)
- [ ] 2.2.11: Run regression tests CORE-01 to CORE-07 (1h)

**Total:** 14h

---

## ⚠️ Dependency Violations to Fix

From [ADR-002-dependency-matrix.md](../../architecture/decisions/ADR-002-dependency-matrix.md):

| Violation | Current | Solution |
|-----------|---------|----------|
| `elicitation-engine.js` → `security-checker.js` | core → infrastructure | Make security check optional or create minimal core validator |

---

## 🔗 Dependencies

**Depends on:** [Story 2.1](./story-2.1-module-structure-design.md) ✅ Done
**Blocks:** [Story 2.3](./story-2.3-development-module.md), [Story 2.5](./story-2.5-infrastructure-module.md), Story 2.6

---

## 📋 Rollback Plan

Per [ADR-002-regression-tests.md](../../architecture/decisions/ADR-002-regression-tests.md):

| Condition | Action |
|-----------|--------|
| Any P0 test fails (CORE-01, CORE-03, CORE-04, CORE-07) | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |

```bash
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/core/` directory structure
- `.aios-core/core/index.js` (exports)
- `.aios-core/core/README.md` (per Aria's recommendation)

**To Move:**
- 22 files as specified in ADR-002

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-28
