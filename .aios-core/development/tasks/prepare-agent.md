# Task: prepare-agent

**Agent:** @knowledge-monitor (Sage)
**Command:** `*prepare {agent} {story-or-domain}`
**Purpose:** Prepara agente para story/domínio: scan + acquire + brief em sequência automática

---

## Workflow

### Step 1 — Parse context
```
1. Identificar agent e story-or-domain dos args
2. SE story-or-domain é path de story (contém "/" ou começa com "docs/"):
   - Read story file → extrair domínios técnicos mencionados
   - Identificar: stacks, padrões, bibliotecas, conceitos referenciados
   SENÃO:
   - Tratar como domain diretamente
3. Read .aios-core/data/agent-knowledge-profiles.yaml
4. Read .aios-core/data/knowledge-gaps.yaml
```

### Step 2 — Scan gaps for context
```
Executar lógica de scan-gaps filtrado por {agent} + domínios da story:
  gaps_relevantes = gaps do agente intersectados com domínios da story
  gaps_críticos = [g for g in gaps_relevantes if g.score < 0.30]
  gaps_atenção = [g for g in gaps_relevantes if 0.30 <= g.score < 0.60]

Exibir sumário:
  "Preparando @{agent} para: {story-or-domain}"
  "Gaps encontrados: {n_críticos} críticos, {n_atenção} de atenção"
```

### Step 3 — Acquire critical gaps (blocking)
```
SE gaps_críticos não vazio:
  Exibir: "⚠️ Aquisição obrigatória para {n} gaps críticos antes de prosseguir"
  Para cada gap_crítico (ordenado por score ASC):
    Executar workflow de acquire-knowledge.md
    Aguardar conclusão antes de próximo
  Exibir: "✅ Aquisição concluída para {n} domínios"

SE nenhum gap_crítico:
  Exibir: "✅ Nenhum gap crítico. Prosseguindo para brief."
```

### Step 4 — Acquire attention gaps (optional)
```
SE gaps_atenção não vazio:
  Perguntar: "Existem {n} gaps de atenção. Adquirir agora? [s/N]"
  SE sim: executar *acquire para cada gap de atenção
```

### Step 5 — Generate knowledge brief
```
Executar workflow de knowledge-brief.md com:
  agent = {agent}
  domain = domínio principal da story (ou "geral" se múltiplos)

Incluir no brief:
  - Scores pós-aquisição (atualizados)
  - Gotchas descobertos durante aquisição
  - Padrões específicos relevantes à story
```

### Step 6 — Final report
```
Exibir:
  ╔══════════════════════════════════════════════╗
  ║  @{agent} ({persona}) PRONTO para ativação   ║
  ╚══════════════════════════════════════════════╝

  Story/Domínio: {story-or-domain}
  Gaps resolvidos: {n}
  Score médio domínios relevantes: {avg_score}
  Brief gerado: {brief_path}
  Tempo total: {elapsed}s

  Para ativar:
  ┌─────────────────────────────────────────────┐
  │ @{agent}                                    │
  │ [brief será injetado automaticamente via L8] │
  └─────────────────────────────────────────────┘

Perguntar: "Deseja ativar @{agent} agora? [s/N]"
```

---

## Critérios de Aceitação
- [ ] Extrai domínios técnicos de stories automaticamente
- [ ] Executa scan → acquire → brief em sequência automatizada
- [ ] Não bloqueia em gaps de atenção (apenas gaps críticos são blocking)
- [ ] Exibe progresso claro em cada fase
- [ ] Gera brief final com scores pós-aquisição
- [ ] Informa path do brief para injeção no agente
- [ ] Tempo total não deve exceder 5 minutos para preparação completa
