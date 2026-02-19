# Task: publish-brief

**Agent:** @knowledge-monitor (Sage)
**Command:** `*publish {knowledge-brief-path} {agents...}`
**Purpose:** Publica um brief gerado para múltiplos agentes

---

## Workflow

### Step 1 — Validate and load
```
1. Verificar se {knowledge-brief-path} existe
   SE não existe: Erro "Brief não encontrado: {path}"

2. Read brief file → extrair metadados:
   - Domínio do brief
   - Agent original do brief
   - Scores e gaps documentados

3. Parse to-agents list (pode ser lista: "dev architect qa")
   SE agents == "all": expandir para todos os agentes do sistema

4. Read .aios-core/data/agent-knowledge-profiles.yaml → perfis dos destinatários
```

### Step 2 — Create per-agent copies
```
Para cada to-agent:
  Verificar relevância: brief se aplica ao to-agent?
    SE domínio do brief existe no perfil do agente → relevante
    SE domínio é cross-cutting (security, performance) → relevante para todos

  Criar cópia adaptada:
    - Adicionar header com destinatário e data de publicação
    - Adicionar seção "Instruções específicas para @{to-agent}"
    - Manter conteúdo original intacto

  Salvar em:
    .aios-core/data/knowledge-briefs/{to-agent}-published-{brief-name}-{ts}.md
```

### Step 3 — Queue for Synapse L8
```
SE .synapse/l8-knowledge-queue.json existe:
  Para cada to-agent:
    Adicionar entry no queue:
      {
        "agent": "{to-agent}",
        "briefPath": "{published_brief_path}",
        "priority": "published",
        "publishedBy": "knowledge-monitor",
        "publishedAt": "{timestamp}",
        "expiresAt": "{timestamp + 14 days}"
      }

  Exibir: "{n} briefs enfileirados para injeção automática via Synapse L8"
```

### Step 4 — Update scores (optional)
```
Perguntar: "Atualizar scores dos agentes com base no brief publicado? [s/N]"
  SE sim:
    Para cada to-agent:
      Para cada domínio abordado no brief:
        SE score atual < 0.50: incrementar +0.05 (publicação = exposição básica)
        Registrar source: "published-brief"
```

### Step 5 — Report
```
Exibir:
  ✅ Brief publicado com sucesso

  Origem: {brief-path}
  Publicado para: {agents_list}
  Briefs criados: {n}
  {SE Synapse L8}: "Enfileirados para injeção automática"
  {SE scores atualizados}: "Scores atualizados: {tabela}"

  Caminhos publicados:
  {lista de paths criados}
```

---

## Critérios de Aceitação
- [ ] Valida existência do brief antes de publicar
- [ ] Cria cópia personalizada por agente
- [ ] Adiciona instruções específicas por agente quando possível
- [ ] Enfileira no Synapse L8 quando disponível
- [ ] Suporta publicação para todos os agentes ("all")
- [ ] Incremento de score opcional (não obrigatório — publicação ≠ aquisição)
