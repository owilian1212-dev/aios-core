# Story SQS-11: Squad Analyze & Extend - Continuous Squad Improvement

<!-- Source: Epic SQS - Squad System Enhancement -->
<!-- Context: Gap analysis identified missing analyze/improve capabilities -->
<!-- Architecture: Extension of SQS-4 (Squad Creator Agent) -->

## Status: Approved

**PO Approval:** 2025-12-26 by @po (Pax)
**Priority:** High
**Sprint:** 14
**Effort Estimate:** 28-38 hours

## Story

**As an** AIOS developer with existing squads,
**I want** to analyze my squads and incrementally add new components (agents, tasks, templates, tools, etc.),
**so that** I can continuously improve my squads without recreating them from scratch.

## Problem Statement

### Current Workflow Gap

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQUAD LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DESIGN       *design-squad            ✅ Covered (SQS-9)   │
│       ↓                                                         │
│  2. CREATE       *create-squad            ✅ Covered (SQS-4)   │
│       ↓                                                         │
│  3. VALIDATE     *validate-squad          ✅ Covered (SQS-3)   │
│       ↓                                                         │
│  4. IMPROVE      ??? (MISSING)            ❌ GAP               │
│       ↓                                                         │
│  5. DISTRIBUTE   *publish-squad           ⏳ Placeholder       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Issues

1. **No way to analyze** what an existing squad contains
2. **No guided workflow** to add new components incrementally
3. **Manual process** prone to errors (forget to update squad.yaml)
4. **No traceability** linking changes to official stories
5. **No coverage metrics** to understand what's missing

### Current (Problematic) Workflow

```
User: "I want to add a new agent to my existing squad"

1. User manually creates agent file in agents/
2. User manually updates squad.yaml components.agents[]
3. User runs *validate-squad (might fail)
4. User manually fixes issues
5. No documentation of what was added
6. No link to any story
```

### Desired Workflow (With New Tasks)

```
User: "I want to add a new agent to my existing squad"

1. User runs *analyze-squad my-squad
   → Shows current structure, components, coverage, suggestions

2. User runs *extend-squad my-squad
   → Interactive: "What would you like to add?"
   → Options: agent, task, template, tool, workflow, checklist, script, data
   → Guided creation with templates
   → Automatic squad.yaml update
   → Automatic validation

3. Optionally links to story via --story SQS-XX flag
```

## Acceptance Criteria

### AC1: Analyze Squad - Basic Inventory
- [ ] `*analyze-squad {name}` shows squad overview (name, version, author)
- [ ] Lists all existing components by type (agents, tasks, templates, etc.)
- [ ] Shows component count per category
- [ ] Displays squad.yaml configuration

### AC2: Analyze Squad - Coverage Metrics
- [ ] Shows coverage percentage for each directory (empty vs. populated)
- [ ] Identifies agents without corresponding tasks
- [ ] Identifies empty directories (workflows/, checklists/, etc.)
- [ ] Shows config file status (coding-standards, tech-stack, source-tree)

### AC3: Analyze Squad - Suggestions
- [ ] Generates actionable improvement suggestions
- [ ] Suggests adding tests if missing
- [ ] Suggests adding documentation if README incomplete
- [ ] Suggestions based on best practices

### AC4: Extend Squad - Interactive Mode
- [ ] `*extend-squad {name}` enters interactive mode
- [ ] Presents component type options as numbered list
- [ ] Supports: agent, task, workflow, checklist, template, tool, script, data
- [ ] Collects component name and basic metadata

### AC5: Extend Squad - Component Creation
- [ ] Creates component file in correct directory
- [ ] Uses appropriate template for component type
- [ ] For tasks: follows TASK-FORMAT-SPECIFICATION-V1
- [ ] For agents: follows agent definition format

### AC6: Extend Squad - Manifest Update
- [ ] Automatically updates squad.yaml components section
- [ ] Adds new component to correct array (tasks[], agents[], etc.)
- [ ] Preserves existing manifest structure
- [ ] Does not duplicate entries

