# Task: scan-gaps

**Agent:** @knowledge-monitor (Sage)
**Command:** `*scan-gaps [agent?] [domain?]`
**Purpose:** Detecta lacunas de conhecimento comparando perfis contra thresholds

---

## Workflow

### Step 1 — Load state
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml
2. Read .aios-core/data/knowledge-gaps.yaml
3. Parse args: agent filter, domain filter
```

### Step 2 — Compute gaps
```
Para cada agente (ou agente filtrado):
  Para cada domínio no perfil:
    score = profiles[agent][domain].score ?? 0.0

    IF score < 0.30 → severity = critical
    IF score >= 0.30 AND score < 0.60 → severity = high ou medium
    IF score >= 0.60 → OK (exibir apenas se --verbose)

    IF gap existente em knowledge-gaps.yaml E status=pending:
      marcar como "já registrado"
    ELSE IF novo gap detectado:
      adicionar ao knowledge-gaps.yaml com status=pending
```

### Step 3 — Generate report

```markdown
## 🔍 Knowledge Gap Scan — {agent ?? "Todos os agentes"}

### Sumário
| Severidade | Quantidade |
|------------|-----------|
| 🔴 Crítico  | {n}        |
| 🟠 Alto     | {n}        |
| 🟡 Médio    | {n}        |
| ✅ OK       | {n}        |

### Gaps por Agente

#### @{agent} ({persona})
| Domínio | Score | Severidade | Status |
|---------|-------|-----------|--------|
| {domain} | {score} | {severity} | {status} |
...

### Recomendações Imediatas
1. {gap mais crítico} → `*acquire {agent} {domain}`
2. {segundo gap} → `*knowledge-brief {agent} {domain}`
```

### Step 4 — Update knowledge-gaps.yaml
```
Para cada novo gap detectado:
  - Gerar ID sequencial (KG-{next})
  - Preencher: agent, domain, severity, score, detectedAt, detectedBy=gap-scanner
  - acquisitionPlan: sources via Context7/EXA (auto-suggestir baseado no domínio)
  - status: pending
  - Append ao arquivo
```

### Step 5 — Output
```
Exibir relatório no terminal
Perguntar: "Deseja iniciar aquisição para os gaps críticos? [s/N]"
  SE sim: executar *acquire para cada gap crítico em sequência
```

---

## Critérios de Aceitação
- [ ] Lê perfis e calcula gaps corretamente
- [ ] Identifica severidade por threshold (0.30 / 0.60)
- [ ] Atualiza knowledge-gaps.yaml com novos gaps
- [ ] Exibe relatório formatado e legível
- [ ] Oferece opção de aquisição imediata
- [ ] Não falha se arquivo de perfis não existir (graceful degradation)
