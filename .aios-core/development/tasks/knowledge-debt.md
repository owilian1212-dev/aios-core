# Task: knowledge-debt

**Agent:** @knowledge-monitor (Sage)
**Command:** `*knowledge-debt [severity?]`
**Purpose:** Relatório completo de dívida de conhecimento do sistema

---

## Workflow

### Step 1 — Load state
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml
2. Read .aios-core/data/knowledge-gaps.yaml
3. Parse arg: severity filter (critical | high | medium | all)
```

### Step 2 — Calculate debt metrics
```
Para cada agente:
  totalDomains = count(domains)
  coveredDomains = count(score >= 0.60)
  gapDomains = count(0.30 <= score < 0.60)
  criticalDomains = count(score < 0.30)

  agentDebtScore = (sum of (1 - score) para todos domínios) / totalDomains
  knowledgeCoverage = coveredDomains / totalDomains

systemDebtScore = média de agentDebtScore de todos agentes
```

### Step 3 — Generate report

```markdown
# 📚 Knowledge Debt Report
**Gerado em:** {timestamp}
**Por:** @knowledge-monitor (Sage)
**Filtro aplicado:** {severity ?? "todos"}

---

## Sumário Executivo

| Métrica | Valor |
|---------|-------|
| Dívida sistêmica | {systemDebtScore:.0%} |
| Cobertura total | {coverage:.0%} |
| Gaps críticos | {total_critical} |
| Gaps altos | {total_high} |
| Gaps médios | {total_medium} |
| Domínios OK | {total_ok} |

---

## Dívida por Agente

| Agente | Persona | Cobertura | Score Médio | Críticos | Altos | Médios |
|--------|---------|-----------|-------------|---------|-------|--------|
| @dev | Dex | {cov%} | {avg} | {n} | {n} | {n} |
| @architect | Aria | ... | ... | ... | ... | ... |
| @qa | Quinn | ... | ... | ... | ... | ... |
| @pm | Morgan | ... | ... | ... | ... | ... |
| @analyst | Alex | ... | ... | ... | ... | ... |
| @data-engineer | Dara | ... | ... | ... | ... | ... |
| @sm | River | ... | ... | ... | ... | ... |
| @po | Pax | ... | ... | ... | ... | ... |
| @devops | Gage | ... | ... | ... | ... | ... |
| @aios-master | Orion | ... | ... | ... | ... | ... |

---

## Top 10 — Gaps Mais Críticos

| # | Agente | Domínio | Score | Severidade | Dias pendente |
|---|--------|---------|-------|-----------|--------------|
| 1 | @{agent} | {domain} | {score} | 🔴 crítico | {dias} |
...

---

## Análise de Tendência

{SE existirem históricos de score}
  Domínios melhorando: {lista}
  Domínios estagnados (>30 dias sem mudança): {lista}
  Domínios nunca avaliados (score null): {lista}

---

## Plano de Remedição Recomendado

### Prioridade Imediata (score = 0.00)
{lista de domínios com score zero + comando *acquire}

### Próxima Sprint
{5 gaps de maior impacto operacional}

### Backlog de Conhecimento
{demais gaps ordenados por severidade}

---

## Comandos Sugeridos

Para iniciar aquisição dos gaps críticos:
{*acquire {agent} {domain} para cada gap crítico}

Para briefing antes de ativação:
{*knowledge-brief {agent} para cada agente com críticos}
```

### Step 4 — Output
```
Exibir relatório no terminal
Perguntar: "Deseja iniciar aquisição automática para os {n} gaps críticos? [s/N]"
  SE sim: executar *acquire para cada gap crítico em sequência (respeitando ordem de prioridade)
```

---

## Critérios de Aceitação
- [ ] Calcula dívida por agente e sistêmica corretamente
- [ ] Exibe tabela resumo de todos os agentes
- [ ] Lista top 10 gaps mais críticos
- [ ] Filtra por severity se arg fornecido
- [ ] Sugere plano de remediação ordenado por impacto
- [ ] Oferece aquisição imediata dos críticos
- [ ] Não falha se dados incompletos (graceful degradation)
