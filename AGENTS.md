# AGENTS.md - Synkra AIOS Rules for Codex CLI

> **Versão:** 2.0.0 | **Atualizado:** 2026-02-19 | **Motivo:** Alinhamento multi-IDE e proteção pós-incidente
>
> Este arquivo configura o comportamento esperado do Codex CLI neste repositório.
> **Descumprir estas regras causa dano real ao projeto.**

---

## INCIDENTE REGISTRADO — 2026-02-19

O Gemini CLI causou as seguintes alterações destrutivas que exigiram restauração manual.
**O Codex deve conhecer este histórico para não repetir os mesmos erros.**

| Arquivo/Diretório | Dano causado |
|-------------------|--------------|
| `.claude/CLAUDE.md` | **DELETADO** (316 linhas) |
| `.claude/commands/AIOS/agents/*.md` | **DELETADOS** (11 agentes, ~4.400 linhas) |
| `.aios-core/constitution.md` | **ESVAZIADO** (171 linhas removidas) |
| `.aios-core/install-manifest.yaml` | **ESVAZIADO** (4.410 linhas removidas) |
| `.aios-core/core-config.yaml` | **CORROMPIDO** (180+ linhas de config crítica removidas) |

**Causa raiz:** Tratou o projeto como `greenfield` quando é `EXISTING_AIOS`.

---

## ARQUIVOS PROTEGIDOS — NUNCA MODIFICAR SEM AUTORIZAÇÃO EXPLÍCITA

### Tier 1 — INTOCÁVEIS (nunca modificar, nunca deletar)

```
.claude/CLAUDE.md
.claude/commands/AIOS/agents/*.md
.gemini/rules.md
.aios-core/constitution.md
.aios-core/core-config.yaml
.aios-core/install-manifest.yaml
.aios-core/core/
.aios-core/development/agents/
AGENTS.md                           ← este arquivo
```

### Tier 2 — SOMENTE LEITURA (ler para contexto, não modificar)

```
.claude/rules/*.md
.claude/hooks/*.cjs
.aios-core/data/
docs/framework/*.md
package.json (raiz)
```

### Tier 3 — MODIFICÁVEL COM CUIDADO (apenas mudanças cirúrgicas)

```
.env.example         → Apenas ADICIONAR novas variáveis, nunca remover existentes
.gitignore           → Apenas ADICIONAR entradas, nunca remover existentes
docs/architecture/   → Criar novos arquivos, não sobrescrever existentes
packages/            → Criar novos pacotes, não modificar os existentes sem story
.codex/agents/       → Apenas via sincronização oficial (npm run sync:ide)
.codex/skills/       → Apenas via sincronização oficial (npm run sync:skills:codex)
```

---

## REGRAS ABSOLUTAS

### ❌ NUNCA FAZER

1. **Nunca deletar arquivos tracked pelo git** sem story aprovada e autorização explícita do usuário
2. **Nunca alterar `.aios-core/core-config.yaml`** — este arquivo define o estado do projeto
3. **Nunca alterar `project.type`** — o projeto é `EXISTING_AIOS`, não `greenfield`
4. **Nunca alterar `project.installedAt`** — data histórica do projeto
5. **Nunca esvaziar ou reescrever** arquivos de mais de 50 linhas sem leitura prévia completa
6. **Nunca rodar scripts de instalação** (`npx aios-core install`, `./install.sh`, etc.)
7. **Nunca fazer `git push`** — autoridade exclusiva do agente `@devops`
8. **Nunca criar Pull Requests** — autoridade exclusiva do agente `@devops`
9. **Nunca modificar configurações de IDE** em `core-config.yaml` sem autorização
10. **Nunca sincronizar agentes manualmente** — use `npm run sync:ide` para isso

### ✅ SEMPRE FAZER