### AC7: Extend Squad - Validation
- [ ] Runs validation after component creation
- [ ] Reports any validation errors
- [ ] Provides fix suggestions for errors
- [ ] Confirms success with next steps

### AC8: Story Integration (Optional)
- [ ] `--story SQS-XX` flag links changes to a story
- [ ] Adds story reference comment in created files
- [ ] Logs change in story changelog (if story file exists)

### AC9: Direct Component Addition
- [ ] `*extend-squad {name} --add agent` skips interactive menu
- [ ] `*extend-squad {name} --add task --agent {agent-id}` links task to agent
- [ ] Supports all component types via flags

## Tasks / Subtasks

### Task 1: Create *analyze-squad Task Definition (AC: 1, 2, 3)

**Responsible:** @dev (Dex)
**Atomic Layer:** Task
**Effort:** 3-4h

**File:** `.aios-core/development/tasks/squad-creator-analyze.md`

```yaml
---
task: Analyze Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - squad_name: Nome do squad (required)
  - output_format: console | markdown | json (default: console)
  - verbose: Incluir detalhes de arquivos (default: false)
  - suggestions: Incluir sugestões de melhoria (default: true)
Saida: |
  - analysis_report: Relatório completo da análise
  - component_inventory: Lista de componentes
  - coverage_metrics: Métricas de cobertura
  - suggestions: Lista de sugestões
Checklist:
  - "[ ] Validar que squad existe"
  - "[ ] Carregar squad.yaml"
  - "[ ] Inventariar componentes por tipo"
  - "[ ] Calcular métricas de cobertura"
  - "[ ] Gerar sugestões de melhoria"
  - "[ ] Formatar e exibir relatório"
---
```

**Elicitation Flow:**

```
@squad-creator

*analyze-squad

? Squad name: my-domain-squad
? Output format:
  > console (default)
    markdown (save to file)
    json (machine readable)
? Include suggestions? (Y/n)

Analyzing squad...
```

**Output Example:**

```
=== Squad Analysis: my-domain-squad ===

📋 Overview
  Name: my-domain-squad
  Version: 1.0.0
  Author: John Doe
  License: MIT
  AIOS Min Version: 2.1.0

📦 Components
  ├── Agents (2)
  │   ├── lead-agent.md
  │   └── helper-agent.md
  ├── Tasks (3)
  │   ├── lead-agent-analyze.md
  │   ├── lead-agent-process.md
  │   └── helper-agent-support.md
  ├── Workflows (0) ← Empty
  ├── Templates (1)
  │   └── report-template.md
  ├── Tools (0) ← Empty
  ├── Scripts (0) ← Empty
  ├── Checklists (0) ← Empty
  └── Data (0) ← Empty

📊 Coverage
  Agents: ██████████ 100% (2 defined)
  Tasks: ████████░░ 75% (3 tasks, but helper-agent has only 1)
  Config: ██████░░░░ 60% (tech-stack.md missing)
  Docs: ██████████ 100% (README exists)

💡 Suggestions
  1. Add tasks for helper-agent (currently has only 1)
  2. Create workflows for common sequences
  3. Add checklists for validation
  4. Create tech-stack.md in config/
  5. Consider adding tools for automation

Next: *extend-squad my-domain-squad
```

---

### Task 2: Create squad-analyzer.js Script (AC: 1, 2, 3)

**Responsible:** @dev (Dex)
**Atomic Layer:** Script
**Effort:** 4-5h

**File:** `.aios-core/development/scripts/squad/squad-analyzer.js`

