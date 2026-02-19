# Synkra AIOS Constitution

> **Version:** 1.1.0 | **Ratified:** 2025-01-30 | **Last Amended:** 2026-02-19

Este documento define os princípios fundamentais e inegociáveis do Synkra AIOS. Todos os agentes, tasks, e workflows DEVEM respeitar estes princípios. Violações são bloqueadas automaticamente via gates.

---

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

O CLI é a fonte da verdade onde toda inteligência, execução, e automação vivem.

**Regras:**
- MUST: Toda funcionalidade nova DEVE funcionar 100% via CLI antes de qualquer UI
- MUST: Dashboards apenas observam, NUNCA controlam ou tomam decisões
- MUST: A UI NUNCA é requisito para operação do sistema
- MUST: Ao decidir onde implementar, sempre CLI > Observability > UI

**Hierarquia:**
```
CLI (Máxima) → Observability (Secundária) → UI (Terciária)
```

**Gate:** `dev-develop-story.md` - WARN se UI criada antes de CLI funcional

---

### II. Agent Authority (NON-NEGOTIABLE)

Cada agente tem autoridades exclusivas que não podem ser violadas.

**Regras:**
- MUST: Apenas @devops pode executar `git push` para remote
- MUST: Apenas @devops pode criar Pull Requests
- MUST: Apenas @devops pode criar releases e tags
- MUST: Agentes DEVEM delegar para o agente apropriado quando fora de seu escopo
- MUST: Nenhum agente pode assumir autoridade de outro

**Exclusividades:**

| Autoridade | Agente Exclusivo |
|------------|------------------|
| git push | @devops |
| PR creation | @devops |
| Release/Tag | @devops |
| Story creation | @sm, @po |
| Architecture decisions | @architect |
| Quality verdicts | @qa |

**Gate:** Implementado via definição de agentes (não requer gate adicional)

---

### III. Story-Driven Development (MUST)

Todo desenvolvimento começa e termina com uma story.

**Regras:**
- MUST: Nenhum código é escrito sem uma story associada
- MUST: Stories DEVEM ter acceptance criteria claros antes de implementação
- MUST: Progresso DEVE ser rastreado via checkboxes na story
- MUST: File List DEVE ser mantida atualizada na story
- SHOULD: Stories seguem o workflow: @po/@sm cria → @dev implementa → @qa valida → @devops push

**Gate:** `dev-develop-story.md` - BLOCK se não houver story válida

---

### IV. No Invention (MUST)

Especificações não inventam - apenas derivam dos requisitos.

**Regras:**
- MUST: Todo statement em spec.md DEVE rastrear para:
  - Um requisito funcional (FR-*)
  - Um requisito não-funcional (NFR-*)
  - Uma constraint (CON-*)
  - Um finding de research (verificado e documentado)
- MUST NOT: Adicionar features não presentes nos requisitos
- MUST NOT: Assumir detalhes de implementação não pesquisados
- MUST NOT: Especificar tecnologias não validadas

**Gate:** `spec-write-spec.md` - BLOCK se spec contiver invenções

---

### V. Quality First (MUST)

Qualidade não é negociável. Todo código passa por múltiplos gates antes de merge.

**Regras:**
- MUST: `npm run lint` passa sem erros
- MUST: `npm run typecheck` passa sem erros
- MUST: `npm test` passa sem falhas
- MUST: `npm run build` completa com sucesso
- MUST: CodeRabbit não reporta issues CRITICAL
- MUST: Story status é "Done" ou "Ready for Review"
- SHOULD: Cobertura de testes não diminui

**Gate:** `pre-push.md` - BLOCK se qualquer check falhar

---

### VI. Absolute Imports (SHOULD)

Imports relativos criam acoplamento e dificultam refatoração.

**Regras:**
- SHOULD: Sempre usar imports absolutos com alias `@/`
- SHOULD NOT: Usar imports relativos (`../../../`)
- EXCEPTION: Imports dentro do mesmo módulo/feature podem ser relativos

**Exemplo:**
```typescript
// CORRETO
import { useStore } from '@/stores/feature/store'

// INCORRETO
import { useStore } from '../../../stores/feature/store'
```