1. **Ler o arquivo completamente** antes de qualquer modificação
2. **Verificar `git status`** antes e depois de qualquer operação
3. **Fazer mudanças cirúrgicas** — alterar apenas o mínimo necessário
4. **Perguntar ao usuário** quando houver dúvida sobre escopo ou impacto
5. **Seguir stories** — toda tarefa começa com uma story em `docs/stories/`
6. **Rodar quality gates** antes de considerar a tarefa concluída
7. **Reportar ao usuário** todos os arquivos criados/modificados/deletados ao final

---

## ENTENDIMENTO DO PROJETO

### Tipo de Projeto
```
type: EXISTING_AIOS
```
Este é um projeto **existente** em produção ativa. **NÃO É GREENFIELD.**
O Codex CLI é mais uma ferramenta de desenvolvimento — não um instalador.

### Verificação de Segurança (executar ao iniciar)
```bash
# 1. Verificar tipo do projeto (deve ser EXISTING_AIOS)
grep "type:" .aios-core/core-config.yaml

# 2. Verificar estado do repositório
git status

# 3. Confirmar arquivos críticos presentes
ls .claude/CLAUDE.md .aios-core/constitution.md .aios-core/core-config.yaml
```

**Se `project.type` aparecer como `greenfield` — PARAR IMEDIATAMENTE e reportar ao usuário.**

---

## OPERAÇÃO COMO TIME (Claude + Gemini + Codex)

Este projeto opera com **três IDEs simultâneos**. Cada um tem seu espaço e responsabilidade:

| IDE | Arquivo de Regras | Espaço de Agentes |
|-----|-------------------|-------------------|
| **Claude Code** | `.claude/CLAUDE.md` | `.claude/commands/AIOS/agents/` |
| **Gemini CLI** | `.gemini/rules.md` | `.gemini/rules/AIOS/agents/` |
| **Codex CLI** | `AGENTS.md` (este arquivo) | `.codex/agents/` + `.codex/skills/` |

### Fonte da Verdade Canônica
```
.aios-core/development/agents/  ← FONTE CANÔNICA de todos os agentes
        ↓ sincronizado via: npm run sync:ide
.claude/commands/AIOS/agents/   ← cópia para Claude Code
.gemini/rules/AIOS/agents/      ← cópia para Gemini CLI
.codex/agents/                  ← cópia para Codex CLI
```

**Regra crítica:** Nunca editar as cópias diretamente. Editar sempre na fonte canônica e rodar `npm run sync:ide`.

### Princípio de Não-Interferência
- **Codex não altera** `.claude/` ou `.gemini/`
- **Gemini não altera** `.claude/` ou `.codex/`
- **Claude não altera** `.gemini/` ou `.codex/`
- Cada IDE respeita o espaço dos outros

### Comunicação entre IDEs
Quando identificar algo que afeta outro IDE:
1. Documentar em `docs/stories/` ou `docs/architecture/`
2. Rodar `npm run sync:ide` para propagar mudanças oficiais
3. **Nunca** modificar diretamente arquivos de outro IDE

---

## CONSTITUTION — Artigos Fundamentais

O projeto possui uma **Constitution formal** em `.aios-core/constitution.md`.
**O Codex CLI está sujeito a todos os artigos.**

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |

### Artigo I — CLI First
```
CLI First → Observability Second → UI Third
```
- Toda funcionalidade nova deve funcionar 100% via CLI antes de qualquer UI
- A UI nunca é requisito para operação do sistema

### Artigo II — Agent Authority (para o Codex CLI)

| Autoridade | Agente Exclusivo |
|------------|------------------|
| `git push` para remote | `@devops` |
| Criar Pull Requests | `@devops` |
| Criar releases/tags | `@devops` |
| Criar stories | `@sm`, `@po` |
| Decisões de arquitetura | `@architect` |
| Veredictos de qualidade | `@qa` |

---

## SISTEMA DE AGENTES

### Ativação no Codex CLI

**Preferência de ativação:**
1. Use `/skills` e selecione `aios-<agent-id>` de `.codex/skills/` (ex.: `aios-architect`)
2. Use atalhos de agente (ver lista abaixo)

**Atalhos aceitos:**

