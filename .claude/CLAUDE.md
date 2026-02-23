# CLAUDE.md - Synkra AIOS

Este arquivo fornece orientação ao Claude Code ao trabalhar neste repositório.

---

## Constitution

O AIOS possui uma **Constitution formal** com princípios inegociáveis e gates automáticos.

**Documento completo:** `.aios-core/constitution.md`

**Princípios fundamentais:**

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Gates automáticos bloqueiam violações.** Consulte a Constitution para detalhes completos.

---

## Language Configuration

Language preference is handled by Claude Code's native `language` setting (v2.1.0+).
Configure em `~/.claude/settings.json` (global) ou `.claude/settings.json` (project):

```json
{ "language": "portuguese" }
```

The installer writes this automatically during `npx aios-core install`. No language config in `core-config.yaml`.

---

## Premissa Arquitetural: CLI First

O Synkra AIOS segue uma hierarquia clara de prioridades que deve guiar **TODAS** as decisões:

```
CLI First → Observability Second → UI Third
```

| Camada | Prioridade | Descrição |
|--------|------------|-----------|
| **CLI** | Máxima | Onde a inteligência vive. Toda execução, decisões e automação. |
| **Observability** | Secundária | Observar e monitorar o que acontece no CLI em tempo real. |
| **UI** | Terciária | Gestão pontual e visualizações quando necessário. |

### Princípios Derivados

1. **A CLI é a fonte da verdade** - Dashboards apenas observam, nunca controlam
2. **Funcionalidades novas devem funcionar 100% via CLI** antes de ter qualquer UI
3. **A UI nunca deve ser requisito** para operação do sistema
4. **Observabilidade serve para entender** o que o CLI está fazendo, não para controlá-lo
5. **Ao decidir onde implementar algo**, sempre prefira CLI > Observability > UI

> **Referência formal:** Constitution Artigo I - CLI First (NON-NEGOTIABLE)

---

## Estrutura do Projeto

```
aios-core/
├── .aios-core/              # Core do framework
│   ├── core/                # Módulos principais (orchestration, memory, entity-registry)
│   ├── data/                # Knowledge base, IDS (Intelligence Directory System)
│   ├── development/         # Agents, tasks, templates, checklists, scripts
│   └── infrastructure/      # CI/CD templates, deployment scripts
├── bin/                     # CLI executables (aios.js, aios-init.js, aios-ids.js)
├── docs/                    # Documentação
│   ├── architecture/        # Design docs, ARCHITECTURE-INDEX.md
│   ├── stories/             # Development stories
│   │   ├── active/          # Stories em desenvolvimento
│   │   ├── completed/       # Stories completadas
│   │   ├── backlog.md       # Product backlog master
│   │   └── epics/           # Epic definitions
│   └── guides/              # User guides, tutorials
├── packages/                # Workspace packages
│   ├── aios-install/        # Installation framework
│   ├── aios-pro-cli/        # Pro edition CLI
│   ├── gemini-aios-extension/  # Gemini IDE integration
│   ├── installer/           # Interactive installer
│   ├── python-media-service/ # Python media processing
│   ├── research-service/    # Research and analysis service
│   └── visual-service/      # Visual processing service
├── pro/                     # Pro submodule (proprietary, license required)
├── squads/                  # Squad expansions (domain-specific agents)
├── tests/                   # Unit and integration tests
└── .github/                 # GitHub Actions, workflows
```

---

## Sistema de Agentes

### Ativação de Agentes
Use `@agent-name` ou `/AIOS:agents:agent-name`:

| Agente | Persona | Escopo Principal |
|--------|---------|------------------|
| `@dev` | Dex | Implementação de código, bugfixes |
| `@qa` | Quinn | Testes, qualidade, validação |
| `@architect` | Aria | Arquitetura, design técnico, patterns |
| `@pm` | Morgan | Product Management, roadmap |
| `@po` | Pax | Product Owner, stories, epics, backlog |
| `@sm` | River | Scrum Master, sprint planning |
| `@analyst` | Alex | Pesquisa, análise, dados |
| `@data-engineer` | Dara | Database design, migrations, schema |
| `@ux-design-expert` | Uma | UX/UI design, usability |
| `@devops` | Gage | CI/CD, git push (**EXCLUSIVO**), releases, MCP |
| `@knowledge-monitor` | Sage | Knowledge gaps, proficiência, domain briefing |

