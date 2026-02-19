# GEMINI.md - Synkra AIOS Rules for Gemini CLI

> **Versão:** 2.0.0 | **Criado:** 2026-02-19 | **Motivo:** Correção de incidentes destrutivos
>
> Este arquivo define as regras de comportamento do Gemini CLI neste repositório.
> **Descumprir estas regras causa dano real ao projeto.**

---

## INCIDENTE REGISTRADO — 2026-02-19

O Gemini CLI causou as seguintes alterações destrutivas que exigiram restauração manual:

| Arquivo/Diretório | Dano |
|-------------------|------|
| `.claude/CLAUDE.md` | **DELETADO** (316 linhas) |
| `.claude/commands/AIOS/agents/*.md` | **DELETADOS** (11 agentes, ~4.400 linhas) |
| `.aios-core/constitution.md` | **ESVAZIADO** (171 linhas removidas) |
| `.aios-core/install-manifest.yaml` | **ESVAZIADO** (4.410 linhas removidas) |
| `.aios-core/core-config.yaml` | **CORROMPIDO** (180+ linhas de config crítica removidas) |

**Causa raiz:** O Gemini CLI realizou uma "reinstalação" tratando o projeto como `greenfield` quando era `EXISTING_AIOS`.

---

## ARQUIVOS PROTEGIDOS — NUNCA MODIFICAR SEM AUTORIZAÇÃO EXPLÍCITA

Os arquivos abaixo são **SOMENTE LEITURA** para o Gemini CLI.
Qualquer modificação requer aprovação explícita do usuário.

### Tier 1 — INTOCÁVEIS (nunca modificar, nunca deletar)

```
.claude/CLAUDE.md
.claude/commands/AIOS/agents/*.md
.aios-core/constitution.md
.aios-core/core-config.yaml
.aios-core/install-manifest.yaml
.aios-core/core/
.aios-core/development/agents/
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
```

---

## REGRAS ABSOLUTAS

### ❌ NUNCA FAZER

1. **Nunca deletar arquivos tracked pelo git** sem story aprovada e autorização explícita do usuário
2. **Nunca alterar `.aios-core/core-config.yaml`** — este arquivo define o estado do projeto
3. **Nunca alterar `project.type`** em `core-config.yaml` — o projeto é `EXISTING_AIOS`, não `greenfield`
4. **Nunca alterar `project.installedAt`** em `core-config.yaml` — data histórica do projeto
5. **Nunca esvaziar ou reescrever** arquivos de mais de 50 linhas sem leitura prévia completa
6. **Nunca rodar `npm install` ou `npm ci`** sem verificar se é necessário
7. **Nunca executar scripts de instalação** (`npx aios-core install`, `./install.sh`, etc.)
8. **Nunca fazer `git push`** — autoridade exclusiva do agente `@devops`
9. **Nunca criar Pull Requests** — autoridade exclusiva do agente `@devops`
10. **Nunca modificar configurações de IDE** em `core-config.yaml` sem autorização

### ✅ SEMPRE FAZER

1. **Ler o arquivo completamente** antes de qualquer modificação
2. **Verificar `git status`** antes e depois de qualquer operação
3. **Fazer mudanças cirúrgicas** — alterar apenas o necessário, nada mais
4. **Perguntar ao usuário** quando houver dúvida sobre escopo ou impacto
5. **Seguir stories** — toda tarefa de desenvolvimento deve ter uma story em `docs/stories/`
6. **Rodar quality gates** antes de considerar a tarefa concluída

---

## ENTENDIMENTO DO PROJETO

### Tipo de Projeto
```
type: EXISTING_AIOS
```
Este é um projeto **existente** em produção ativa. **NÃO É GREENFIELD.**
Toda instalação e configuração já foi realizada. O Gemini CLI é apenas mais uma ferramenta de desenvolvimento.

### Hierarquia de IDEs (definida em `core-config.yaml`)
```yaml
ide:
  selected:
    - vscode
    - codex
    - gemini
    - cursor
    - claude-code
```
Todos os IDEs listados estão ativos. O Gemini CLI **não tem autoridade para alterar esta lista.**

