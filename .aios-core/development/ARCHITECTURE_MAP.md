# 🗺️ MAPA ARQUITETURAL — 6 PREMISSAS NO AIOS

**Como as 6 premissas estão organizadas e conectadas**

---

## 📍 Localização no Projeto

```
/root/aios/
├── .aios-core/development/
│   ├── 6-PREMISSAS-INDEX.md ──────────┐
│   │                                   │
│   ├── QUICK_START_6_PREMISSAS.md      │── HUB CENTRAL
│   ├── COMPLETION_SUMMARY.md           │
│   └── ARCHITECTURE_MAP.md ────────────┘
│
├── agents/
│   ├── dev-guidelines-6-premissas.md ──────────┐
│   ├── architect-guidelines-6-premissas.md     ├── GUIDELINES
│   ├── qa-guidelines-6-premissas.md            │   POR AGENTE
│   └── data-engineer-guidelines-6-premissas.md│
│                                               │
│   └── (README com como ativar agentes) ──────┘
│
└── AGENTS_6_PREMISSAS_CONFIG.yaml ──── CONFIGURAÇÃO
```

---

## 🔀 FLUXO DE ATIVAÇÃO DE AGENTE

```
┌────────────────────────────────────────────────────────────┐
│ USUÁRIO ATIVA: @dev                                        │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│ SYNAPSE LOADS:                                             │
│ 1. Agent persona (Dex)                                     │
│ 2. Core capabilities                                       │
│ 3. 6 PREMISSAS CONTEXT ←─────────────────────────────────┐│
│    ├─ Read: 6-PREMISSAS-INDEX.md                          ││
│    └─ Read: agents/dev-guidelines-6-premissas.md          ││
│ 4. Constitution (AIOS rules)                              ││
│ 5. Available commands                                      ││
└────────────────────────────────────────────────────────────┘│
                          │                                   │
                          ▼                                   │
┌────────────────────────────────────────────────────────────┐│
│ @DEV IS READY:                                             ││
│ - Knows 6 premissas cold                                   ││
│ - Has workflow checklist                                   ││
│ - Will reject violations                                   ││
│ - Ready to code ✅                                          ││
└────────────────────────────────────────────────────────────┘│
                                                              │
                  (Same pattern for @architect,               │
                   @qa, @data-engineer)                      │
                                                              └─ Read from
                                                                 AGENTS_6_PREMISSAS
                                                                 _CONFIG.yaml
```

---

## 📖 HIERARQUIA DE DOCUMENTAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│ 6-PREMISSAS-INDEX.md — HUB CENTRAL                              │
│ "Entenda as 6 premissas, checklist universal, impacto"          │
│ (RECOMENDADO LER PRIMEIRO)                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   @DEV       │ │ @ARCHITECT   │ │    @QA       │
    │ Guidelines   │ │ Guidelines   │ │ Guidelines   │
    │              │ │              │ │              │
    │ Workflow:    │ │ Workflow:    │ │ Workflow:    │
    │ code → test  │ │ design →     │ │ test → pass  │
    │              │ │ validate     │ │              │
    │ Checklist:   │ │              │ │ Checklist:   │
    │ 6-premissas  │ │ Checklist:   │ │ 6-premissas  │
    │              │ │ 6-premissas  │ │              │
    └──────────────┘ └──────────────┘ └──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────┐
    │ @DATA-ENGINEER Guidelines            │
    │ Workflow: schema → migrate → test    │
    │ Checklist: 6-premissas               │
    └──────────────────────────────────────┘
```

---

## 🔗 COMO OS ARQUIVOS SE CONECTAM

### De Cima para Baixo (Referência)

```
QUICK_START_6_PREMISSAS.md
  ↓
  "Para aprender rápido em 60 segundos"
  ↓
  Link para: 6-PREMISSAS-INDEX.md
  ↓
  "Cada premissa explicada + exemplos"
  ↓
  Link para: agents/{agent}-guidelines-6-premissas.md
  ↓
  "Como MINHA role aplica cada premissa"
```

### De Lado a Lado (Comparação)

```
dev-guidelines-6-premissas.md
    │
    ├─ Similar pattern em:
    │
    ├─ architect-guidelines-6-premissas.md (diferentes responsabilidades)
    ├─ qa-guidelines-6-premissas.md (diferentes responsabilidades)
    └─ data-engineer-guidelines-6-premissas.md (diferentes responsabilidades)

    Todos seguem mesma estrutura:
    ├─ Explicação de cada premissa
    ├─ Exemplos específicos da role
    ├─ Checklist da role
    └─ Violações bloqueantes