### Comandos de Agentes
Use prefixo `*` para comandos específicos do agente:
- `*help` - Mostrar comandos disponíveis
- `*create-story` - Criar story de desenvolvimento
- `*task {name}` - Executar task específica
- `*exit` - Sair do modo agente

**Exemplos por agente:**
```
@dev *help                          # Ver tarefas do desenvolvedor
@qa *help                           # Ver tarefas de QA
@architect *help                    # Ver tarefas de arquitetura
@knowledge-monitor *scan-gaps dev   # Verificar gaps de conhecimento
```

### Mapeamento Agente → Codebase

| Agente | Diretórios Principais |
|--------|----------------------|
| `@dev` | `packages/`, `.aios-core/core/`, `bin/` |
| `@architect` | `docs/architecture/`, sistema design |
| `@data-engineer` | `packages/db/`, migrations, schema |
| `@qa` | `tests/`, `*.test.js`, quality gates |
| `@po` | `docs/stories/`, epics, requirements |
| `@sm` | Stories, workflow, backlog |
| `@devops` | `.github/`, CI/CD, MCP management |
| `@knowledge-monitor` | `docs/knowledge/`, entity registry |

---

## Story-Driven Development

Todas as mudanças no código começam e terminam com uma **story**.

### Estrutura de uma Story

Cada story em `docs/stories/active/story-{id}-{slug}.md` segue este formato:

```markdown
# Story {ID}: {Título}

## Metadata
- **Story ID:** {ID}
- **Epic:** {Epic name}
- **Status:** Draft | Active | InReview | Done
- **Priority:** P0 - Critical | P1 - High | P2 - Medium | P3 - Low
- **Points:** {story points}
- **Agent:** @{primary-agent}
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD

---

## Story
**As a** {user type},
**I want** {capability},
**so that** {benefit}.

---

## Scope
### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 1

---

## Acceptance Criteria
### AC1: {Criterion Name}
- [ ] Subtask 1
- [ ] Subtask 2

---

## Technical Notes
(Optional: design decisions, architectural patterns, constraints)

---

## File List
Files modified/created during development:
- `path/to/file.js` - Description
- `path/to/component.tsx` - Description
```

### Workflow de Story

```
@po *create-story → @sm prepara → @dev implementa → @qa testa → @devops push
```

**Passos específicos:**

1. **Criação** (`@po`): Usar `*create-story` para criar nova story
2. **Preparação** (`@sm`): Refinar AC, estimar points, designar agente
3. **Implementação** (`@dev`): Atualizar checkboxes conforme progride, manter File List
4. **Teste** (`@qa`): Validar contra AC, criar issues se necessário
5. **Merge** (`@devops`): Fazer push para `main`, atualizar story para "Done"

### Atualizando Story Progress

**Regra 1:** Marque checkboxes imediatamente após completar
```markdown
- [x] Subtask completa  ← Marcado quando termina
- [ ] Próxima subtask
```

**Regra 2:** Mantenha File List sempre atualizada
```markdown
## File List
- `src/components/NewComponent.tsx` - Nova entrada criada
- `src/utils/helper.js` - Função adicionada à linha 42
- `tests/NewComponent.test.js` - Testes adicionados
```

**Regra 3:** Atualize `Updated:` na metadata quando mudar a story

### Knowledge-First Protocol

Antes de ativar um agente em **novo domínio**, use o protocolo Knowledge-First:

```bash
@knowledge-monitor *scan-gaps {agent}              # Verificar gaps
@knowledge-monitor *knowledge-brief {agent} {domain}  # Gerar briefing
@{agent} *help                                    # Validar briefing injetado
```

**Constitution Artigo VII:** Agentes com score < 0.30 em um domínio DEVEM adquirir conhecimento antes de operar nesse domínio (via Synapse L8 injection).

---

## Componentes Arquiteturais Importantes

### Entity Registry & IDS (Intelligence Directory System)

O AIOS mantém um **Entity Registry** centralizado em `.aios-core/data/` para rastrear:
- Agentes e suas proficiências
- Domains e especialidades
- Tasks, workflows, squads
- Padrões e templates