| Atalho | Agente | Persona |
|--------|--------|---------|
| `@aios-master`, `/aios-master` | AIOS Master Orchestrator | Orion |
| `@analyst`, `/analyst` | Analyst | Alex |
| `@architect`, `/architect` | Architect | Aria |
| `@data-engineer`, `/data-engineer` | Data Engineer | Dara |
| `@dev`, `/dev` | Full Stack Developer | Dex |
| `@devops`, `/devops` | DevOps | Gage |
| `@pm`, `/pm` | Product Manager | Morgan |
| `@po`, `/po` | Product Owner | Pax |
| `@qa`, `/qa` | QA Engineer | Quinn |
| `@sm`, `/sm` | Scrum Master | River |
| `@squad-creator`, `/squad-creator` | Squad Creator | — |
| `@ux-design-expert`, `/ux-design-expert` | UX Expert | Uma |

**Ao ativar atalho:**
1. Carregar fonte canônica: `.aios-core/development/agents/<agent>.md` (fallback: `.codex/agents/<agent>.md`)
2. Gerar greeting via: `node .aios-core/development/scripts/generate-greeting.js <agent>`
3. Assumir persona até receber `*exit`

---

## WORKFLOW DE DESENVOLVIMENTO

### Antes de começar qualquer tarefa
```
1. Ler a story em docs/stories/ (se existir)
2. git status — verificar estado do repositório
3. Ler os arquivos relevantes completamente
4. Confirmar o escopo com o usuário se houver dúvida
```

### Durante a tarefa
```
1. Fazer mudanças cirúrgicas (mínimo necessário)
2. Não modificar arquivos fora do escopo da story
3. Não criar arquivos desnecessários
4. Manter os padrões de código existentes
```

### Antes de considerar a tarefa concluída
```bash
npm run lint        # deve passar sem erros
npm run typecheck   # deve passar sem erros
npm test            # testes relevantes devem passar
git status          # revisar TODAS as mudanças
```

---

## SINCRONIZAÇÃO IDE

```bash
# Sincronizar todos os IDEs com a fonte canônica
npm run sync:ide

# Verificar drift entre IDEs
npm run sync:ide:check

# Sincronizar apenas Codex
npm run sync:skills:codex

# Validar paridade multi-IDE (Claude/Codex/Gemini)
npm run validate:parity

# Validar integração Codex
npm run validate:codex-sync && npm run validate:codex-integration
```

**Este repositório usa local-first:** prefira `.codex/skills/` versionado no projeto.
Use `sync:skills:codex:global` apenas para testes fora deste repositório.

---

## PADRÕES DE CÓDIGO

### Importações
```typescript
// ✓ Correto — imports absolutos
import { useStore } from '@/stores/feature/store'

// ✗ Errado — imports relativos
import { useStore } from '../../../stores/feature/store'
```

### Commits (quando autorizado pelo usuário)
```
feat: descrição da funcionalidade [Story NOG-X]
fix: descrição do bug [Story NOG-X]
docs: atualização de documentação
chore: manutenção e configuração
refactor: refatoração sem mudança de comportamento
test: adição ou correção de testes
```

**Atenção:** `git push` e criação de PR são exclusividade do `@devops`.

---

## COMANDOS FREQUENTES

```bash
# Desenvolvimento
npm run dev               # Iniciar ambiente de desenvolvimento
npm test                  # Rodar testes
npm run lint              # Verificar estilo de código
npm run typecheck         # Verificar tipos TypeScript
npm run build             # Build de produção

# AIOS CLI
node bin/aios.js info     # Informações do sistema
node bin/aios.js doctor   # Diagnóstico do sistema
node bin/aios.js validate # Validar configuração

# Git (apenas leitura — push é exclusivo do @devops)
git status
git log --oneline -10
git diff HEAD
```

---

## PROTOCOLO DE LIMITE DE CONTEXTO (LOW-TOKEN SAFETY)

### Cálculo de Margem de Tokens

O procedimento de backup requer os seguintes tokens para ser executado com segurança:

