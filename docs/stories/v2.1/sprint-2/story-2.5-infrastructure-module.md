# STORY: Infrastructure Module Creation

**ID:** 2.5 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 5 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-11-28
**Status:** 📋 Ready for Development

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)

---

## 📊 User Story

**Como** developer, **Quero** module `infrastructure/`, **Para** acessar tools, integrations, scripts

---

## ✅ Acceptance Criteria

- [ ] Directory structure created matching ADR-002
- [ ] 65+ files migrated to correct locations
- [ ] All imports updated (relative paths)
- [ ] Git operations work
- [ ] PM adapters work
- [ ] Tool resolver works
- [ ] Smoke tests pass (INFRA-01 to INFRA-07)

---

## 🔧 Scope (per ADR-002)

```
.aios-core/infrastructure/
├── tools/                      # 12 tool configurations
│   └── ... (all from tools/)
├── scripts/                    # 45+ system scripts
│   ├── pm-adapter.js
│   ├── pm-adapter-factory.js
│   ├── git-wrapper.js
│   ├── git-config-detector.js
│   ├── branch-manager.js
│   ├── security-checker.js
│   ├── template-engine.js
│   ├── component-generator.js
│   ├── dependency-analyzer.js
│   ├── performance-tracker.js
│   ├── test-generator.js
│   └── ... (45+ total)
├── tests/                      # Test utilities
│   └── regression-suite-v2.md
└── integrations/               # External integrations
    └── pm-adapters/            # 5 PM adapter files
        ├── clickup-adapter.js
        ├── github-adapter.js
        ├── jira-adapter.js
        ├── local-adapter.js
        └── index.js
```

---

## 📋 Tasks

- [ ] 2.5.1: Create directory structure (1h)
- [ ] 2.5.2: Migrate tools/ (12 files) (1h)
- [ ] 2.5.3: Migrate scripts/ (45+ files) (4h)
- [ ] 2.5.4: Migrate tests/ (1h)
- [ ] 2.5.5: Migrate integrations/pm-adapters/ (5 files) (1h)
- [ ] 2.5.6: Update all imports referencing moved files (3h)
- [ ] 2.5.7: Test PM adapter factory (1h)
- [ ] 2.5.8: Run validation scripts (1h)
- [ ] 2.5.9: Run regression tests INFRA-01 to INFRA-07 (1h)

**Total:** 14h

---

## ⚠️ Dependency Violations to Fix

**None identified.** Infrastructure module is at the bottom of the dependency hierarchy.

It CAN depend on core/, development/, and product/, but nothing else depends on it.

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
| Any P0 test fails (INFRA-01, INFRA-02, INFRA-03) | Immediate rollback |
| Git operations broken | Immediate rollback |
| PM adapters broken | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |

```bash
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/infrastructure/` directory structure
- `.aios-core/infrastructure/README.md` (per Aria's recommendation)

**To Move:**
- 65+ files as specified in ADR-002

---

## 📝 Notes

- Infrastructure module is at the BOTTOM of the dependency hierarchy
- It provides system-level functionality used by other modules
- Contains PM adapters for ClickUp, GitHub, Jira integration
- Git wrapper and branch management tools
- Security and performance utilities

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-28