**CLI:**
```bash
npx aios-core ids --list           # Listar todas entidades
npx aios-core ids --search {term}  # Buscar entidade
npx aios-core ids --validate       # Validar integridade do registry
```

Este sistema alimenta decisões do Synapse e Knowledge Monitor.

### Synapse L8 Context Engine

O Synapse é o engine de injeção de contexto automática que prepara agentes antes de ativação:

**8 Layers:**
1. **L1:** Core capabilities (padrão)
2. **L2:** Domain knowledge (via @knowledge-monitor)
3. **L3:** Story context (referência automática da story ativa)
4. **L4:** Codebase patterns (análise de padrões locais)
5. **L5:** Agent-specific rules (persona, autoridades, escopo)
6. **L6:** Constitutional constraints (Constitution check)
7. **L7:** Recent history (últimas N operações do agente)
8. **L8:** Dynamic briefing (knowledge-monitor injection)

**Uso:** Transparente. Quando você ativa `@dev`, Synapse injeta automaticamente os 8 layers de contexto.

---

## Padrões de Código

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `WorkflowList` |
| Hooks | prefixo `use` | `useWorkflowOperations` |
| Arquivos | kebab-case | `workflow-list.tsx` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase + sufixo | `WorkflowListProps` |
| Funções | camelCase | `fetchWorkflows()` |
| Classes | PascalCase | `WorkflowManager` |

### Imports
**Sempre use imports absolutos.** Nunca use imports relativos.

```typescript
// ✓ Correto
import { useStore } from '@/stores/feature/store'
import { fetchData } from '@/lib/api'

// ✗ Errado
import { useStore } from '../../../stores/feature/store'
import { fetchData } from '../../lib/api'
```

**Ordem de imports:**
1. React/Node.js core libraries
2. External third-party libraries
3. UI components (@/components)
4. Utilities (@/lib, @/utils)
5. Stores (@/stores)
6. Feature-specific imports (@/features)
7. CSS/Style imports

### TypeScript
- Sem `any` — Use tipos apropriados ou `unknown` com type guards
- Sempre defina interface de props para componentes
- Use `as const` para objetos/arrays constantes
- Tipos de ref explícitos: `useRef<HTMLDivElement>(null)`
- Discriminated unions para tipos complexos

```typescript
// ✓ Bom
type Result = { success: true; data: T } | { success: false; error: string }

// ✗ Ruim
type Result = { success: boolean; data?: T; error?: string }
```

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  logger.error(`Failed to ${operation}`, { error })
  throw new Error(`Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown'}`)
}
```

### Testing
Testes devem seguir o padrão **AAA (Arrange-Act-Assert)**:

```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = setupTestData()

    // Act
    const result = performAction(input)

    // Assert
    expect(result).toBe(expected)
  })
})
```

---

## Testes & Quality Gates

### Comandos de Teste

```bash
npm test                          # Rodar testes (Jest)
npm run test:watch                # Modo watch
npm run test:coverage             # Com relatório de cobertura
npm run test:health-check         # Health check do sistema (Mocha)
npm run lint                      # ESLint
npm run typecheck                 # TypeScript type checking
```

### Quality Gates (Pre-Push)

Antes de push, **todos** os checks devem passar:

```bash
npm run lint        # ESLint - Style checking
npm run typecheck   # TypeScript - Type safety
npm test            # Jest - Unit tests
npm run test:health-check  # Sistema health
```

**Gate automático** em `.husky/` previne commit/push se algum check falhar.

### Padrão de Coverage

O projeto requer **mínimo 80% de cobertura**:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

```bash
npm run test:coverage -- --threshold 80
```

---

## Convenções Git

### Commits
Seguir **Conventional Commits**:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat:` | Nova funcionalidade | `feat: add workflow validation [Story LP-1]` |
| `fix:` | Correção de bug | `fix: resolve race condition in async hook` |
| `docs:` | Documentação | `docs: update CLI usage guide` |
| `test:` | Testes | `test: add edge case coverage for parser` |
| `chore:` | Manutenção | `chore: update dependencies` |
| `refactor:` | Refatoração | `refactor: simplify workflow logic` |
| `perf:` | Performance | `perf: optimize entity registry lookup` |

