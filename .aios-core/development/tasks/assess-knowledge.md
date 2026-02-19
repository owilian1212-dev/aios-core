# Task: assess-knowledge

**Agent:** @knowledge-monitor (Sage)
**Command:** `*assess {agent} {domain}`
**Purpose:** Avalia score de proficiência de um agente em um domínio (0.0–1.0) via análise de evidências

---

## Workflow

### Step 1 — Gather evidence
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml → score atual (se existir)
2. Read .aios-core/data/entity-registry.yaml → entidades do domain
3. Read .aios/gotchas.json → gotchas relacionados ao agent e domain
4. Read .aios-core/data/knowledge-briefs/ → briefs existentes do agent/domain
5. Read docs/stories/ → stories resolvidas pelo agent no domain

Coletar evidências:
  evidence = {
    entityRegistryMatches: [], // entidades do domain no registry
    gotchasInDomain: [],       // gotchas capturados no domain
    briefsExisting: [],        // briefs de conhecimento existentes
    storiesCompleted: [],      // stories do domain concluídas
    lastKnownScore: null,      // score anterior se existir
  }
```

### Step 2 — Score calculation
```
Algoritmo de pontuação baseado em evidências:

BASE SCORE (sem evidências = 0.0):

  +0.20 SE domain está coberto em entity-registry (patterns documentados)
  +0.15 SE 3+ entidades do domain no entity-registry
  +0.10 SE gotchas do domain foram capturados (agent aprendeu de erros)
  +0.15 SE brief de conhecimento existe para este domain
  +0.10 SE story concluída no domain (experiência prática)
  +0.10 por cada story adicional (cap: +0.20 total de stories)
  -0.10 SE gotcha foi "resolvido" mas voltou a ocorrer (pattern instável)
  -0.15 SE lastUpdated > 90 dias (staleness penalty)

AJUSTE DE CONFIANÇA:
  SE score calculado > 0.60 mas lastUpdated == null: cap em 0.55
  SE score calculado > 0.80 mas < 3 evidências sólidas: cap em 0.75

score_calculado = min(1.0, max(0.0, soma de evidências))
```

### Step 3 — Generate assessment report

```markdown
## 📊 Assessment: @{agent} / {domain}
**Avaliado em:** {timestamp}
**Por:** @knowledge-monitor (Sage)

### Score de Proficiência
**{score_calculado}** ({descriptor})

| Score | Descriptor |
|-------|-----------|
| 0.90–1.0 | ✅ Expert |
| 0.70–0.90 | ✅ Proficiente |
| 0.60–0.70 | ✅ Adequado |
| 0.45–0.60 | ⚠️ Lacuna (brief recomendado) |
| 0.30–0.45 | ⚠️ Lacuna significativa |
| 0.10–0.30 | ✗ Crítico (aquisição obrigatória) |
| 0.00–0.10 | ✗ Desconhecido |

### Evidências Encontradas
| Evidência | Encontrada | Peso |
|-----------|-----------|------|
| Entidades no entity-registry | {sim/não} | +0.20 |
| 3+ entidades cobertas | {sim/não} | +0.15 |
| Gotchas capturados | {sim/não} | +0.10 |
| Brief de conhecimento existe | {sim/não} | +0.15 |
| Stories concluídas | {n stories} | +{peso} |

### Recomendação
{SE score < 0.30}: "🔴 Aquisição obrigatória antes de ativar @{agent} neste domain"
{SE score < 0.60}: "⚠️ Brief recomendado: *knowledge-brief {agent} {domain}"
{SE score >= 0.60}: "✅ Agente adequado para operar neste domain"

**Comando sugerido:** {*acquire ou *knowledge-brief ou nada}
```

### Step 4 — Update profile
```
SE score calculado != score atual no perfil:
  Atualizar agent-knowledge-profiles.yaml:
    score: {score_calculado}
    lastUpdated: {timestamp}
    source: "gap-scanner" (assessment automático)

Exibir diferença:
  "Score atualizado: {old} → {score_calculado}"
```

---

## Critérios de Aceitação
- [ ] Coleta evidências de entity-registry, gotchas, briefs e stories
- [ ] Calcula score baseado em evidências reais (não estimativas)
- [ ] Aplica penalties de staleness (lastUpdated > 90 dias)
- [ ] Exibe relatório com evidências detalhadas e pesos
- [ ] Recomenda ação baseada no score calculado
- [ ] Atualiza perfil após assessment
- [ ] Nunca inventa scores sem base em dados (Constitution Artigo IV)
