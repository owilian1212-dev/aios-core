# Task: acquire-knowledge

**Agent:** @knowledge-monitor (Sage)
**Command:** `*acquire {agent} {domain}`
**Purpose:** Orquestra aquisição ativa de conhecimento via MCPs (Context7, EXA, Apify)

---

## Workflow

### Step 1 — Load context
```
1. Read .aios-core/data/agent-knowledge-profiles.yaml → perfil atual do agente
2. Read .aios-core/data/knowledge-gaps.yaml → plano de aquisição do domain
3. Read .aios-core/data/entity-registry.yaml → entidades relacionadas ao domain
4. Verificar: gap existe? SE não → gerar acquisitionPlan com fontes automáticas
```

### Step 2 — Determine acquisition plan
```
SE gap encontrado em knowledge-gaps.yaml:
  Usar acquisitionPlan.sources definido no gap
SENÃO:
  Auto-gerar sources:
    - context7: "{domain} documentation best practices"
    - exa: "{domain} patterns {current_year}"
```

### Step 3 — Execute acquisition via MCPs

```
Para cada source no acquisitionPlan:
  SE source.type == "context7":
    1. Chamar context7.resolve-library-id com query
    2. Chamar context7.get-library-docs com library-id
    3. Extrair padrões relevantes e exemplos de código

  SE source.type == "exa":
    1. Chamar exa.web_search com query
    2. Filtrar resultados: apenas fontes de alta qualidade
    3. Extrair insights principais (max 5 por busca)

  SE source.type == "apify":
    1. Chamar apify.search-actors para encontrar actor adequado
    2. Executar scraping para conteúdo especializado
    3. Processar e sintetizar resultados

Agregar todos os resultados em knowledge_content
```

### Step 4 — Synthesize knowledge

```
Com knowledge_content coletado:

1. Identificar: padrões chave, anti-padrões, gotchas específicos
2. Gerar sumário executivo (para o agente consumir rapidamente)
3. Estruturar seções:
   - Conceitos Fundamentais
   - Padrões Recomendados (com exemplos)
   - Anti-padrões a Evitar
   - Gotchas e Edge Cases
   - Referências e Links
4. Calcular score_adquirido com base na cobertura:
   - 1-2 fontes superficiais → +0.20
   - 3+ fontes com profundidade → +0.35
   - Exemplos de código incluídos → +0.10
   - Anti-padrões documentados → +0.05
```

### Step 5 — Save and update

```
1. Salvar knowledge brief em:
   .aios-core/data/knowledge-briefs/{agent}-{domain}-{timestamp}.md

2. Atualizar knowledge-gaps.yaml:
   - status: resolved (SE score_resultante >= 0.60) ou in-progress
   - resolvedAt: {timestamp}
   - resolvedBy: context7/exa/apify

3. Atualizar agent-knowledge-profiles.yaml:
   - {agent}.domains.{domain}.score: antigo + score_adquirido (cap 1.0)
   - {agent}.domains.{domain}.lastUpdated: {timestamp}
   - {agent}.domains.{domain}.source: "context7+exa" (ou sources usadas)

4. SE novo gotcha identificado durante aquisição:
   Registrar em .aios/gotchas.json via formato padrão
```

### Step 6 — Report
```
Exibir:
  ✅ Conhecimento adquirido: {agent} / {domain}
  Score anterior: {old_score} → Score novo: {new_score}
  Fontes consultadas: {sources_used}
  Brief salvo em: {output_file}
  Gotchas novos: {n}

Perguntar: "Deseja gerar knowledge-brief completo para @{agent} agora? [s/N]"
```

---

## Arquivo de Output (Formato)

```markdown
# Knowledge Acquisition: @{agent} — {domain}
**Adquirido em:** {timestamp}
**Fontes:** {sources_list}
**Score antes:** {old_score} → **Score depois:** {new_score}

---

## Sumário Executivo
{3-5 pontos chave que o agente DEVE saber}

## Conceitos Fundamentais
{explicação dos conceitos core do domínio}

## Padrões Recomendados
{padrões com exemplos de código quando aplicável}

## Anti-padrões — NÃO FAÇA
{lista de anti-padrões identificados}

## Gotchas e Edge Cases
{problemas específicos encontrados durante pesquisa}

## Referências
{links de documentação oficial e recursos de alta qualidade}
```

---

## Critérios de Aceitação
- [ ] Executa aquisição via Context7, EXA ou Apify conforme acquisitionPlan
- [ ] Gera brief estruturado com padrões e anti-padrões
- [ ] Salva brief em .aios-core/data/knowledge-briefs/
- [ ] Atualiza score no perfil do agente com cálculo correto
- [ ] Atualiza status do gap em knowledge-gaps.yaml
- [ ] Registra novos gotchas encontrados durante aquisição
- [ ] Não falha se MCP indisponível (degrada graciosamente com aviso)
- [ ] Respeita limite de tokens por source (estimatedTokens do gap)
