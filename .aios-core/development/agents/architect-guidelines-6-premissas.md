# 🏛️ ARCHITECT AGENT (@architect) — 6 PREMISSAS OBRIGATÓRIAS

**Agent:** @architect (Aria)
**Role:** Arquitetura, design técnico, patterns, refatoração
**Language:** Portuguese
**Last Updated:** 2026-02-23

---

## 📋 AS 6 PREMISSAS NO CONTEXTO ARQUITETURAL

### 1️⃣ PLANEJAMENTO E MAPEAMENTO DE DEPENDÊNCIAS

**Responsabilidade do Architect:**
- Criar e manter `DEPENDENCY_GRAPH.md`
- Validar que features respeitem ordem de dependências
- Identificar dependências circulares ANTES de implementação
- Documentar "foundation" vs "dependent" features

**Entregável:**
```markdown
# DEPENDENCY_GRAPH.md

## Foundation Features (implementar primeiro)
- Auth (nenhuma dependência)

## Level 1 (depende de Auth)
- Dashboard
- Clients
- Settings
- Users
- Profile

## Level 2 (depende de Level 1)
- CRM (depende de: Auth, Clients)
- Campaigns (depende de: Auth, Clients)

## Level 3 (depende de Level 2)
- Reports (depende de: Auth, Clients, Campaigns)
```

**Checklist:**
- [ ] Grafo de dependências atualizado?
- [ ] Não há dependências circulares?
- [ ] Ordem de implementação clara?
- [ ] Documentado em arquivo principal?

---

### 2️⃣ DRY APLICADO NA ARQUITETURA

**Responsabilidade do Architect:**
- Identificar PADRÕES repetidos
- Criar abstrações apenas quando repetição existe (não preventiva!)
- Centralizar configurações compartilhadas
- Estabelecer padrões para types, constants, utils

**Padrão de Estrutura REPETIDA:**
```typescript
// features/auth/types/auth.types.ts
export type User = { id, name, email, role }
export type LoginResponse = { token, user, expiresIn }

// features/clients/types/empresa.types.ts
export type Empresa = { id, name, cnpj, ... }

// shared/lib/types/index.ts (centraliza tipos globais)
export type { User, Empresa, ... }
```

**Constants Pattern (DRY):**
```typescript
// shared/lib/constants/global.constants.ts
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export const ROLES = { ADMIN: 'admin', GESTOR: 'gestor', CLIENTE: 'cliente' }
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  SELECTED_EMPRESA: 'selected_empresa',
}

// features/*/constants/feature.constants.ts
export const STATUS_COLORS = { ... }  // Feature-specific
```

**Checklist:**
- [ ] Padrões repetidos identificados?
- [ ] Abstrações apenas onde necessário (2+ occurrências)?
- [ ] Sem over-engineering preventivo?
- [ ] Constants centralizadas em shared + feature-specific?

---

### 3️⃣ KISS NA ARQUITETURA

**Responsabilidade do Architect:**
- Design simplicidade ANTES de poder
- Rejeitar "nice-to-have" complexities
- Propor padrões simples primeiro
- Questionar toda adição de complexity

**Simples vs Complexo:**
```typescript
❌ COMPLEXO: State management com Redux + Saga + Middleware
✅ SIMPLES: React Context + useReducer (suficiente para este projeto)

❌ COMPLEXO: Generic service layer + factory patterns
✅ SIMPLES: Services diretos por feature

❌ COMPLEXO: Middleware architecture para requests
✅ SIMPLES: Axios interceptors (suficiente)
```

**Perguntas para rejeitar complexity:**
- Isso resolve um problema REAL agora? (não teórico)
- Há alternativa 50% mais simples?
- Vai usar 80% das features da library?
- É realmente necessário ou "nice-to-have"?

---

### 4️⃣ YAGNI NA ARQUITETURA

**Responsabilidade do Architect:**
- Não desenhar para "futuros requisitos"
- Recusar features não-solicitadas
- Refatorar quando necessário (não preventivo)
- Documentar decisões "deliberadamente simples"

**Exemplo: Design feito CERTO**
```
ANTES (prevendo futuro):
- Multi-tenancy support
- Complex permission system
- Microservices architecture
- Event sourcing

AGORA (apenas essencial):
- Single tenant
- 3 roles (admin, gestor, cliente)
- Monolith frontend
- REST simples
```

**Checklist:**
- [ ] Requisições do PO foram 100% incorporadas?
- [ ] Nada além foi adicionado?
- [ ] Design não antecipa cenários futuros?
- [ ] Documentado por que foi deliberadamente simples?

---

### 5️⃣ FEATURE-BASED DESIGN ARQUITETURAL

**Responsabilidade do Architect:**
- Propor estrutura feature-based
- Garantir isolamento por feature
- Definir "compartilhado" (shared)
- Documentar convenções

**Estrutura a Arquitetar:**
```
src/features/
├── auth/              ← Feature isolada
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── constants/
│   ├── types/
│   ├── mock-data/
│   ├── README.md      ← Cada feature tem docs
│   └── index.ts       ← API pública
│
└── ...

src/shared/           ← APENAS reuso puro
├── components/ui/    ← Design system
├── lib/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── services/
└── contexts/         ← Global (Auth, Theme, Tenant)
```

**Design Pattern: index.ts como API Pública**
```typescript
// features/auth/index.ts (ÚNICA entrada para feature)
export { AuthProvider, useAuth } from './contexts/AuthContext'
export { authService } from './services/auth.service'
export type { User, LoginResponse } from './types/auth.types'

// Nunca permitir:
import from '@/features/auth/services'  ❌
import from '@/features/auth/contexts'  ❌

// Sempre:
import { authService, useAuth } from '@/features/auth'  ✅
```