**Importante:** Sempre referencie story ID:
```
feat: implement feature description [Story LP-1]
```

### Branches
- `main` - Branch principal (protected)
- `feat/{feature-name}` - Nova feature
- `fix/{issue-name}` - Correção de bug
- `docs/{topic}` - Documentação
- `refactor/{area}` - Refatoração

### Push Authority
**APENAS `@devops` pode fazer push para remote.**

Workflow:
1. Outro agente completa implementação
2. Cria PR via `@devops *create-pr` ou similar
3. `@devops` revisa e faz push

---

## Workspace: Packages

O projeto usa **npm workspaces**. Trabalhe com packages específicos:

### Instalação de Dependências

```bash
# Todas as dependências
npm install

# Package específico
npm install --workspace=packages/aios-install

# Adicionar dep a um package
npm install lodash --workspace=packages/research-service
```

### Scripts em Packages

```bash
# Rodar script em um package
npm run build --workspace=packages/python-media-service

# Rodar em todos
npm run build --workspaces
```

### Package Descriptions

| Package | Propósito |
|---------|-----------|
| `aios-install` | Framework de instalação, generators, scaffolding |
| `aios-pro-cli` | CLI da edição Pro (requer licença) |
| `gemini-aios-extension` | Integração com Gemini IDE |
| `installer` | Instalador interativo (clack/prompts) |
| `python-media-service` | Processamento de mídia (imagens, vídeos) via Python |
| `research-service` | Serviço de pesquisa e análise |
| `visual-service` | Processamento visual, OCR, análise de imagens |

---

## Comandos Frequentes

### Desenvolvimento

```bash
npm run dev                 # Iniciar desenvolvimento (monorepo)
npm test                    # Rodar todos os testes
npm run lint                # ESLint em todo código
npm run typecheck           # TypeScript check
npm run build               # Build para produção
npm run test:coverage       # Coverage report
npm run test:health-check   # Health check do sistema
```

### AIOS CLI

```bash
npx aios-core install       # Instalar AIOS
npx aios-core doctor        # Diagnóstico do sistema
npx aios-core info          # Informações do ambiente
npx aios-core ids --list    # Listar Entity Registry
npx aios-core ids --validate # Validar registry
```

### IDS (Intelligence Directory System)

```bash
node bin/aios-ids.js --list         # Listar entidades
node bin/aios-ids.js --search agent # Buscar agentes
node bin/aios-ids.js --validate     # Validar integridade
```

### IDE Sync (Multi-IDE Support)

```bash
npm run sync:ide:claude             # Sincronizar com Claude Code
npm run sync:ide:codex              # Sincronizar com Codex
npm run sync:ide:gemini             # Sincronizar com Gemini
npm run sync:ide:cursor             # Sincronizar com Cursor
npm run validate:claude-sync        # Validar sincronização Claude
```

### Validações de Qualidade

```bash
npm run validate:structure  # Validar tree guardian
npm run validate:agents     # Validar definições de agentes
npm run validate:paths      # Validar paths absolutas
npm run validate:parity     # Validar paridade multi-IDE
npm run validate:manifest   # Validar install manifest
```

---

## Otimização Claude Code

### Uso de Ferramentas

| Tarefa | Use | Não Use |
|--------|-----|---------|
| Buscar conteúdo de arquivo | `Grep` tool | `grep` ou `rg` em bash |
| Ler arquivos | `Read` tool | `cat`, `head`, `tail` |
| Editar arquivos | `Edit` tool | `sed`, `awk` |
| Buscar arquivos | `Glob` tool | `find` |
| Operações complexas | `Task` tool | Múltiplos comandos manuais |

**Por quê?** Ferramentas nativas têm melhor contexto, permissões, e integração com Claude Code.

### Performance

- Prefira chamadas de ferramentas em batch (múltiplas chamadas paralelas)
- Use execução paralela para operações independentes
- Cache dados frequentemente acessados durante a sessão
- Minimize leituras repetidas de arquivos grandes

### Gerenciamento de Sessão

- Rastreie progresso da story durante a sessão
- Atualize checkboxes **imediatamente** após completar tasks
- Mantenha contexto da story atual sendo trabalhada
- Salve estado importante antes de operações longas
- Se contexto ficar baixo, dispare protocolo de backup

