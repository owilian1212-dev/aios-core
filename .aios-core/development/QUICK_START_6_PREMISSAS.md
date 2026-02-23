# 🚀 QUICK START — 6 PREMISSAS PARA AGENTES

**Data:** 2026-02-23
**Versão:** 1.0
**Framework:** Synkra AIOS

---

## Ativação Rápida dos Agentes

### Para Ativar um Agente COM 6 Premissas

```bash
@dev          # Developer - Implementação com 6 premissas
@architect    # Arquiteto - Design técnico com 6 premissas
@qa           # QA - Testes respeitando 6 premissas
@data-engineer # Data Engineer - Schema/migrations com 6 premissas
```

**Automaticamente cada agente carregará:**
- Central index: `6-PREMISSAS-INDEX.md`
- Guidelines específicas: `agents/{agent}-guidelines-6-premissas.md`
- YAML config: `AGENTS_6_PREMISSAS_CONFIG.yaml`

---

## 📍 Localização dos Arquivos

```
/root/aios/.aios-core/development/
├── 6-PREMISSAS-INDEX.md                    ← Central hub (LEIA PRIMEIRO)
├── AGENTS_6_PREMISSAS_CONFIG.yaml          ← Configuração YAML dos agentes
├── QUICK_START_6_PREMISSAS.md              ← Este arquivo
└── agents/
    ├── dev-guidelines-6-premissas.md       ← @dev segue isto
    ├── architect-guidelines-6-premissas.md ← @architect segue isto
    ├── qa-guidelines-6-premissas.md        ← @qa segue isto
    └── data-engineer-guidelines-6-premissas.md ← @data-engineer segue isto
```

---

## 🎯 AS 6 PREMISSAS EM 60 SEGUNDOS

| # | Premissa | Essência |
|---|----------|----------|
| **1️⃣** | **Dependências** | Entenda ordem de implementação. Respeite DEPENDENCY_GRAPH.md |
| **2️⃣** | **DRY** | Nunca repita código. Centralize em `shared/` ou `constants/` |
| **3️⃣** | **KISS** | Escolha SEMPRE solução mais simples. Evite overengineering |
| **4️⃣** | **YAGNI** | Implemente APENAS essencial. Não antecipe futuro |
| **5️⃣** | **Feature-Based** | Organize por FUNCIONALIDADE, não por camada. `features/x/` |
| **6️⃣** | **SoC** | Cada arquivo = 1 responsabilidade. Separar concerns |

---

## 🔄 Fluxo de Trabalho com Agentes

### 1. Ativar Agente

```bash
@dev
# Agente carrega automaticamente:
# - 6 Premissas
# - Contexto completo
# - Workflows específicos
```

### 2. Agente Segue Checklist (6 Premissas)

```markdown
## 1️⃣ Dependências
- [ ] Respeitei dependências?
- [ ] Feature está mapeada em DEPENDENCY_GRAPH.md?

## 2️⃣ DRY
- [ ] Procurei por duplicação antes de implementar?
- [ ] Constants estão centralizadas?

## 3️⃣ KISS
- [ ] Solução é a mais simples possível?
- [ ] Evitei overengineering?

## 4️⃣ YAGNI
- [ ] Código é usado agora?
- [ ] Está no AC da story?

## 5️⃣ Feature-Based
- [ ] Feature inteira em `features/x/`?
- [ ] index.ts como API pública?

## 6️⃣ SoC
- [ ] Cada arquivo = 1 responsabilidade?
- [ ] Separei concerns corretamente?
```

### 3. Agente Valida Antes de Commit

```bash
npm run typecheck   # ✅ Sem erros
npm run lint        # ✅ Sem warnings
npm test            # ✅ Testes passando
npm run build       # ✅ Build sucesso
```

### 4. Commit com Referência às Premissas

```bash
git commit -m "feat: implement Feature X [Story 123]

- Add features/x/pages/XPage.tsx
- Add features/x/services/x.service.ts
- Add features/x/constants/x.constants.ts

Follows 6-premissas:
✅ Dependências mapeadas
✅ DRY centralizado
✅ KISS simples
✅ YAGNI essencial
✅ Feature-based
✅ SoC separado"
```

---

## 📚 Documentação Disponível

### Para Entender as 6 Premissas
📖 **Leia:** `/root/aios/.aios-core/development/6-PREMISSAS-INDEX.md`
- Explicação completa de cada premissa
- Exemplos de violação e correção
- Checklist universal
- Impacto mensurável

### Para Implementar (Developer)
📖 **Leia:** `/root/aios/.aios-core/development/agents/dev-guidelines-6-premissas.md`
- Workflow de implementação
- Code review checklist
- Exemplos práticos
- Violações = bloqueiam commit

### Para Arquitetar (Architect)
📖 **Leia:** `/root/aios/.aios-core/development/agents/architect-guidelines-6-premissas.md`
- Design review checklist
- Decisões arquiteturais críticas
- Feature-based vs Layer-based
- Quando rejeitar designs

### Para Testar (QA)
📖 **Leia:** `/root/aios/.aios-core/development/agents/qa-guidelines-6-premissas.md`
- Workflow de testes
- Organização feature-based de testes
- Separação Unit/Service/Component/E2E
- Cobertura mínima 80%

### Para Schema/Migrations (Data Engineer)
📖 **Leia:** `/root/aios/.aios-core/development/agents/data-engineer-guidelines-6-premissas.md`
- Organização de migrations por feature
- DRY em schema (enums, domains)
- YAGNI em campos
- SoC em migrations

---

## ✅ Verificação de Conformidade

### Comando Rápido (Para todo agente)