### MCP (Model Context Protocol)
```yaml
mcp:
  enabled: true
```
O MCP **está habilitado**. O Gemini CLI **nunca deve desabilitar o MCP** ou remover sua configuração.
Gerenciamento de MCP é responsabilidade exclusiva do agente `@devops`.

---

## SISTEMA DE AGENTES

O projeto usa um sistema multi-IDE onde agentes são sincronizados entre IDEs:

```
.aios-core/development/agents/  ← Fonte da verdade (canônica)
        ↓ sincronizado via ideSync
.claude/commands/AIOS/agents/   ← Para Claude Code
.gemini/rules/AIOS/agents/      ← Para Gemini CLI  ← VOCÊ ESTÁ AQUI
.codex/agents/                  ← Para Codex
.cursor/rules/agents/           ← Para Cursor
```

**Regra crítica:** O Gemini CLI deve **apenas ler** os agentes em `.gemini/rules/AIOS/agents/`.
**Nunca criar, modificar ou deletar** agentes sem sincronização com a fonte canônica.

### Agentes Disponíveis

| Agente | Persona | Escopo |
|--------|---------|--------|
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e decisões técnicas |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Stories e épicos |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Database e schema |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |
| `@aios-master` | — | Orquestrador principal |

---

## CONSTITUTION — Artigos Fundamentais

O projeto possui uma **Constitution formal** em `.aios-core/constitution.md`.

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |

**O Gemini CLI está sujeito a todos os artigos da Constitution.**

### Artigo II — Agent Authority (para o Gemini CLI)

O Gemini CLI deve respeitar as autoridades exclusivas:

| Autoridade | Agente Exclusivo |
|------------|------------------|
| `git push` para remote | `@devops` |
| Criar Pull Requests | `@devops` |
| Criar releases/tags | `@devops` |
| Criar stories | `@sm`, `@po` |
| Decisões de arquitetura | `@architect` |
| Veredictos de qualidade | `@qa` |

---

## OPERAÇÃO COMO TIME (Claude + Gemini + Codex)

Este projeto opera com **três IDEs simultâneos**. Cada um tem seu espaço e responsabilidade:

| IDE | Arquivo de Regras | Espaço de Agentes |
|-----|-------------------|-------------------|
| **Claude Code** | `.claude/CLAUDE.md` | `.claude/commands/AIOS/agents/` |
| **Gemini CLI** | `.gemini/rules.md` (este arquivo) | `.gemini/rules/AIOS/agents/` |
| **Codex CLI** | `AGENTS.md` | `.codex/agents/` + `.codex/skills/` |

### Fonte da Verdade Canônica
```
.aios-core/development/agents/  ← FONTE CANÔNICA de todos os agentes
        ↓ sincronizado via: npm run sync:ide
.claude/commands/AIOS/agents/   ← cópia para Claude Code
.gemini/rules/AIOS/agents/      ← cópia para Gemini CLI  ← VOCÊ ESTÁ AQUI
.codex/agents/                  ← cópia para Codex CLI
```

### Princípio de Não-Interferência
- **Gemini não altera** `.claude/` ou `.codex/`
- **Claude não altera** `.gemini/` ou `.codex/`
- **Codex não altera** `.claude/` ou `.gemini/`
- Cada IDE respeita o espaço dos outros

### Comunicação entre IDEs
Quando identificar algo que afeta outro IDE:
1. Documentar em `docs/stories/` ou `docs/architecture/`
2. Rodar `npm run sync:ide` para propagar mudanças oficiais
3. **Nunca** modificar diretamente arquivos de outro IDE

---

## USO DE FERRAMENTAS

| Tarefa | Ferramenta Recomendada | Nunca usar |
|--------|-------------------------|------------|
| Busca de conteúdo | `grep_search` | `grep` manual no shell |
| Localizar arquivos | `glob` | `find` manual |
| Leitura de arquivo | `read_file` | `cat`/`head`/`tail` |
| Modificação pontual | `replace` | Reescrever o arquivo inteiro |
| Comandos shell | `run_shell_command` | Apenas quando necessário |

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
```
1. npm run lint          → deve passar sem erros
2. npm run typecheck     → deve passar sem erros
3. npm test              → testes relevantes devem passar
4. git status            → revisar todas as mudanças
5. Reportar ao usuário   → listar arquivos criados/modificados/deletados
```

