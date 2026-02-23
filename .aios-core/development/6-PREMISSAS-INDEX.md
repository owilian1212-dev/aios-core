# 🎯 6 PREMISSAS — ÍNDICE CENTRAL

**Framework:** Synkra AIOS
**Versão:** 1.0
**Data:** 2026-02-23
**Status:** OBRIGATÓRIO para todos agentes de programação

---

## 📚 ÍNDICE DE DOCUMENTAÇÃO

### Documentação Geral
- **Este arquivo:** Índice central com visão geral
- **ARQUITETURA_REFATORADA.md:** Estrutura feature-based proposta
- **DEPENDENCY_GRAPH.md:** Ordem de implementação das features (manter atualizado)

### Guidelines por Agente
- **@dev** (Developer) → `dev-guidelines-6-premissas.md`
- **@architect** → `architect-guidelines-6-premissas.md`
- **@qa** (QA/Testing) → `qa-guidelines-6-premissas.md`
- **@data-engineer** → `data-engineer-guidelines-6-premissas.md`

---

## 🎓 AS 6 PREMISSAS EXPLICADAS

### 1️⃣ PLANEJAMENTO E MAPEAMENTO DE DEPENDÊNCIAS

**Definição:**
Sempre entender e respeitar a ordem de implementação. Features têm dependências (ex: Auth é foundation, CRM depende de Clients). Implementar na ordem certa evita retrabalho.

**Responsabilidade por Agente:**
- **@architect:** Criar e manter DEPENDENCY_GRAPH.md
- **@dev:** Consultar graph ANTES de implementar
- **@qa:** Testar respeitando dependências
- **@data-engineer:** Migrações em ordem de features

**Ferramentas:**
- `DEPENDENCY_GRAPH.md` — Visualização de ordem

**Impacto de Violação:**
- ❌ Retrabalho: Implementar feature que depende de outra não pronta
- ❌ Confusão: Não saber em que ordem começar
- ❌ Bloqueadores: Pedir para @dev parar de trabalhar

---

### 2️⃣ DRY (Don't Repeat Yourself)

**Definição:**
Nunca repita código em 2+ lugares. Se código é idêntico ou muito similar em 2 arquivos, centralize em 1 lugar e reutilize.

**Centralização por Tipo:**
```
Constants     → features/x/constants/ + shared/lib/constants/
Types         → features/x/types/ + shared/lib/types/
Utils         → shared/lib/utils/
Services      → features/x/services/
Hooks         → features/x/hooks/
Mock Data     → features/x/mock-data/
```

**Responsabilidade por Agente:**
- **@dev:** Procurar duplicações ANTES de implementar
- **@architect:** Identificar padrões repetidos e propor abstrações
- **@qa:** Usar fixtures compartilhadas, não repetir testes

**Ferramentas:**
```bash
# Procurar duplicações:
grep -r "const statusColors" src/  # Se em 2+ lugares → centralizar
```

**Impacto de Violação:**
- ❌ 3-4 bugs se alterar em 1 lugar e esquecer outro
- ❌ Manutenção 2x mais cara
- ❌ Inconsistências de dados

---

### 3️⃣ KISS (Keep It Simple, Stupid)

**Definição:**
Entre simples e complexo fazendo a mesma coisa, escolha SEMPRE o simples. Evite overengineering, abstrações prematuras, libraries "porque é cool".

**Exemplos:**
```
Redux          ❌ COMPLEXO → Use Context + useReducer ✅
FormLib 500KB  ❌ COMPLEXO → Use HTMLFormElement ✅
Middleware     ❌ COMPLEXO → Use axios interceptors ✅
Design Patterns ❌ COMPLEXO → Code simples ✅
```

**Regra Prática:**
Sempre que pensar em adicionar complexidade, pergunte:
1. Isso economiza ≥20% de código?
2. Resolve problema REAL (não teórico)?
3. Já existe no projeto?

Se não, **NÃO FAÇA**!

**Impacto de Violação:**
- ❌ 50%+ mais tokens gastos
- ❌ Código difícil de manter
- ❌ Onboarding mais lento

---

### 4️⃣ YAGNI (You Aren't Gonna Need It)

**Definição:**
Implemente APENAS o essencial AGORA. Não antecipe cenários futuros, features não-solicitadas, edge cases hipotéticos.