```javascript
/**
 * Squad Analyzer
 *
 * Analyzes existing squads and generates reports
 * with component inventory, coverage metrics, and suggestions.
 */

class SquadAnalyzer {
  /**
   * Analyze a squad and generate complete report
   * @param {string} squadPath - Path to squad directory
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis result
   */
  async analyze(squadPath, options = {}) { }

  /**
   * Load and parse squad manifest
   * @param {string} squadPath - Path to squad directory
   * @returns {Object} Parsed manifest
   */
  async loadManifest(squadPath) { }

  /**
   * Inventory all components in squad
   * @param {string} squadPath - Path to squad directory
   * @returns {Object} Component inventory by type
   */
  async inventoryComponents(squadPath) { }

  /**
   * Calculate coverage metrics
   * @param {Object} inventory - Component inventory
   * @param {Object} manifest - Squad manifest
   * @returns {Object} Coverage metrics
   */
  calculateCoverage(inventory, manifest) { }

  /**
   * Generate improvement suggestions
   * @param {Object} inventory - Component inventory
   * @param {Object} coverage - Coverage metrics
   * @returns {Array} List of suggestions
   */
  generateSuggestions(inventory, coverage) { }

  /**
   * Format analysis report for output
   * @param {Object} analysis - Complete analysis
   * @param {string} format - Output format (console|markdown|json)
   * @returns {string} Formatted report
   */
  formatReport(analysis, format) { }
}

module.exports = { SquadAnalyzer };
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `analyze()` | Main entry point, returns complete analysis |
| `loadManifest()` | Parse squad.yaml |
| `inventoryComponents()` | Scan directories for files |
| `calculateCoverage()` | Compute coverage percentages |
| `generateSuggestions()` | AI-like suggestions based on patterns |
| `formatReport()` | Output formatting |

---

### Task 3: Create *extend-squad Task Definition (AC: 4, 5, 6, 7, 8, 9)

**Responsible:** @dev (Dex)
**Atomic Layer:** Task
**Effort:** 4-5h

**File:** `.aios-core/development/tasks/squad-creator-extend.md`

```yaml
---
task: Extend Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - squad_name: Nome do squad (required)
  - component_type: agent | task | workflow | checklist | template | tool | script | data
  - component_name: Nome do componente (kebab-case)
  - agent_id: ID do agente (required for tasks)
  - story_id: ID da story para rastreabilidade (opcional, formato SQS-XX)
Saida: |
  - created_file: Caminho do arquivo criado
  - updated_manifest: Boolean indicando atualização do squad.yaml
  - validation_result: Resultado da validação
Checklist:
  - "[ ] Validar que squad existe"
  - "[ ] Coletar tipo de componente"
  - "[ ] Coletar nome e metadados"
  - "[ ] Criar arquivo com template"
  - "[ ] Atualizar squad.yaml"
  - "[ ] Executar validação"
  - "[ ] Exibir resultado e próximos passos"
---
```

**Elicitation Flow (Interactive):**

```
@squad-creator

*extend-squad my-domain-squad

? What would you like to add?
  1. Agent - New agent persona
  2. Task - New task for an agent
  3. Workflow - Multi-step workflow
  4. Checklist - Validation checklist
  5. Template - Document template
  6. Tool - Custom tool (JavaScript)
  7. Script - Automation script
  8. Data - Static data file

> 2

? Task name: process-data
? Which agent owns this task?
  1. lead-agent
  2. helper-agent
> 1
? Task description: Process incoming data and generate output
? Link to story? (leave blank to skip): SQS-11

Creating task...
├── Created: tasks/lead-agent-process-data.md
├── Updated: squad.yaml (added to components.tasks)
├── Validation: ✅ PASS

Next steps:
  1. Edit tasks/lead-agent-process-data.md
  2. Add entrada/saida/checklist
  3. Run: *validate-squad my-domain-squad
```

**Direct Mode:**

```
*extend-squad my-domain-squad --add task --name process-data --agent lead-agent
# → Creates task directly without interactive prompts

*extend-squad my-domain-squad --add agent --name analytics-agent
# → Creates new agent

*extend-squad my-domain-squad --add workflow --name daily-processing
# → Creates new workflow
```

---

### Task 4: Create squad-extender.js Script (AC: 5, 6, 7)

**Responsible:** @dev (Dex)
**Atomic Layer:** Script
**Effort:** 5-6h

**File:** `.aios-core/development/scripts/squad/squad-extender.js`

```javascript
/**
 * Squad Extender
 *
 * Adds new components to existing squads with
 * automatic manifest updates and validation.
 */

