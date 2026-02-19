# Task: freshness-check

**Agent:** @knowledge-monitor (Sage)
**Command:** `*freshness-check [agent?]`
**Purpose:** Verifica se conhecimento está obsoleto (libs atualizadas, docs mudaram, score stale)

---

## Workflow

### Step 1 — Load profiles
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml
2. Read .aios-core/data/entity-registry.yaml → obter versões de libs registradas
3. Parse arg: agent filter (SE não fornecido → todos os agentes)
4. currentDate = hoje
```

### Step 2 — Detect stale domains
```
Para cada agente (ou agente filtrado):
  Para cada domain no perfil:
    daysOld = (currentDate - lastUpdated) em dias

    SE lastUpdated == null:
      staleness = "never-assessed"

    SENÃO SE daysOld > 90:
      staleness = "stale" (>90 dias sem atualização)

    SENÃO SE daysOld > 30 AND score < 0.70:
      staleness = "aging" (>30 dias, score médio/baixo)

    SENÃO:
      staleness = "fresh"
```

### Step 3 — Check for library version changes
```
Para cada domain que menciona biblioteca específica:
  Verificar no entity-registry se há versão registrada

  Domínios com detecção automática de versão:
    - nextjs-15 → verificar tag next em entity-registry
    - react-patterns → verificar react version
    - typescript → verificar ts version
    - supabase-rls → verificar @supabase/supabase-js version
    - playwright-e2e → verificar playwright version

  SE versão no entity-registry != versão conhecida no score:
    Marcar como "version-updated" → requer re-aquisição
```

### Step 4 — Generate freshness report

```markdown
## 🔄 Freshness Check — {agent ?? "Todos os agentes"}
**Verificado em:** {timestamp}

### Sumário
| Status | Domínios |
|--------|---------|
| ✅ Fresh (< 30 dias) | {n} |
| ⏳ Aging (30–90 dias) | {n} |
| 🔴 Stale (> 90 dias) | {n} |
| ⚫ Nunca avaliado | {n} |
| 🔄 Versão atualizada | {n} |

### Domínios que Requerem Atenção

#### 🔴 Stale (> 90 dias sem atualização)
| Agente | Domínio | Última Atualização | Score | Ação |
|--------|---------|-------------------|-------|------|
| @{agent} | {domain} | {date} ({days}d) | {score} | *acquire |

#### 🔄 Versão de Biblioteca Atualizada
| Agente | Domínio | Versão Anterior | Versão Atual | Ação |
|--------|---------|----------------|--------------|------|
| @{agent} | {domain} | {old_ver} | {new_ver} | *acquire |

#### ⚫ Nunca Avaliados
| Agente | Domínio | Score | Ação |
|--------|---------|-------|------|
| @{agent} | {domain} | 0.0 | *assess |
```

### Step 5 — Create staleness gaps
```
Para cada domínio com staleness == "stale" ou "version-updated":
  SE gap não existe em knowledge-gaps.yaml:
    Criar gap com:
      detectedBy: freshness-watcher
      trigger: "Score stale: {days} dias sem atualização" ou "Biblioteca atualizada"
      severity: calculada pelo score atual
      status: pending
```

### Step 6 — Output
```
Exibir relatório
Perguntar: "Encontrados {n} domínios stale. Iniciar re-aquisição? [s/N]"
  SE sim: executar *acquire para cada domínio stale em ordem de prioridade
```

---

## Agendamento Automático (Phase 2)
```
Quando Synapse L8 estiver ativo, freshness-check pode ser:
  - Executado automaticamente a cada 30 dias por cron
  - Disparado na ativação de agente (verificar lastUpdated dos domínios relevantes)
  - Integrado ao workflow *prepare como Step 0

Config em .aios-core/core-config.yaml:
  knowledge:
    freshnessCheckIntervalDays: 30
    stalenessThresholdDays: 90
```

---

## Critérios de Aceitação
- [ ] Detecta domínios com lastUpdated > 90 dias como stale
- [ ] Detecta domínios nunca avaliados (lastUpdated = null)
- [ ] Verifica versões de bibliotecas quando disponível no entity-registry
- [ ] Gera gaps de staleness em knowledge-gaps.yaml
- [ ] Exibe relatório formatado com ações recomendadas
- [ ] Funciona por agente ou para todo o sistema
- [ ] Não falha se entity-registry não tiver informações de versão