**Exemplos YAGNI a Evitar:**
```typescript
// ❌ Não pedido
function switchUser() { }        // @dev NÃO implemente
function refreshToken() { }      // Sem backend ainda
function getStats() { }          // Não usado em nenhuma página

// ❌ Previne futuro
export class UserService { }     // Classe? Função é suficiente
export interface Config { }      // Interface? type é simples
```

**Checklist YAGNI:**
Antes de cada implementação, pergunte:
- [ ] Está no AC (Acceptance Criteria) da story?
- [ ] Há requisição do PO (Product Owner)?
- [ ] É usado em alguma página/componente AGORA?

Se não: **REMOVA DO ESCOPO**!

**Impacto de Violação:**
- ❌ ~500 linhas de código morto neste projeto
- ❌ Context poisoning em LLMs
- ❌ Manutenção desnecessária

---

### 5️⃣ FEATURE-BASED FOLDER STRUCTURE

**Definição:**
Organize por FUNCIONALIDADE, não por CAMADA (tipo).

```
❌ CAMADAS (proibido):
src/pages, src/components, src/services, src/hooks, src/contexts

✅ FEATURES (obrigatório):
src/features/auth/, src/features/crm/, src/features/dashboard/, ...
```

**Estrutura Feature:**
```
features/crm/
├── pages/
│   └── CRMPage.tsx
├── components/
│   ├── KanbanBoard.tsx
│   ├── LeadCard.tsx
│   └── StatusColumn.tsx
├── services/
│   └── crm.service.ts
├── hooks/
│   ├── useCRM.ts
│   └── useLead.ts
├── contexts/
│   └── (se necessário)
├── constants/
│   └── crm.constants.ts
├── types/
│   └── crm.types.ts
├── mock-data/
│   └── crm.mock.ts
├── __tests__/
│   ├── KanbanBoard.test.tsx
│   └── crm.service.test.ts
├── README.md
└── index.ts              ← API pública
```

**Índice (index.ts):**
```typescript
export { CRMPage } from './pages/CRMPage'
export { useCRM, useLead } from './hooks'
export { crmService } from './services/crm.service'
export type { Lead, CRMStatus } from './types/crm.types'
export * from './constants/crm.constants'
```

**Benefícios:**
- ✅ Uma feature = uma pasta
- ✅ Para editar CRM: tudo em `features/crm/`
- ✅ Novo dev: "Trabalhe em features/seu_feature"
- ✅ 5x menos navegação
- ✅ Contexto de LLM reduzido

---

### 6️⃣ SEPARATION OF CONCERNS (SoC)

**Definição:**
Cada arquivo tem 1 responsabilidade bem definida. Nunca misture responsabilidades diferentes no mesmo arquivo.

**Responsabilidades:**