**Gate:** ESLint rule (já implementado)

---

### VII. Knowledge First (MUST)

Agentes especializados requerem embasamento de conhecimento antes de operar. Generalismo é proibido em domínios críticos.

**Rationale:**
Um agente sem conhecimento atualizado de seu domínio é tão perigoso quanto nenhum agente. A especialização é o diferencial do sistema; preservá-la é inegociável.

**Regras:**
- MUST: Agentes com gaps críticos (score < 0.30) DEVEM adquirir conhecimento via `*acquire` antes de tarefas no domínio
- MUST: @knowledge-monitor (Sage) DEVE ser consultado antes de iniciar sprints com novos domínios
- MUST: Scores de proficiência DEVEM ser baseados em evidências reais — nunca estimados sem fonte
- MUST: knowledge-gaps.yaml e agent-knowledge-profiles.yaml têm autoridade exclusiva de @knowledge-monitor
- SHOULD: Conhecimento adquirido via MCPs (Context7, EXA) DEVE ser documentado em knowledge-briefs
- SHOULD: Agentes DEVEM informar @knowledge-monitor ao concluir tarefas em novos domínios
- SHOULD NOT: Ativar agente em domínio crítico sem brief disponível
- MUST NOT: Inventar scores ou afirmar expertise sem evidência documentada

**Thresholds de Proficiência:**

| Score | Categoria | Ação Requerida |
|-------|-----------|----------------|
| 0.00–0.30 | Crítico | `*acquire` obrigatório antes de operar |
| 0.30–0.60 | Lacuna | `*knowledge-brief` recomendado |
| 0.60–0.80 | Adequado | Operar com atenção às lacunas |
| 0.80–1.00 | Proficiente | Operar com confiança |

**Autoridades Exclusivas de @knowledge-monitor:**
- Leitura/escrita: `agent-knowledge-profiles.yaml`
- Leitura/escrita: `knowledge-gaps.yaml`
- Leitura/escrita: `.aios-core/data/knowledge-briefs/`
- Leitura apenas: `entity-registry.yaml`, `gotchas.json`

**Princípios de @knowledge-monitor (Sage):**
- "Você não pode especializar o que não consegue medir"
- "Um gap detectado antes da tarefa é 10x mais barato que uma falha durante"
- "Conhecimento sem freshness tracking é apenas dado obsoleto"
- "Todo agente merece um knowledge brief antes de entrar em campo"

**Gate:** `knowledge-brief-runner.js` — WARN ao ativar agente com gaps críticos
**Monitor:** `*scan-gaps` — detecta novos gaps após cada sprint
**Comando principal:** `@knowledge-monitor` → `*help`

---

## Governance

### Amendment Process

1. Proposta de mudança documentada com justificativa
2. Review por @architect e @po
3. Aprovação requer consenso
4. Mudança implementada com atualização de versão
5. Propagação para templates e tasks dependentes

### Versioning

- **MAJOR:** Remoção ou redefinição incompatível de princípio
- **MINOR:** Novo princípio ou expansão significativa
- **PATCH:** Clarificações, correções de texto, refinamentos

### Compliance

- Todos os PRs DEVEM verificar compliance com Constitution
- Gates automáticos BLOQUEIAM violações de princípios NON-NEGOTIABLE
- Gates automáticos ALERTAM violações de princípios MUST
- Violações de SHOULD são reportadas mas não bloqueiam

### Gate Severity Levels

| Severidade | Comportamento | Uso |
|------------|---------------|-----|
| BLOCK | Impede execução, requer correção | NON-NEGOTIABLE, MUST críticos |
| WARN | Permite continuar com alerta | MUST não-críticos |
| INFO | Apenas reporta | SHOULD |

---

## References

- **Princípios derivados de:** `.claude/CLAUDE.md`
- **Inspirado por:** GitHub Spec-Kit Constitution System
- **Gates implementados em:** `.aios-core/development/tasks/`
- **Checklists relacionados:** `.aios-core/product/checklists/`

---

*Synkra AIOS Constitution v1.1.0*
*CLI First | Agent-Driven | Quality First | Knowledge First*
