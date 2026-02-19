# Task: knowledge-brief

**Agent:** @knowledge-monitor (Sage)
**Command:** `*knowledge-brief {agent} [domain?]`
**Purpose:** Gera brief especializado para injetar antes da ativação de um agente

---

## Workflow

### Step 1 — Load agent profile
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml → perfil do agente
2. Read .aios-core/data/knowledge-gaps.yaml → gaps pendentes do agente
3. Read .aios/gotchas.json → gotchas relevantes ao agente/domínio
4. Read .aios-core/data/entity-registry.yaml → entidades relacionadas ao domínio
```

### Step 2 — Filter by domain (if provided)
```
SE domain fornecido:
  Filtrar perfil: apenas domínios que intersectam com domain
  Filtrar gaps: apenas gaps do domain especificado
  Filtrar gotchas: apenas gotchas com keywords do domain
SENÃO:
  Usar todos os domínios com score < 0.90 como contexto relevante
  Focar nos 5 domínios com menor score
```

### Step 3 — Acquire missing knowledge (if gaps critical)
```
Para gaps com score < 0.30 E status=pending:
  ANTES de gerar o brief, adquirir conhecimento via MCPs:
    - Context7: buscar documentação técnica
    - EXA: buscar melhores práticas atuais
  Salvar resultado em: .aios-core/data/knowledge-briefs/{agent}-{domain}-{ts}.md
  Atualizar score no perfil após aquisição
```

### Step 4 — Compose brief

Formato do brief gerado:

```markdown
# Knowledge Brief: @{agent} ({persona})
**Domínio:** {domain ?? "geral"}
**Gerado em:** {timestamp}
**Por:** @knowledge-monitor (Sage)

---

## Perfil de Proficiência

| Domínio | Score | Status |
|---------|-------|--------|
| {domain} | {score} | {✓ / ⚠ gap / ✗ crítico} |

---

## Conhecimento Prioritário para esta Sessão

### Pontos Fortes (score ≥ 0.80)
{lista de domínios que o agente domina — contexto de confiança}

### Áreas de Atenção (score 0.60–0.80)
{lista de domínios com ressalvas — usar com cuidado, verificar antes de decidir}

### Lacunas Conhecidas (score < 0.60)
{lista de lacunas — NÃO ASSUMIR conhecimento; pesquisar explicitamente}

---

## Gotchas Relevantes
{gotchas do .aios/gotchas.json filtrados por relevância}

---

## Padrões Adquiridos nesta Sessão
{conhecimento buscado via Context7/EXA durante a geração deste brief}

---

## Instruções para o Agente

Ao iniciar sua sessão:
1. Consulte as Lacunas Conhecidas antes de tomar decisões no domínio
2. Para domínios com score < 0.30: pesquise explicitamente via Context7/EXA antes de agir
3. Registre novos gotchas via `*gotcha` se encontrar problemas não documentados
4. Informe @knowledge-monitor ao concluir: `*update-profile {agent} {domain} {novo-score}`
```

### Step 5 — Save and inject
```
1. Salvar brief em: .aios-core/data/knowledge-briefs/{agent}-{ts}.md
2. SE Synapse L8 habilitado:
     Registrar caminho do brief em .synapse/l8-knowledge-queue.json
     (Synapse injetará automaticamente na próxima ativação do agente)
3. Exibir resumo do brief ao usuário
4. Oferecer: "Deseja ativar @{agent} agora com este brief? [s/N]"
```

---

## Critérios de Aceitação
- [ ] Gera brief personalizado por agente e domínio
- [ ] Inclui scores atuais do perfil
- [ ] Inclui gotchas relevantes do .aios/gotchas.json
- [ ] Adquire conhecimento via MCPs para gaps críticos antes de gerar
- [ ] Salva brief em .aios-core/data/knowledge-briefs/
- [ ] Integra com Synapse L8 quando disponível
- [ ] Não bloqueia ativação do agente (graceful — brief é complemento, não requisito)