---

### 6️⃣ SEPARATION OF CONCERNS (SoC) ARQUITETURA

**Responsabilidade do Architect:**
- Definir responsabilidades por arquivo/camada
- Estabelecer boundaries entre responsabilidades
- Auditar violações de SoC
- Rejeitar designs "god objects"

**SoC Layer Design:**

| Layer | Responsabilidade | Não deve conter |
|-------|------------------|-----------------|
| **pages/** | Composição de features | Lógica de negócio |
| **components/** | UI rendering | Chamadas de API |
| **services/** | Integração com API | Formatação de UI |
| **hooks/** | Lógica reutilizável | Chamadas diretas de API |
| **contexts/** | Estado global | Lógica de negócio complexa |
| **constants/** | Valores fixos | Lógica condicional |
| **types/** | Type definitions | Implementação |
| **utils/** | Funções puras | Estado |

**Violações SoC (REJEITAR):**
```typescript
❌ Componente fazendo fetch direto:
// components/UserCard.tsx
const [user, setUser] = useState()
useEffect(() => {
  fetch('/api/users').then(...)  // ❌ ERRADO
}, [])

✅ Componente usando hook:
// components/UserCard.tsx
const { user } = useUser()  // ✅ CERTO

❌ Service com lógica de UI:
// services/user.service.ts
if (!user) showToast('User not found')  // ❌ ERRADO

✅ Service retorna resultado:
// services/user.service.ts
if (!user) throw new Error('User not found')  // ✅ CERTO
```

---

## 🏗️ DESIGN REVIEW CHECKLIST (6 PREMISSAS)

Usar este checklist para REVISAR arquitetura de features:

```markdown
## 1️⃣ Dependências
- [ ] Feature respeta dependency graph?
- [ ] Não há dependências circulares?
- [ ] Dependências estão explícitas em documentação?

## 2️⃣ DRY
- [ ] Padrões repetidos foram identificados?
- [ ] Abstrações são DRY (não preventivas)?
- [ ] Constants estão centralizadas?
- [ ] Utilities compartilhados em shared/?

## 3️⃣ KISS
- [ ] Design é o MAIS SIMPLES possível?
- [ ] Complexidade justificada?
- [ ] Sem over-engineering?
- [ ] Alternativas mais simples foram consideradas?

## 4️⃣ YAGNI
- [ ] Design não antecipa cenários futuros?
- [ ] 100% aligned com requisitos atuais?
- [ ] Sem "nice-to-have" features?
- [ ] Deliberadamente simples (documentado)?

## 5️⃣ Feature-Based
- [ ] Feature tem sua própria pasta?
- [ ] Isolamento respeitado?
- [ ] index.ts como API pública?
- [ ] Não há imports de outras features?

## 6️⃣ SoC
- [ ] Cada layer tem 1 responsabilidade?
- [ ] Boundaries entre camadas claros?
- [ ] Sem "god objects"?
- [ ] Dependências fluem downward?
```

---

## 📐 DECISÕES ARQUITETURAIS CRÍTICAS

### Decisão: Feature-based vs Layer-based
**Resultado:** Feature-based (com justified reasons)
```
FEATURE-BASED:
✅ IAs conseguem trabalhar em 1 feature completamente
✅ Menos merge conflicts
✅ Onboarding de novos devs: "trabalhe em features/x"
✅ Contexto de LLM reduzido

LAYER-BASED:
❌ IAs navegar 5+ pastas para 1 feature
❌ Alto merge conflict
❌ Context poison em LLMs
```

### Decisão: Shared Services vs Feature Services
**Resultado:** Feature services com Shared API client
```
auth.service.ts → features/auth/services/ (FEATURE)
empresa.service.ts → features/clients/services/ (FEATURE)
api.client.ts → shared/services/ (SHARED - base HTTP)
```

### Decisão: Mock Data Centralized vs Split
**Resultado:** Split por feature (DRY + SoC)
```
❌ ANTES: lib/mock-data.ts (200+ linhas, 8 features misturadas)
✅ DEPOIS: features/*/mock-data/*.mock.ts (isolado)
```

---

## 📝 DOCUMENTAÇÃO ENTREGÁVEL

Cada decisão arquitetural deve gerar:

1. **DEPENDENCY_GRAPH.md** — Ordem de implementação
2. **ARCHITECTURE.md** — Visão geral do design
3. **SoC_BOUNDARIES.md** — Responsabilidades por layer
4. **features/*/README.md** — Documentação por feature
5. **CONVENTIONS.md** — Padrões e convenções

---

## 🎯 PERGUNTAS PARA FAZER AO RECEBER REQUISITO

1. **Dependências:** Que features esta feature depende?
2. **DRY:** Existe código similar em outras features?
3. **KISS:** Qual é a solução MAIS SIMPLES?
4. **YAGNI:** Isso é 100% necessário AGORA?
5. **Feature-Based:** Como isolar em 1 pasta?
6. **SoC:** Como dividir responsabilidades?

---

## ⚠️ VIOLAÇÕES ARQUITETURAIS = BLOQUEADAS

```
❌ BLOQUEADO: Design violando 6 premissas
📝 Ação: Revisar e reprojetar
📋 Usar checklist acima como guia
✅ Resubmeter após fixes
```

---

*Last Updated: 2026-02-23*
*Versão: 1.0 — 6 Premissas Edition*