| Layer | Responsabilidade | Exemplo |
|-------|-----------------|---------|
| **pages/** | Composição de features | `<Sidebar /> + <Content />` |
| **components/** | Rendering de UI | `<Button />`, `<Form />` |
| **services/** | Integração com API | `fetch('/api/crm')` |
| **hooks/** | Lógica reutilizável | `useForm()`, `useFetch()` |
| **contexts/** | Estado global | `AuthContext`, `ThemeContext` |
| **constants/** | Valores fixos | `ROLES`, `STATUS_COLORS` |
| **types/** | Type definitions | `User`, `Lead`, `Empresa` |
| **utils/** | Funções puras | `formatDate()`, `validate()` |

**SoC Rule: Uma responsabilidade = Um arquivo**

```typescript
❌ ERRADO (responsabilidades misturadas):
// components/LoginForm.tsx
const [form, setForm] = useState()
const handleSubmit = async () => {
  const response = await fetch('/api/login')    // ❌ Service logic
  if (!response.ok) toast.error('Erro')          // ❌ UI logic
  localStorage.setItem('token', response.token)  // ❌ Persistence
}

✅ CERTO (separado):
// services/auth.service.ts
export async function login(email, password) {
  return await fetch('/api/login')  // ✅ Service logic
}

// hooks/useAuth.ts
export function useAuth() {
  const login = async (email, password) => {
    const data = await authService.login(email, password)
    sessionStorage.setItem('token', data.token)  // ✅ Persistence
  }
  return { login }
}

// components/LoginForm.tsx
export function LoginForm() {
  const { login } = useAuth()
  const handleSubmit = async () => {
    try {
      await login(email, password)  // ✅ UI orchestration
    } catch (error) {
      toast.error('Erro')            // ✅ UI feedback
    }
  }
}
```

---

## 📋 CHECKLIST UNIVERSAL (Aplicável a Todos Agentes)

Antes de cada commit:

```markdown
## 1️⃣ Dependências Mapeadas?
- [ ] Respeitei DEPENDENCY_GRAPH.md?
- [ ] Não há dependências circulares?
- [ ] Dependências bloqueantes documentadas?

## 2️⃣ DRY Aplicado?
- [ ] Procurei por código duplicado?
- [ ] Constants estão centralizadas?
- [ ] Não repeti tipos, utils, mocks?

## 3️⃣ KISS Respeitado?
- [ ] Solução é a MAIS SIMPLES?
- [ ] Evitei overengineering?
- [ ] Libraries são realmente necessárias?

## 4️⃣ YAGNI Validado?
- [ ] Código é USADO agora?
- [ ] Está no AC da story?
- [ ] Removi código morto?

## 5️⃣ Feature-Based?
- [ ] Arquivos em features/x/?
- [ ] Tudo de 1 feature em 1 pasta?
- [ ] index.ts como API pública?

## 6️⃣ SoC Respeitada?
- [ ] Cada arquivo = 1 responsabilidade?
- [ ] Não misturei layers?
- [ ] Separei concerns?

## PASS? ✅
- [ ] typecheck sem erros
- [ ] lint sem warnings
- [ ] tests passando
- [ ] build sucesso
```

---

## 🚀 ATIVAÇÃO DOS AGENTES

Quando ativar um agente:

```bash
@dev
# Ele lerá: dev-guidelines-6-premissas.md + este arquivo
# Seguirá 6 premissas ao implementar

@architect
# Ele lerá: architect-guidelines-6-premissas.md + este arquivo
# Revisará arquitetura com 6 premissas

@qa
# Ele lerá: qa-guidelines-6-premissas.md + este arquivo
# Testará respeitando 6 premissas

@data-engineer
# Ele lerá: data-engineer-guidelines-6-premissas.md + este arquivo
# Design schema com 6 premissas
```

---

## 📊 IMPACTO MENSURÁVEL

Comparativo com aplicação das 6 premissas:

| Métrica | ANTES | DEPOIS | Melhoria |
|---------|-------|--------|----------|
| Código duplicado | Alto | Zero | 100% |
| Linhas por feature | 500+ | 200-300 | 40-60% ↓ |
| Onboarding IA | 20 min | 5 min | 75% ↓ |
| Merge conflicts | 5+ por sprint | <1 por sprint | 80% ↓ |
| Bugs por mudança | 3-4 | 0-1 | 70% ↓ |
| Tokens consumidos | Alto | 40% menos | 40% ↓ |
| Context poisoning | Alto | Baixo | 60% ↓ |

---

## 🎯 COMANDO RÁPIDO

Usar em qualquer conversa com agentes:

```
"Lembre-se das 6 premissas:
1. Dependências mapeadas
2. DRY centralizado
3. KISS simplificado
4. YAGNI essencial
5. Feature-based isolado
6. SoC separado"
```

---

## 📞 REFERÊNCIA RÁPIDA

**Q: Onde coloco esse código?**
A: Em `features/sua_feature/` (premissa 5)

**Q: Preciso de complexity X?**
A: Não, use solução simples (premissa 3)

**Q: Devo antecipar cenário Y?**
A: Não, implemente quando houver requisição (premissa 4)

**Q: Posso copiar código de outra feature?**
A: Não, centralize em shared/ (premissa 2)

**Q: Qual ordem de implementação?**
A: Veja DEPENDENCY_GRAPH.md (premissa 1)

**Q: Posso misturar responsabilidades?**
A: Não, 1 arquivo = 1 responsabilidade (premissa 6)

---

## ✅ APROVAÇÃO FINAL

Features são aprovadas APENAS se:
- ✅ Todas 6 premissas foram seguidas
- ✅ Código review passou
- ✅ Tests em green
- ✅ Build sucesso

---

*Framework: Synkra AIOS*
*Versão: 1.0 — 6 Premissas Edition*
*Obrigatório para: @dev, @architect, @qa, @data-engineer*
*Atualizado: 2026-02-23*