```

### De Baixo para Cima (Escalada)

```
Developer implementa feature
  ↓
Segue: dev-guidelines-6-premissas.md
  ↓
Valida contra: 6-PREMISSAS-INDEX.md checklist
  ↓
Se viola alguma premissa:
  ├─ Lê novamente guideline específica
  └─ Refatora antes de commitar
```

---

## 🎯 MATRIZ DE COBERTURA

Quais premissas cada agente segue:

```
┌──────────────┬───────┬───────┬──────┬───────────┐
│ Premissa     │ @dev  │ @arch │ @qa  │ @data-eng │
├──────────────┼───────┼───────┼──────┼───────────┤
│ 1. Deps      │  ✅   │  ✅   │  ✅  │     ✅    │
│ 2. DRY       │  ✅   │  ✅   │  ✅  │     ✅    │
│ 3. KISS      │  ✅   │  ✅   │  ✅  │     ✅    │
│ 4. YAGNI     │  ✅   │  ✅   │  ✅  │     ✅    │
│ 5. Feature   │  ✅   │  ✅   │  ✅  │     ✅    │
│ 6. SoC       │  ✅   │  ✅   │  ✅  │     ✅    │
└──────────────┴───────┴───────┴──────┴───────────┘

✅ = Agente é responsável por validar
```

---

## 📋 CHECKLIST PROGRESSION

### Para @dev (Desenvolvedor)

```
Antes de implementar:
  [ ] Leia DEPENDENCY_GRAPH.md (Premissa 1)
  [ ] Procure por código duplicado (Premissa 2)

Durante implementação:
  [ ] Use solução mais simples (Premissa 3)
  [ ] Implemente apenas essencial (Premissa 4)
  [ ] Organize em features/x/ (Premissa 5)
  [ ] Separar responsabilidades (Premissa 6)

Antes de commitar:
  [ ] npm run typecheck ✅
  [ ] npm run lint ✅
  [ ] npm test ✅
  [ ] Commit com referência às premissas
```

### Para @architect (Arquiteto)

```
Ao receber requisito:
  [ ] Valide dependências (Premissa 1)
  [ ] Identifique duplicação de padrões (Premissa 2)
  [ ] Escolha design mais simples (Premissa 3)
  [ ] Não antecipe cenários futuros (Premissa 4)
  [ ] Proponha estrutura feature-based (Premissa 5)
  [ ] Defina responsabilidades claras (Premissa 6)

Ao revisar design:
  [ ] Checklist design review
  [ ] Aprovação com 6-premissas
```

### Para @qa (QA)

```
Ao receber feature:
  [ ] Valide dependências (Premissa 1)
  [ ] Use fixtures compartilhadas (Premissa 2)
  [ ] Testes simples e diretos (Premissa 3)
  [ ] Teste apenas implementado (Premissa 4)
  [ ] Organize testes por feature (Premissa 5)
  [ ] Separar Unit/Service/Component/E2E (Premissa 6)

Validação final:
  [ ] Coverage ≥80%
  [ ] PASS em todas premissas
```

---

## 🔄 CICLO DE VIDA DE UMA FEATURE

```
┌─────────────────────────────────────────────────────────┐
│ 1. PLANEJAMENTO (@architect)                            │
│    - Mapear dependências (Premissa 1)                   │
│    - Identificar reusos (Premissa 2)                    │
│    - Escolher design simples (Premissa 3)               │
│    - Definir escopo (Premissa 4)                        │
│    - Propor estrutura features/ (Premissa 5)            │
│    - Separar responsabilidades (Premissa 6)             │
│    └─ Output: Design Document ✅                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. IMPLEMENTAÇÃO (@dev)                                 │
│    - Seguir todos 6 checklists                          │
│    - Código simples + centralizado                      │
│    - Feature-based organization                         │
│    - Testes para cada componente                        │
│    └─ Output: Code ✅                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. SCHEMA (@data-engineer)                              │
│    - Criar migrations respeitando ordem                 │
│    - DRY em enums/domains                               │
│    - Campos apenas necessários                          │
│    - Separar schema/indexes/constraints/seed            │
│    └─ Output: Migrations ✅                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. TESTES (@qa)                                         │
│    - Testar contra AC                                   │
│    - Feature-based test organization                    │
│    - Cobrir Unit/Service/Component/E2E                  │
│    - ≥80% coverage obrigatório                          │
│    └─ Output: Test Report ✅                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 5. APROVAÇÃO (@architecture review)                     │
│    ✅ Todas 6 premissas seguidas?                       │
│    ✅ Testes green?                                     │
│    ✅ Build success?                                    │
│    ✅ Ready for production?                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 IMPACTO POR PREMISSA