---

## PADRÕES DE CÓDIGO

### Importações
```typescript
// ✓ Correto — imports absolutos
import { useStore } from '@/stores/feature/store'

// ✗ Errado — imports relativos
import { useStore } from '../../../stores/feature/store'
```

### Commits (quando autorizado)
```
feat: descrição da funcionalidade [Story NOG-X]
fix: descrição do bug [Story NOG-X]
docs: descrição da documentação
chore: descrição da manutenção
```

**Atenção:** `git push` e criação de PR são exclusividade do `@devops`.

---

## VERIFICAÇÃO DE SEGURANÇA

Antes de qualquer operação, verifique:

```bash
# 1. Verificar tipo do projeto (deve ser EXISTING_AIOS)
grep "type:" .aios-core/core-config.yaml

# 2. Verificar estado do repositório
git status

# 3. Verificar arquivos críticos estão presentes
ls .claude/CLAUDE.md .aios-core/constitution.md .aios-core/core-config.yaml
```

Se `project.type` aparecer como `greenfield` — **PARAR IMEDIATAMENTE** e reportar ao usuário. O projeto foi corrompido.

---

## COMANDOS FREQUENTES

```bash
# Desenvolvimento
npm run dev               # Iniciar ambiente de desenvolvimento
npm test                  # Rodar testes
npm run lint              # Verificar estilo de código
npm run typecheck         # Verificar tipos TypeScript
npm run build             # Build de produção

# AIOS
node bin/aios.js info     # Informações do sistema
node bin/aios.js doctor   # Diagnóstico
node bin/aios.js validate # Validar squad (após mudanças em agentes)

# Git (apenas leitura — push é exclusivo do @devops)
git status
git log --oneline -10
git diff HEAD
```

---

## CREDENCIAIS E SEGURANÇA

Os seguintes arquivos **nunca devem ser commitados** (já estão no `.gitignore`):

```
.env
credentials.json
service-account.json
token.json
*.key
*.pem
```

Se o Gemini CLI criar qualquer um destes arquivos, **não fazer commit** e notificar o usuário imediatamente.

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
| **THRESHOLD CONFIGURADO** | **15.000 tokens** (50% de buffer) |

### Limites por IDE

| IDE | Contexto Total | Threshold de Alerta | % Usado ao Alertar |
|-----|---------------|--------------------|--------------------|
| Claude Code | 200.000 tokens | 15.000 restantes | ~92,5% usado |
| **Gemini CLI** | **1.000.000 tokens** | **15.000 restantes** | **~98,5% usado** |
| Codex CLI | 128.000 tokens | 20.000 restantes | ~84,4% usado |

### Indicadores para o Gemini CLI

O Gemini CLI **não possui hook PreCompact** como o Claude Code.
Portanto, o Gemini deve monitorar proativamente e agir quando perceber:

1. **Sinal primário:** A conversa excedeu ~40 turnos (mensagens de ida e volta)
2. **Sinal secundário:** A janela de contexto contém mais de 900.000 tokens estimados
3. **Sinal de emergência:** O Gemini receber aviso interno de limite de contexto

### Protocolo de Backup (Gemini CLI)

**Quando identificar qualquer sinal acima, ANTES de responder a próxima mensagem:**

```bash
# Passo 1: Avisar o usuário
echo "⚠️ AVISO: Aproximando-se do limite de contexto. Iniciando backup de sessão..."

# Passo 2: Executar o backup
node .aios-core/scripts/session-backup.js --provider=gemini --reason=manual

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

*Synkra AIOS — Gemini CLI Rules v2.0*
*CLI First | Observability Second | UI Third*
*Criado após incidente de 2026-02-19 | Low-Token Safety adicionado em 2026-02-19*