class SquadExtender {
  /**
   * Add a new agent to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} agentDef - Agent definition
   * @returns {Object} Result with file path and status
   */
  async addAgent(squadPath, agentDef) { }

  /**
   * Add a new task to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} taskDef - Task definition
   * @returns {Object} Result with file path and status
   */
  async addTask(squadPath, taskDef) { }

  /**
   * Add a new workflow to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} workflowDef - Workflow definition
   * @returns {Object} Result with file path and status
   */
  async addWorkflow(squadPath, workflowDef) { }

  /**
   * Add a new checklist to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} checklistDef - Checklist definition
   * @returns {Object} Result with file path and status
   */
  async addChecklist(squadPath, checklistDef) { }

  /**
   * Add a new template to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} templateDef - Template definition
   * @returns {Object} Result with file path and status
   */
  async addTemplate(squadPath, templateDef) { }

  /**
   * Add a new tool to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} toolDef - Tool definition
   * @returns {Object} Result with file path and status
   */
  async addTool(squadPath, toolDef) { }

  /**
   * Add a new script to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} scriptDef - Script definition
   * @returns {Object} Result with file path and status
   */
  async addScript(squadPath, scriptDef) { }

  /**
   * Add a new data file to the squad
   * @param {string} squadPath - Path to squad
   * @param {Object} dataDef - Data definition
   * @returns {Object} Result with file path and status
   */
  async addData(squadPath, dataDef) { }

  /**
   * Update squad.yaml with new component
   * @param {string} squadPath - Path to squad
   * @param {string} componentType - Type (tasks, agents, etc.)
   * @param {string} componentFile - Filename to add
   * @returns {boolean} Success status
   */
  async updateManifest(squadPath, componentType, componentFile) { }

  /**
   * Validate squad after extension
   * @param {string} squadPath - Path to squad
   * @returns {Object} Validation result
   */
  async validateAfterExtension(squadPath) { }
}

module.exports = { SquadExtender };
```

**Component Templates:**

| Component | Template Source | Key Fields |
|-----------|-----------------|------------|
| Agent | agent-template.md | name, id, role, commands |
| Task | task-template.md | responsavel, entrada, saida, checklist |
| Workflow | workflow-template.md | steps, conditions |
| Checklist | checklist-template.md | items, categories |
| Template | template-template.md | placeholders, structure |
| Tool | tool-template.js | functions, exports |
| Script | script-template.js | main, helpers |
| Data | data-template.yaml | schema, content |

---

### Task 5: Update squad-creator.md Agent (AC: All)

**Responsible:** @dev (Dex)
**Atomic Layer:** Agent
**Effort:** 1-2h

**File:** `.aios-core/development/agents/squad-creator.md`

**Changes:**

```yaml
commands:
  # Existing commands...

  # NEW: Analyze command
  - name: analyze-squad
    visibility: [full, quick, key]
    description: "Analyze existing squad structure, components, and coverage"
    task: squad-creator-analyze.md

  # NEW: Extend command
  - name: extend-squad
    visibility: [full, quick, key]
    description: "Add new components (agents, tasks, templates, etc.) to existing squad"
    task: squad-creator-extend.md

dependencies:
  tasks:
    # Existing tasks...
    - squad-creator-analyze.md   # NEW
    - squad-creator-extend.md    # NEW
  scripts:
    # Existing scripts...
    - squad/squad-analyzer.js    # NEW
    - squad/squad-extender.js    # NEW
```

**Updated Quick Commands Section:**

```markdown
## Quick Commands

**Squad Design & Creation:**
- `*design-squad` - Design squad from documentation
- `*create-squad {name}` - Create new squad

**Squad Analysis & Improvement:** ← NEW SECTION
- `*analyze-squad {name}` - Analyze squad structure and coverage
- `*extend-squad {name}` - Add new components to squad
- `*extend-squad {name} --add {type}` - Direct component addition

