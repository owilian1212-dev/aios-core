# STORY: Product Module Creation

**ID:** 2.4 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 3 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-11-28
**Status:** 📋 Ready for Development

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)

---

## 📊 User Story

**Como** PM/PO, **Quero** module `product/`, **Para** acessar templates e checklists

---

## ✅ Acceptance Criteria

- [ ] Directory structure created matching ADR-002
- [ ] 67+ files migrated to correct locations
- [ ] Templates load correctly
- [ ] Checklists parse correctly
- [ ] No runtime dependencies on other modules
- [ ] Smoke tests pass (PROD-01 to PROD-05)

---

## 🔧 Scope (per ADR-002)

```
.aios-core/product/
├── templates/                  # 52+ document templates
│   ├── story-tmpl.yaml
│   ├── prd-tmpl.yaml
│   ├── adr-tmpl.md
│   ├── epic-tmpl.md
│   ├── ide-rules/              # 9 IDE-specific rule files
│   └── ... (52+ total)
├── checklists/                 # 6 validation checklists
│   ├── story-dod-checklist.md
│   ├── po-master-checklist.md
│   ├── pre-push-checklist.md
│   ├── release-checklist.md
│   ├── change-checklist.md
│   └── qa-checklist.md
└── data/                       # PM-specific data files
    ├── brainstorming-techniques.md
    ├── elicitation-methods.md
    ├── mode-selection-best-practices.md
    ├── test-levels-framework.md
    ├── test-priorities-matrix.md
    └── technical-preferences.md
```

---

## 📋 Tasks

- [ ] 2.4.1: Create directory structure (1h)
- [ ] 2.4.2: Migrate templates/ (52+ files including ide-rules/) (2h)
- [ ] 2.4.3: Migrate checklists/ (6 files) (1h)
- [ ] 2.4.4: Migrate data/ PM files (6 files) (1h)
- [ ] 2.4.5: Update any references to template paths (1h)
- [ ] 2.4.6: Run validation scripts (1h)
- [ ] 2.4.7: Run regression tests PROD-01 to PROD-05 (1h)

**Total:** 8h

---

## ⚠️ Dependency Violations to Fix

**None identified.** Product module should have NO runtime dependencies on other modules.

Templates and checklists are loaded as static files, not executed.

---

## 🔗 Dependencies

**Depends on:** [Story 2.1](./story-2.1-module-structure-design.md) ✅ Done

**Can run in parallel with:** [Story 2.2](./story-2.2-core-module.md) (no dependencies)

**Blocks:** Story 2.6 (Service Registry)

---

## 📋 Rollback Plan

Per [ADR-002-regression-tests.md](../../architecture/decisions/ADR-002-regression-tests.md):

| Condition | Action |
|-----------|--------|
| Any P0 test fails (PROD-01, PROD-02, PROD-03) | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |

```bash
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/product/` directory structure
- `.aios-core/product/README.md` (per Aria's recommendation)

**To Move:**
- 67+ files as specified in ADR-002

---

## 📝 Notes

- This module contains **static assets only** (no executable code)
- Templates are YAML/Markdown files loaded by other modules
- Checklists are Markdown files with checkbox syntax
- Data files are reference documentation

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-28