### Recuperação de Erros

- Sempre forneça sugestões de recuperação para falhas
- Inclua contexto do erro em mensagens ao usuário
- Sugira procedimentos de rollback quando apropriado
- Documente quaisquer correções manuais necessárias

---

## MCP Usage

Ver `.claude/rules/mcp-usage.md` para regras detalhadas.

**Resumo:**
- Preferir ferramentas nativas do Claude Code sobre MCP
- MCP Docker Gateway apenas quando explicitamente necessário
- **`@devops` gerencia toda infraestrutura MCP**

---

## Debug & Troubleshooting

### Habilitar Debug Mode

```bash
export AIOS_DEBUG=true
npm test        # Testes com verbose logging
npm run dev     # Desenvolvimento com debug
```

### Logs

```bash
tail -f .aios/logs/agent.log        # Agent logs
tail -f .aios/logs/cli.log          # CLI logs
tail -f .aios/logs/synapse.log      # Synapse context injection
```

### Health Checks

```bash
npm run test:health-check           # Sistema health
npx aios-core doctor                # Diagnóstico completo
npx aios-core doctor --fix          # Auto-fix problemas detectados
```

### Problemas Comuns

**Problema:** Story não aparece em `@po` commands
```bash
npm run validate:structure   # Verificar tree guardian
npm run test:health-check    # Verificar story schema
```

**Problema:** Agente não ativado corretamente
```bash
@knowledge-monitor *scan-gaps @{agent}    # Verificar proficiência
npm run sync:ide:claude                   # Re-sincronizar com Claude Code
```

**Problema:** Git hooks bloqueando commit
```bash
npm run lint -- --fix       # Auto-fix linting issues
npm run typecheck           # Verificar tipos TS
```

---

## Protocolo de Limite de Contexto (Low-Token Safety)

### Hook Automático — PreCompact

O Claude Code possui um **hook automático** em `.claude/hooks/precompact-low-token-backup.cjs`.
Dispara automaticamente quando o contexto está quase cheio (**evento PreCompact**).

**Ação automática:**
1. Gera relatório em `.aios/session-reports/session-{timestamp}.md`
2. Faz `git add + commit + push` para o GitHub
3. Exibe aviso ao usuário

### Cálculo de Margem de Tokens

| Operação | Tokens |
|----------|--------|
| Raciocínio / planejamento do backup | ~2.000 |
| Geração do relatório de sessão | ~1.500 |
| Overhead de chamadas de ferramentas (×10) | ~1.500 |
| Execução git add / commit / push | ~800 |
| Mensagem de aviso | ~300 |
| Buffer de erro (1 retry) | ~2.000 |
| Margem de segurança (20%) | ~1.700 |
| **TOTAL NECESSÁRIO** | **~9.800 tokens** |
| **THRESHOLD CONFIGURADO** | **15.000 tokens** |

### Limites por IDE

| IDE | Contexto Total | Threshold | Mecanismo |
|-----|---|---|---|
| **Claude Code** | **200.000** | **15.000 restantes** | Hook automático PreCompact |
| Gemini CLI | 1.000.000 | 15.000 restantes | Instrução manual em rules.md |
| Codex CLI | 128.000 | 20.000 restantes | Instrução manual em AGENTS.md |

### Trigger Manual

Se o hook não disparar:

```bash
node .aios-core/scripts/session-backup.js --provider=claude --reason=manual
```

---

## Quick Reference: Story Workflow

### Criar Story (Product Owner)

```bash
@po *create-story
# Segue prompts interativos para criar story em docs/stories/active/
```

### Implementar Story (Developer)

```bash
@dev
# Lê a story completa
# Implementa conforme Acceptance Criteria
# Atualiza checkboxes conforme progride
# Mantém File List atualizado
```

### Testar Story (QA)

```bash
@qa *review-story story-{id}
# Valida contra AC
# Executa testes
# Cria issues se necessário
```

### Publicar Story (DevOps)

```bash
@devops
# Revisa story completa
# Faz push para main
# Marca story como "Done"
```

---

*Synkra AIOS Claude Code Configuration v4.1*
*CLI First | Observability Second | UI Third*
*Updated: 2026-02-20 | Entity Registry + Synapse L8 + Low-Token Safety Protocol*