| Operação | Tokens estimados |
|----------|-----------------|
| Raciocínio / planejamento do backup | ~2.000 |
| Geração do relatório de sessão | ~1.500 |
| Overhead de chamadas de ferramentas (×10) | ~1.500 |
| Execução git add / commit / push | ~800 |
| Mensagem de aviso ao usuário | ~300 |
| Buffer de erro (1 retry) | ~2.000 |
| Margem de segurança (20%) | ~1.700 |
| **TOTAL NECESSÁRIO** | **~9.800 tokens** |
| **THRESHOLD CONFIGURADO** | **20.000 tokens** (100% de buffer) |

### Limites por IDE

| IDE | Contexto Total | Threshold de Alerta | % Usado ao Alertar |
|-----|---------------|--------------------|--------------------|
| Claude Code | 200.000 tokens | 15.000 restantes | ~92,5% usado |
| Gemini CLI | 1.000.000 tokens | 15.000 restantes | ~98,5% usado |
| **Codex CLI** | **128.000 tokens** | **20.000 restantes** | **~84,4% usado** |

> O Codex tem threshold maior (20k) pois sua janela de contexto é menor (128k),
> e o risco de esgotar tokens de forma abrupta é maior.

### Indicadores para o Codex CLI

O Codex CLI **não possui hook PreCompact** como o Claude Code.
Portanto, o Codex deve monitorar proativamente e agir quando perceber:

1. **Sinal primário:** A conversa excedeu ~25 turnos (mensagens de ida e volta)
2. **Sinal secundário:** A janela de contexto contém mais de 100.000 tokens estimados
3. **Sinal de emergência:** O Codex receber qualquer aviso interno de limite de contexto

### Protocolo de Backup (Codex CLI)

**Quando identificar qualquer sinal acima, ANTES de responder a próxima mensagem:**

```bash
# Passo 1: Avisar o usuário
echo "⚠️ AVISO: Aproximando-se do limite de contexto. Iniciando backup de sessão..."

# Passo 2: Executar o backup
node .aios-core/scripts/session-backup.js --provider=codex --reason=manual

# Passo 3: Informar o usuário sobre o resultado
```

**Mensagem obrigatória ao usuário:**
```
⚠️ LIMITE DE CONTEXTO PRÓXIMO

Iniciei um backup automático da sessão.
Relatório salvo em: .aios/session-reports/session-{timestamp}.md
Backup enviado para GitHub (branch atual).

Para continuar o trabalho em nova sessão:
"Retome a partir do relatório .aios/session-reports/session-{timestamp}.md"
```

---

## SEGURANÇA — CREDENCIAIS

Os seguintes arquivos **nunca devem ser commitados** (já estão no `.gitignore`):

```
.env
credentials.json
service-account.json
token.json
*.key
*.pem
oauth_creds.json
```

Se o Codex criar qualquer um destes arquivos, **não fazer commit** e notificar o usuário imediatamente.

---

## ESTRUTURA DO PROJETO

```
aios/
├── .aios-core/              # Core do framework (PROTEGIDO)
│   ├── core/                # Módulos principais
│   ├── data/                # Knowledge base, entity registry
│   ├── development/         # Agents, tasks, templates, scripts
│   └── infrastructure/      # CI/CD templates
├── .claude/                 # Configuração Claude Code (NÃO MODIFICAR)
├── .codex/                  # Configuração Codex CLI
│   ├── agents/              # Cópias dos agentes (sync via npm run sync:ide)
│   └── skills/              # Skills do Codex (sync via npm run sync:skills:codex)
├── .gemini/                 # Configuração Gemini CLI (NÃO MODIFICAR)
├── bin/                     # CLI executables
├── docs/                    # Documentação
│   └── stories/             # Stories de desenvolvimento
├── packages/                # Pacotes compartilhados
├── pro/                     # Submodule Pro (proprietário)
├── squads/                  # Squad expansions
└── tests/                   # Testes
```

---

*Synkra AIOS — Codex CLI Rules v2.0*
*CLI First | Observability Second | UI Third*
*Atualizado após incidente de 2026-02-19 — time Claude + Gemini + Codex*