**Validation & Migration:**
- `*validate-squad {name}` - Validate squad structure
- `*list-squads` - List local squads
- `*migrate-squad {path}` - Migrate legacy format
```

---

### Task 6: Create Component Templates (AC: 5)

**Responsible:** @dev (Dex)
**Atomic Layer:** Templates
**Effort:** 2-3h

**Files to Create:**

| Template | Location |
|----------|----------|
| Agent | `.aios-core/development/templates/squad/agent-template.md` |
| Task | `.aios-core/development/templates/squad/task-template.md` |
| Workflow | `.aios-core/development/templates/squad/workflow-template.md` |
| Checklist | `.aios-core/development/templates/squad/checklist-template.md` |
| Template | `.aios-core/development/templates/squad/template-template.md` |
| Tool | `.aios-core/development/templates/squad/tool-template.js` |
| Script | `.aios-core/development/templates/squad/script-template.js` |
| Data | `.aios-core/development/templates/squad/data-template.yaml` |

---

### Task 7: Create Unit Tests (AC: All)

**Responsible:** @qa (Quinn)
**Atomic Layer:** Tests
**Effort:** 4-5h

**Files:**

```
tests/unit/squad/
├── squad-analyzer.test.js       # NEW
└── squad-extender.test.js       # NEW
```

**Test Coverage:**

```javascript
describe('SquadAnalyzer', () => {
  describe('analyze', () => {
    it('should return complete analysis for valid squad');
    it('should handle squad without optional directories');
    it('should calculate accurate coverage metrics');
    it('should generate relevant suggestions');
  });

  describe('inventoryComponents', () => {
    it('should list all files in each component directory');
    it('should handle empty directories');
    it('should ignore hidden files');
  });

  describe('generateSuggestions', () => {
    it('should suggest adding tasks for agents without tasks');
    it('should suggest creating workflows when none exist');
    it('should suggest adding config files when missing');
  });
});