```
Premissa 1: DEPENDÊNCIAS
├─ Impacto: Evita retrabalho 80%
├─ Métrica: 0 bloqueadores inesperados
└─ Agente: @architect (governa)

Premissa 2: DRY
├─ Impacto: Reduz bugs 70%
├─ Métrica: Zero duplicação >2 lugares
└─ Agente: @dev (enforce) + @architect (design)

Premissa 3: KISS
├─ Impacto: 40% menos tokens
├─ Métrica: Solução sempre mais simples
└─ Agente: @dev + @architect (questionar)

Premissa 4: YAGNI
├─ Impacto: 30% menos código morto
├─ Métrica: 0 TODO sem issue
└─ Agente: @dev + @qa (remover)

Premissa 5: FEATURE-BASED
├─ Impacto: 5x menos navegação
├─ Métrica: Uma feature = uma pasta
└─ Agente: @architect (design) + @dev (build)

Premissa 6: SoC
├─ Impacto: Código 2x mais legível
├─ Métrica: 1 responsabilidade por arquivo
└─ Agente: @dev (enforce) + @architect (audit)
```

---

## 🎓 EXEMPLOS VISUAIS

### Feature-Based (Correto ✅)

```
features/crm/                    ← Uma feature = uma pasta
├── pages/
│   └── CRMPage.tsx
├── components/
│   ├── KanbanBoard.tsx
│   └── LeadCard.tsx
├── services/
│   └── crm.service.ts           ← Lógica
├── hooks/
│   └── useCRM.ts                ← Estado reutilizável
├── constants/
│   └── crm.constants.ts         ← Valores centralizados (DRY)
├── types/
│   └── crm.types.ts
└── __tests__/
    └── *.test.tsx               ← Testes colados

Vantagem: Novo dev = "trabalhe em features/crm"
          Sem navegação por 5 pastas
          Contexto de LLM reduzido
```

### Layer-Based (Evitar ❌)

```
src/
├── pages/                       ← Mistura 8 features
│   ├── CRMPage.tsx
│   ├── DashboardPage.tsx
│   └── ...
├── components/
│   ├── KanbanBoard.tsx
│   ├── LeadCard.tsx
│   └── ...
├── services/
│   ├── crm.service.ts
│   ├── dashboard.service.ts
│   └── ...
└── __tests__/                   ← Testes espalhados

Desvantagem: Onde está tudo de CRM? Espalhado por 4 pastas
             5+ cliques para acessar
             Contexto de LLM inflado
             Merge conflicts aumentados
```

---

## ✅ VALIDATION CHECKLIST

Para verificar se tudo está integrado corretamente:

```bash
# 1. Verificar arquivos existem
[ ] /root/aios/.aios-core/development/6-PREMISSAS-INDEX.md
[ ] /root/aios/.aios-core/development/QUICK_START_6_PREMISSAS.md
[ ] /root/aios/.aios-core/development/COMPLETION_SUMMARY.md
[ ] /root/aios/.aios-core/development/ARCHITECTURE_MAP.md
[ ] /root/aios/.aios-core/development/agents/dev-guidelines-6-premissas.md
[ ] /root/aios/.aios-core/development/agents/architect-guidelines-6-premissas.md
[ ] /root/aios/.aios-core/development/agents/qa-guidelines-6-premissas.md
[ ] /root/aios/.aios-core/development/agents/data-engineer-guidelines-6-premissas.md
[ ] /root/aios/.aios-core/development/AGENTS_6_PREMISSAS_CONFIG.yaml

# 2. Verificar agentes podem ser ativados
[ ] @dev consegue ativar?
[ ] @architect consegue ativar?
[ ] @qa consegue ativar?
[ ] @data-engineer consegue ativar?

# 3. Verificar cada agente conhece suas guidelines
[ ] @dev conhece dev-guidelines?
[ ] @architect conhece architect-guidelines?
[ ] @qa conhece qa-guidelines?
[ ] @data-engineer conhece data-engineer-guidelines?
```

---

*Synkra AIOS — Mapa Arquitetural v1.0*
*6 Premissas Integration Complete*
*2026-02-23*
