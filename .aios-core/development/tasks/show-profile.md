# Task: show-profile

**Agent:** @knowledge-monitor (Sage)
**Command:** `*profile {agent}`
**Purpose:** Exibe perfil completo de conhecimento de um agente

---

## Workflow

### Step 1 — Load data
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml → perfil do agente
2. Read .aios-core/data/knowledge-gaps.yaml → gaps pendentes do agente
3. Read .aios-core/data/knowledge-briefs/ → listar briefs existentes do agente
4. SE agent não existe: Erro "Agente @{agent} não encontrado no registry"
```

### Step 2 — Calculate metrics
```
domains = profiles[agent].domains
totalDomains = count(domains)
expertDomains = count(score >= 0.80)
proficientDomains = count(0.60 <= score < 0.80)
gapDomains = count(0.30 <= score < 0.60)
criticalDomains = count(score < 0.30)

overallScore = média ponderada de todos os scores
  (domínios com score = 0 e nunca avaliados são incluídos)

pendingGaps = gaps[agent].filter(status == "pending")
briefsAvailable = count(knowledge-briefs para o agente)
```

### Step 3 — Display profile

```markdown
╔══════════════════════════════════════════════════════════════╗
║  Perfil de Conhecimento: @{agent} ({persona})               ║
╚══════════════════════════════════════════════════════════════╝

**Score geral:** {overallScore:.2f} | **Cobertura:** {coverage:.0%}

┌─────────────────────────────────────────────────────────────┐
│  ✅ Expert (≥ 0.80)      │ {n} domínios                    │
│  ✅ Proficiente (0.60–0.80)│ {n} domínios                   │
│  ⚠️ Lacuna (0.30–0.60)   │ {n} domínios                    │
│  ✗ Crítico (< 0.30)      │ {n} domínios                    │
└─────────────────────────────────────────────────────────────┘

---

## Domínios por Categoria

### ✅ Pontos Fortes (score ≥ 0.80)
| Domínio | Score | Fonte | Última Atualização |
|---------|-------|-------|-------------------|
| {domain} | {score} | {source} | {date} |

### ✅ Adequado (0.60–0.80)
| Domínio | Score | Fonte | Última Atualização |
|---------|-------|-------|-------------------|

### ⚠️ Lacunas — Brief Recomendado (0.30–0.60)
| Domínio | Score | Fonte | Última Atualização | Gap ID |
|---------|-------|-------|-------------------|----|

### ✗ Críticos — Aquisição Obrigatória (< 0.30)
| Domínio | Score | Gap ID | Status |
|---------|-------|--------|--------|

---

## Gaps Pendentes

Total: {total_pending} gaps

| ID | Domínio | Severidade | Detectado em | Dias pendente |
|----|---------|-----------|-------------|--------------|
| KG-{id} | {domain} | 🔴/🟠/🟡 | {date} | {days} |

---

## Briefs Disponíveis
{n} briefs de conhecimento gerados para este agente:
{lista de paths com data e domínio}

---

## Comandos Sugeridos

{SE criticalDomains > 0}:
  "*scan-gaps {agent}" — Escanear e atualizar lista de gaps
  "*acquire {agent} {domain_mais_crítico}" — Aquisição imediata

{SE gapDomains > 0}:
  "*knowledge-brief {agent}" — Gerar brief completo

{SE staleDomains > 0}:
  "*freshness-check {agent}" — Verificar obsolescência
```

---

## Critérios de Aceitação
- [ ] Exibe perfil completo organizado por categoria de score
- [ ] Calcula e exibe score geral e percentual de cobertura
- [ ] Lista gaps pendentes com dias de antiguidade
- [ ] Mostra briefs disponíveis
- [ ] Sugere comandos específicos baseados no estado do perfil
- [ ] Formatação clara e legível no terminal