describe('SquadExtender', () => {
  describe('addAgent', () => {
    it('should create agent file with template');
    it('should update squad.yaml components.agents');
    it('should validate after creation');
    it('should handle duplicate names');
  });

  describe('addTask', () => {
    it('should create task file following specification');
    it('should link task to specified agent');
    it('should update squad.yaml components.tasks');
    it('should include story reference when provided');
  });

  describe('updateManifest', () => {
    it('should preserve existing manifest structure');
    it('should not add duplicate entries');
    it('should maintain YAML formatting');
  });

  // Similar tests for addWorkflow, addChecklist, addTemplate, addTool, addScript, addData
});
```

**Coverage Target:** 85%+

---

### Task 8: Create Integration Tests (AC: All)

**Responsible:** @qa (Quinn)
**Atomic Layer:** Integration Tests
**Effort:** 2-3h

**File:** `tests/integration/squad/squad-improvement.test.js`

**Scenarios:**

1. **Full Analyze Flow:** Load squad → Analyze → Generate report
2. **Full Extend Flow:** Analyze → Add agent → Add task → Validate
3. **Story Integration:** Add component with --story flag → Verify reference
4. **Error Handling:** Invalid squad name, missing directories, validation failures

---

### Task 9: Update Documentation (AC: All)

**Responsible:** @dev (Dex)
**Atomic Layer:** Documentation
**Effort:** 2h

**Files to Update:**

| File | Changes |
|------|---------|
| `docs/guides/squads-guide.md` | Add analyze & extend sections |
| `docs/epics/current/epic-sqs-squad-system.md` | Add SQS-11 story |
| `docs/architecture/squad-improvement-analysis.md` | Mark as implemented |
| `docs/architecture/squad-improvement-recommended-approach.md` | Mark as implemented |

---

### Task 10: Sync Agent to IDE Rules (AC: All)

**Responsible:** @dev (Dex)
**Atomic Layer:** Sync
**Effort:** 0.5h

**Command:**

```bash
node .aios-core/development/scripts/sync-agents.js
```

**Updates:**
- `.claude/commands/AIOS/agents/squad-creator.md`
- `.cursor/rules/agents/squad-creator.md`
- `.windsurf/rules/agents/squad-creator.md`
- `.trae/rules/agents/squad-creator.md`
- `.antigravity/rules/agents/squad-creator.md`

---

## Technical Design

### Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SQUAD ANALYSIS PIPELINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. LOAD MANIFEST                                                    │
│     ├── Find squad.yaml or config.yaml                              │
│     ├── Parse YAML content                                          │
│     └── Validate against schema                                     │
│                                                                      │
│  2. INVENTORY COMPONENTS                                             │
│     ├── Scan agents/ directory                                      │
│     ├── Scan tasks/ directory                                       │
│     ├── Scan workflows/ directory                                   │
│     ├── Scan checklists/ directory                                  │
│     ├── Scan templates/ directory                                   │
│     ├── Scan tools/ directory                                       │
│     ├── Scan scripts/ directory                                     │
│     └── Scan data/ directory                                        │
│                                                                      │
│  3. CALCULATE COVERAGE                                               │
│     ├── Agents: defined vs. with tasks                              │
│     ├── Directories: populated vs. empty                            │
│     ├── Config: required files present                              │
│     └── Documentation: README quality                               │
│                                                                      │
│  4. GENERATE SUGGESTIONS                                             │
│     ├── Pattern-based recommendations                               │
│     ├── Best practices check                                        │
│     └── Completeness analysis                                       │
│                                                                      │
│  5. FORMAT OUTPUT                                                    │
│     ├── Console: colorized tree view                                │
│     ├── Markdown: formatted document                                │
│     └── JSON: structured data                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Extension Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SQUAD EXTENSION FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. VALIDATE SQUAD EXISTS                                            │
│     ├── Check ./squads/{name}/ exists                               │
│     └── Load squad.yaml                                             │
│                                                                      │
│  2. COLLECT COMPONENT INFO                                           │
│     ├── Component type (agent, task, etc.)                          │
│     ├── Component name (kebab-case)                                 │
│     ├── Agent reference (for tasks)                                 │
│     └── Story reference (optional)                                  │
│                                                                      │
│  3. CREATE COMPONENT FILE                                            │
│     ├── Load appropriate template                                   │
│     ├── Fill in placeholders                                        │
│     ├── Add story reference if provided                             │
│     └── Write to correct directory                                  │
│                                                                      │
│  4. UPDATE MANIFEST                                                  │
│     ├── Read current squad.yaml                                     │
│     ├── Add to components.{type}[]                                  │
│     ├── Preserve formatting                                         │
│     └── Write updated manifest                                      │
│                                                                      │
│  5. VALIDATE                                                         │
│     ├── Run squad-validator                                         │
│     ├── Report any issues                                           │
│     └── Suggest fixes if needed                                     │
│                                                                      │
│  6. DISPLAY RESULT                                                   │
│     ├── Confirm creation                                            │
│     └── Show next steps                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dependencies

### Upstream
- **SQS-4:** Squad Creator Agent (base agent) ✅
- **SQS-3:** Squad Validator (validation integration) ✅
- **SQS-9:** Squad Designer (template patterns) ✅
- **SQS-10:** Project Config Reference ✅

### Downstream
- Future: Integration with WIS (Workflow Intelligence) for smart suggestions
- Future: Memory integration for learning from usage patterns

---

## Effort Estimation

| Task | Effort | Responsible |
|------|--------|-------------|
| Task 1: *analyze-squad task definition | 3-4h | @dev |
| Task 2: squad-analyzer.js script | 4-5h | @dev |
| Task 3: *extend-squad task definition | 4-5h | @dev |
| Task 4: squad-extender.js script | 5-6h | @dev |
| Task 5: Update squad-creator.md agent | 1-2h | @dev |
| Task 6: Create component templates | 2-3h | @dev |
| Task 7: Unit tests | 4-5h | @qa |
| Task 8: Integration tests | 2-3h | @qa |
| Task 9: Update documentation | 2h | @dev |
| Task 10: Sync agent to IDE rules | 0.5h | @dev |
| **Total** | **28-38h** | |

---

## Success Criteria

### Technical
- [ ] `*analyze-squad` generates accurate inventory for any valid squad
- [ ] `*extend-squad` creates valid components for all 8 types
- [ ] Manifest updates preserve YAML structure
- [ ] Validation passes after component addition
- [ ] 85%+ test coverage

### User Experience
- [ ] Analysis provides actionable insights
- [ ] Extension workflow is intuitive
- [ ] Error messages are helpful
- [ ] Direct mode works for all component types

### Quality
- [ ] No regression in existing squad-creator tasks
- [ ] Component templates follow AIOS standards
- [ ] Story integration works correctly

---

## Quality Gate

### Pre-Development
- [ ] Story approved by PO
- [ ] Technical design reviewed by @architect
- [ ] Dependencies confirmed complete

### During Development
- [ ] CodeRabbit review enabled on PRs
- [ ] Unit tests written alongside implementation
- [ ] Integration tests for full flows

### Pre-Merge
- [ ] All tests passing (85%+ coverage)
- [ ] CodeRabbit issues addressed (0 CRITICAL, 0 HIGH)
- [ ] Documentation updated
- [ ] @qa approval

### Post-Merge
- [ ] Smoke test with real squads
- [ ] User validation with squad improvement workflow

---

## CodeRabbit Integration

### Story Type Analysis

| Attribute | Value |
|-----------|-------|
| **Primary Type** | Tooling/Infrastructure |
| **Complexity** | Medium |
| **Secondary Types** | Agent Enhancement, Developer Experience |
| **Estimated Files** | 15 new, 3 modified |

### Specialized Agents

| Agent | Role | Focus |
|-------|------|-------|
| **@dev (Dex)** | Primary | Script implementation, task definitions |
| **@qa (Quinn)** | Support | Unit tests, integration tests |
| **@squad-creator (Craft)** | Review | Validate new commands work correctly |

### Quality Gates

#### Pre-Commit (@dev)
- [ ] ESLint passes on new scripts
- [ ] TypeCheck passes (if applicable)
- [ ] Unit tests pass for squad-analyzer.js
- [ ] Unit tests pass for squad-extender.js

#### Pre-PR (@dev + @qa)
- [ ] Integration tests pass
- [ ] Coverage >= 85% for new scripts
- [ ] No CRITICAL/HIGH CodeRabbit issues
- [ ] Documentation updated

#### Post-Merge (@qa)
- [ ] Smoke test with existing squads
- [ ] Validate *analyze-squad output accuracy
- [ ] Validate *extend-squad creates valid components
- [ ] Validate manifest updates preserve formatting

### Self-Healing Configuration (Story 6.3.3)

```yaml
self_healing:
  mode: light           # Tooling story - minimal iteration
  max_iterations: 2     # Two attempts to fix
  timeout_minutes: 15   # Quick fixes expected
  severity_filter:
    - CRITICAL          # Only auto-fix critical issues
  behavior:
    CRITICAL: auto-fix  # Attempt automatic resolution
    HIGH: report        # Report but don't block
    MEDIUM: log         # Log for future improvement
    LOW: ignore         # Skip minor style issues
