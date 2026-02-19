# Task: knowledge-broker

**Agent:** @knowledge-monitor (Sage)
**Command:** `*broker {pattern} {from-agent} {to-agents...}`
**Purpose:** Transfere padrão descoberto de um agente para outros

---

## Workflow

### Step 1 — Locate pattern
```
1. Parse args:
   - pattern: nome/ID do padrão a transferir
   - from-agent: agente que descobriu o padrão
   - to-agents: lista de agentes destinatários

2. Buscar padrão nas fontes:
   a. .aios/gotchas.json → verificar se pattern existe como gotcha
   b. .aios-core/data/knowledge-briefs/ → briefs existentes do from-agent
   c. .aios-core/data/learned-patterns.yaml → padrões registrados
   d. SE não encontrado em nenhuma fonte:
      Perguntar: "Padrão '{pattern}' não encontrado. Deseja descrevê-lo agora? [s/N]"
      SE sim: receber descrição do usuário e continuar
```

### Step 2 — Extract pattern content
```
Dado o padrão encontrado, extrair:
  - title: nome claro do padrão
  - context: quando/onde este padrão se aplica
  - problem: qual problema ele resolve
  - solution: como aplicar o padrão (com exemplo se disponível)
  - gotchas: armadilhas ao implementar
  - domains: quais domínios este padrão toca
  - relevantAgents: quais agentes se beneficiam naturalmente
```

### Step 3 — Assess target agents
```
Para cada to-agent:
  Verificar .aios-core/data/agent-knowledge-profiles.yaml:
    - Quais domínios do padrão o agente já cobre bem?
    - Quais domínios estão em gap?

  Gerar contexto personalizado:
    - Adaptar linguagem ao domínio do agente (ex: dev recebe exemplos de código)
    - Focar nos aspectos mais relevantes para o papel do agente
    - Adicionar instruções específicas: "Para @qa: testar este padrão implica..."
```

### Step 4 — Create broker knowledge brief
```
Para cada to-agent:
  Criar arquivo .aios-core/data/knowledge-briefs/{to-agent}-broker-{pattern}-{ts}.md

  Conteúdo:
  ---
  # Pattern Transfer: {pattern}
  **De:** @{from-agent} ({from-persona})
  **Para:** @{to-agent} ({to-persona})
  **Via:** @knowledge-monitor (Sage) — Broker
  **Data:** {timestamp}

  ## Contexto do Padrão
  {context adaptado para o agente}

  ## Como Aplicar no Seu Contexto
  {solution com exemplos específicos para o papel do agente}

  ## Cuidados Específicos para @{to-agent}
  {gotchas relevantes para o papel/domínio do agente}
  ---
```

### Step 5 — Update profiles
```
Para cada to-agent:
  domínios cobertos pelo padrão:
    score_increment = 0.10 (padrão recebido via broker = +0.10 no domínio)
    Atualizar .aios-core/data/agent-knowledge-profiles.yaml:
      {to-agent}.domains.{domain}.score += 0.10 (cap 1.0)
      source: "broker:{from-agent}"
      lastUpdated: {timestamp}

Para from-agent:
  Registrar que padrão foi compartilhado:
    notes: "Padrão {pattern} brokeado para: {to-agents.join(', ')}"
```

### Step 6 — Queue for Synapse L8
```
SE .synapse/l8-knowledge-queue.json existe:
  Para cada to-agent:
    Adicionar ao queue:
      {
        "agent": "{to-agent}",
        "briefPath": "{brief_path}",
        "priority": "broker",
        "expiresAt": "{timestamp + 7 days}"
      }
```

### Step 7 — Report
```
Exibir:
  ✅ Broker concluído: {pattern}

  De: @{from-agent} ({from-persona})
  Para: {to-agents.map(a => "@" + a).join(", ")}

  Briefs gerados:
  {lista de paths de briefs}

  Scores atualizados:
  {tabela: agente | domínio | score anterior | score novo}

  {SE Synapse L8 ativo}: "Briefs enfileirados para injeção automática"
```

---

## Critérios de Aceitação
- [ ] Localiza padrão em gotchas, briefs ou learned-patterns
- [ ] Adapta conteúdo do padrão para o contexto de cada agente destinatário
- [ ] Cria brief personalizado por agente em knowledge-briefs/
- [ ] Atualiza scores nos perfis (incremento de +0.10 por padrão recebido)
- [ ] Registra fonte como "broker:{from-agent}" na atualização
- [ ] Enfileira briefs no Synapse L8 quando disponível
- [ ] Suporta múltiplos agentes destinatários em um único comando
