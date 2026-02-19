# Task: update-profile

**Agent:** @knowledge-monitor (Sage)
**Command:** `*update-profile {agent} {domain} {score} [source?]`
**Purpose:** Atualiza score de proficiência de um agente em um domínio

---

## Workflow

### Step 1 — Validate input
```
Validações:
  - agent: deve existir em agent-knowledge-profiles.yaml
  - domain: string válida (kebab-case)
  - score: número entre 0.0 e 1.0
  - source: opcional — se não fornecido, usar "manual"

SE score inválido (< 0 ou > 1):
  Erro: "Score deve estar entre 0.0 e 1.0. Recebido: {score}"

SE agent não existe no perfil:
  Perguntar: "@{agent} não encontrado. Criar novo perfil? [s/N]"
```

### Step 2 — Load current state
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml
2. Capturar valor anterior:
   old_score = profiles[agent][domain].score ?? null
   old_source = profiles[agent][domain].source ?? null
```

### Step 3 — Determine severity change
```
Calcular nova severidade do domínio:
  SE novo score >= 0.60 → OK (domínio coberto)
  SE 0.30 <= novo score < 0.60 → gap (brief recomendado)
  SE novo score < 0.30 → critical (aquisição mandatória)

SE old_score existe:
  delta = novo_score - old_score
  trend = "↑ melhoria" se delta > 0, "↓ regressão" se delta < 0, "→ sem mudança"
```

### Step 4 — Update profile file
```
Atualizar em agent-knowledge-profiles.yaml:
  {agent}.domains.{domain}:
    score: {novo_score}
    lastUpdated: {timestamp}
    source: {source ?? "manual"}
    # Manter notes existentes se houver

SE domain não existia no perfil:
  Adicionar nova entrada na seção correta:
    - SE score >= 0.80 → seção "# ✓ Well-covered"
    - SE score >= 0.60 → seção "# ✓ Well-covered" (com nota de monitorar)
    - SE score >= 0.30 → seção "# ⚠ Gaps (< 0.60)"
    - SE score < 0.30  → seção "# ✗ Critical gaps"
```

### Step 5 — Update knowledge-gaps.yaml
```
SE gap existia em knowledge-gaps.yaml com status=pending:
  SE novo score >= 0.60:
    Atualizar status: resolved
    Adicionar: resolvedAt, resolvedBy: {source}
  SE novo score >= 0.30 E era crítico:
    Atualizar: severity = "high" ou "medium" conforme score
    Atualizar: score no gap

SE score < 0.30 E gap não existia:
  Criar novo gap com severity=critical, status=pending
```

### Step 6 — Display update summary
```
Exibir:
  ✅ Perfil atualizado: @{agent} / {domain}

  Score:  {old_score ?? "não avaliado"} → {novo_score}
  Fonte:  {source}
  Trend:  {trend}
  Status: {OK / ⚠ gap / ✗ crítico}

  {SE gap resolvido}: "Gap {gap_id} marcado como resolvido"
  {SE novo gap criado}: "Novo gap {gap_id} registrado"

  {SE regressão (delta < 0)}:
    "⚠️ ATENÇÃO: Regressão detectada em {domain}. Considere *acquire {agent} {domain}"
```

---

## Critérios de Aceitação
- [ ] Valida score entre 0.0–1.0 antes de salvar
- [ ] Registra timestamp e source em toda atualização
- [ ] Exibe delta (melhoria/regressão) em relação ao score anterior
- [ ] Sincroniza knowledge-gaps.yaml (resolve ou cria gaps conforme necessário)
- [ ] Detecta e avisa sobre regressões
- [ ] Suporta criação de domínio novo no perfil (não apenas atualização)
- [ ] Nunca estima ou inventa scores — apenas registra o que foi fornecido