```

### Focus Areas

| Area | Validation Points |
|------|------------------|
| **Script Patterns** | Consistent with existing squad-*.js scripts |
| **YAML Safety** | Manifest updates use atomic writes, create backups |
| **Error Handling** | All failure paths have clear error messages |
| **Template Accuracy** | Generated components pass squad-validator |
| **CLI UX** | Interactive prompts follow existing patterns |

### CodeRabbit Commands

```bash
# Review uncommitted changes
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/SynkraAI/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'

# Review full feature branch
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/SynkraAI/aios-core && ~/.local/bin/coderabbit --prompt-only -t committed --base main'
```

---

## Risks & Mitigation

### Risk 1: Manifest corruption during update
- **Probability:** MEDIUM
- **Impact:** HIGH
- **Mitigation:** Create backup before updating, use js-yaml's dump options to preserve formatting

### Risk 2: Template mismatch with current standards
- **Probability:** LOW
- **Impact:** MEDIUM
- **Mitigation:** Templates derived from existing working components

### Risk 3: Complex interactive flow confuses users
- **Probability:** MEDIUM
- **Impact:** MEDIUM
- **Mitigation:** Provide direct mode (`--add`) for experienced users

---

## Security Considerations

### Manifest Manipulation Safety
- **Backup before update:** Always create `.squad.yaml.bak` before modifying manifest
- **Atomic writes:** Use temp file + rename pattern to prevent corruption
- **Validation gate:** Run squad-validator after every manifest change

### File Creation Safety
- **Path traversal prevention:** Validate component names are kebab-case only (no `../`)
- **Overwrite protection:** Refuse to create if file already exists (require `--force`)
- **Directory bounds:** Components can only be created in squad subdirectories

### Input Validation
- **Component names:** Must match `/^[a-z][a-z0-9-]*[a-z0-9]$/`
- **Story IDs:** Must match `/^SQS-\d+$/` if provided
- **Agent IDs:** Must exist in squad's agents/ directory for task creation

---

## File List

**New Files:**
- `.aios-core/development/tasks/squad-creator-analyze.md`
- `.aios-core/development/tasks/squad-creator-extend.md`
- `.aios-core/development/scripts/squad/squad-analyzer.js`
- `.aios-core/development/scripts/squad/squad-extender.js`
- `.aios-core/development/templates/squad/agent-template.md`
- `.aios-core/development/templates/squad/task-template.md`
- `.aios-core/development/templates/squad/workflow-template.md`
- `.aios-core/development/templates/squad/checklist-template.md`
- `.aios-core/development/templates/squad/template-template.md`
- `.aios-core/development/templates/squad/tool-template.js`
- `.aios-core/development/templates/squad/script-template.js`
- `.aios-core/development/templates/squad/data-template.yaml`
- `tests/unit/squad/squad-analyzer.test.js`
- `tests/unit/squad/squad-extender.test.js`
- `tests/integration/squad/squad-improvement.test.js`

**Modified Files:**
- `.aios-core/development/agents/squad-creator.md`
- `docs/guides/squads-guide.md`
- `docs/epics/current/epic-sqs-squad-system.md`

---

## Related Resources

- **Epic:** SQS (Squad System Enhancement)
- **Analysis:** `docs/architecture/squad-improvement-analysis.md`
- **Approach:** `docs/architecture/squad-improvement-recommended-approach.md`
- **Reference:** SQS-9 (Squad Designer) for pattern examples

---

**Created by:** Aria (Architect)
**Date:** 2025-12-26
**Sprint:** 14
**Status:** Approved
**Approved by:** Pax (PO) - 2025-12-26

---

## PO Validation Notes

**Validation Date:** 2025-12-26
**Validator:** Pax (PO)

### Validation Summary

| Criteria | Result |
|----------|--------|
| Template Completeness | ✅ PASS |
| Acceptance Criteria | ✅ PASS (9 ACs, all testable) |
| Task Sequence | ✅ PASS |
| Anti-Hallucination | ✅ PASS |
| CodeRabbit Integration | ✅ PASS (added) |
| Security Considerations | ✅ PASS (added) |
| Dev Readiness | ✅ PASS |

### Final Decision

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Decision: ✅ GO                                            │
│                                                             │
│  Implementation Readiness Score: 9.5/10                     │
│  Confidence Level: HIGH                                     │
│                                                             │
│  Story is ready for Sprint 14 implementation.               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*"Enabling continuous improvement of squads through guided analysis and extension."*

— Pax, equilibrando prioridades 🎯