Antes de cada commit, faça este checklist mental:

```bash
# 1. Dependências
[ ] Verifiquei DEPENDENCY_GRAPH.md?
[ ] Minha feature não quebra dependências existentes?

# 2. DRY
[ ] Procurei por código repetido?
[ ] Constants estão centralizadas?

# 3. KISS
[ ] Usei a solução mais simples?
[ ] Evitei overengineering?

# 4. YAGNI
[ ] Código é usado agora?
[ ] Removi TODO comments sem issue?

# 5. Feature-Based
[ ] Tudo em features/x/?
[ ] index.ts exporta API pública?

# 6. SoC
[ ] Cada arquivo = 1 responsabilidade?
[ ] Não misturei layers?
```

**Se falhar em qualquer premissa:** ❌ **REFATORE ANTES DE COMMITAR**

---

## 🚨 Violações Críticas = BLOQUEADAS

| Violação | Severidade | Ação |
|----------|-----------|------|
| ❌ Feature não respeitando dependências | 🔴 CRÍTICA | REFATORE IMEDIATAMENTE |
| ❌ Código duplicado em 2+ lugares | 🔴 CRÍTICA | CENTRALIZE |
| ❌ Arquivo com 2+ responsabilidades | 🔴 CRÍTICA | SEPARE |
| ❌ YAGNI: código morto não-usado | 🟠 ALTA | REMOVA |
| ❌ Sem feature-based organization | 🟠 ALTA | REORGANIZE |
| ❌ Testes com <80% cobertura | 🟠 ALTA | ADICIONE TESTES |

---

## 🎓 Exemplo: Implementar Feature com 6 Premissas

### Requisito
```
[Story] Implementar página de Dashboard com gráficos
```

### Passo 1 — Planejamento (15 min)

```bash
# 1. Ler DEPENDENCY_GRAPH.md
cat /root/aios/DEPENDENCY_GRAPH.md

# ✓ Auth está pronto? ✅
# ✓ Clients está pronto? ✅
# ✓ Dashboard pode ser implementado? ✅

# 2. Entender requisitos
# - Story ID: 42
# - AC: Mostrar 4 gráficos + filtro por periodo
# - Essencial APENAS: gráficos solicitados
```

### Passo 2 — Design Arquitetural (10 min)

```
Estrutura Feature-Based:
features/dashboard/
├── pages/
│   └── DashboardPage.tsx
├── components/
│   ├── Chart.tsx
│   ├── ChartContainer.tsx
│   └── PeriodFilter.tsx
├── hooks/
│   └── useDashboardData.ts
├── services/
│   └── dashboard.service.ts
├── constants/
│   └── dashboard.constants.ts
├── types/
│   └── dashboard.types.ts
├── __tests__/
│   ├── DashboardPage.test.tsx
│   └── dashboard.service.test.ts
└── index.ts
```

### Passo 3 — Implementação

**Seguir checklist 6 premissas:**

```typescript
// ✅ 1. Dependências OK (Auth já existe)
// ✅ 2. DRY: charts config centralizado em constants
// ✅ 3. KISS: Chart simples, sem library pesada
// ✅ 4. YAGNI: Apenas 4 gráficos solicitados
// ✅ 5. Feature-based: tudo em features/dashboard
// ✅ 6. SoC: service tem lógica, component tem UI

// features/dashboard/services/dashboard.service.ts
export const dashboardService = {
  async getChartData(params) { },
  async getMetrics(period) { }
}

// features/dashboard/components/Chart.tsx
export function Chart({ data, title }) {
  return <div>{title}</div>
}

// features/dashboard/hooks/useDashboardData.ts
export function useDashboardData(period) {
  const { data, isLoading } = useQuery(...)
  return { data, isLoading }
}
```

### Passo 4 — Validação

```bash
npm run typecheck   # ✅
npm run lint        # ✅
npm test            # ✅
npm run build       # ✅
```

### Passo 5 — Commit

```bash
git commit -m "feat: implement dashboard with charts [Story 42]

- Add features/dashboard/* (feature-based)
- Add DashboardPage with 4 charts
- Add dashboard.service with API calls
- Add useDashboardData hook
- 85% test coverage

Follows 6-premissas:
✅ 1. Dependências: Auth required ✓
✅ 2. DRY: charts config centralized
✅ 3. KISS: simple Chart components
✅ 4. YAGNI: only 4 charts from AC
✅ 5. Feature-based: features/dashboard/
✅ 6. SoC: service|component|hooks separated"
```

---

## 🎯 Próxima Ação

Escolha uma:

### A) Refatorar Arquitetura Agora
Reorganizar projeto inteiro para feature-based + aplicar 6 premissas.
**Tempo estimado:** 5-7 horas
**Impacto:** Alto (arquitetura limpa por 100% do projeto)

### B) Criar Plano Detalhado de Refatoração
Fazer análise granular de cada feature e criar roadmap de refatoração.
**Tempo estimado:** 2 horas
**Impacto:** Médio (roadmap claro, execução futura)

### C) Aprofundar Análise de Uma Feature
Estudar uma feature completa (ex: CRM) e refatorá-la como template.
**Tempo estimado:** 1-2 horas
**Impacto:** Médio (padrão para próximas features)

### D) Continuar com Outra Frente
Deixar refatoração para depois e trabalhar em outra story urgente.
**Tempo estimado:** Variável
**Impacto:** Baixo (premissas seguidas em novas features apenas)

---

*Synkra AIOS — 6 Premissas Edition v1.0*
*Obrigatório para: @dev, @architect, @qa, @data-engineer*
*Atualizado: 2026-02-23*
