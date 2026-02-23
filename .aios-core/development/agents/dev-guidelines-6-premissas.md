# 🤖 DEVELOPER AGENT (@dev) — 6 PREMISSAS OBRIGATÓRIAS

**Agent:** @dev (Dex)
**Role:** Implementação de código, bugfixes, features
**Language:** Portuguese
**Last Updated:** 2026-02-23

---

## 📋 AS 6 PREMISSAS INEGOCIÁVEIS

### 1️⃣ PLANEJAMENTO E MAPEAMENTO DE DEPENDÊNCIAS

**Regra:** Antes de implementar, entenda a ordem de dependências.

```
❌ ERRADO:
- Implementar CRM sem Auth estar pronto
- Iniciar Reports sem Clients funcionando
- Criar componentes sem Design System

✅ CERTO:
1. Verificar DEPENDENCY_GRAPH.md
2. Identificar dependências (ex: Auth → Dashboard → CRM)
3. Implementar na sequência correta
4. Documentar nova feature no graph
```

**Execução:**
- [ ] Ler `/root/aios/DEPENDENCY_GRAPH.md` antes de cada feature
- [ ] Validar que dependências estão prontas
- [ ] Atualizar graph se adicionar nova dependência
- [ ] Informar bloqueadores se dependência não existe

---

### 2️⃣ DRY (Don't Repeat Yourself)

**Regra:** Nunca repita código em 2+ lugares. Sempre centralize.

```typescript
❌ ERRADO (repetido em 5 arquivos):
const statusColors = { ativo: '...', pausado: '...' }

✅ CERTO (centralizado):
// features/clients/constants/clients.constants.ts
export const STATUS_COLORS = { ... }

// Usar em qualquer lugar:
import { STATUS_COLORS } from '@/features/clients/constants'
```

**Checklist:**
- [ ] Procurar por valores/funções duplicados ANTES de implementar
- [ ] Centralizar em `constants/`, `utils/` ou `services/`
- [ ] Usar `npm run typecheck` após centralizar
- [ ] Não deixar TODO comments para "depois centralizar"

**localStorage keys, API endpoints, colors, roles, labels** → SEMPRE centralizados!

---

### 3️⃣ KISS (Keep It Simple, Stupid)

**Regra:** Entre simples e complexo fazendo a mesma coisa, escolha SEMPRE o simples.

```typescript
❌ COMPLEXO (overengineering):
const [formData, setFormData] = useState({
  field1: '', field2: '', field3: '', ...10 fields
})

✅ SIMPLES (alternativa):
// Se form é simples, use HTMLFormElement nativo
<form onSubmit={(e) => {
  const data = new FormData(e.target)
  submitForm(Object.fromEntries(data))
}}>

// Se form é complexa, aí sim use React Hook Form
import { useForm } from 'react-hook-form'
```

**Princípios:**
- Comece sempre com a solução MAIS simples
- Adicione complexidade APENAS se necessário
- Evitar libraries "porque é melhor" (é pior em tokens!)
- Sem abstrações prematuras

**Antes de adicionar uma library, pergunte:**
- Isso economiza código? (mínimo 20% redução)
- Isso resolve um problema REAL? (não preventivo)
- Já existe no projeto? (reusar antes de adicionar)

---

### 4️⃣ YAGNI (You Aren't Gonna Need It)

**Regra:** Implemente APENAS o essencial. Não antecipe cenários futuros.

```typescript
❌ ERRADO (antecipando):
export async function refreshToken() { } // Não pedido ainda
export async function getStats() { }     // Não usado em nenhuma página
export function switchUser() { }         // Não existe no backend

✅ CERTO (apenas necessário):
// Implementar quando tiver requisição real
```

**Checklist YAGNI:**
- [ ] Este código é USADO em alguma página/componente AGORA?
- [ ] Está no acceptance criteria da story?
- [ ] Há issue/story para isso?
- Se NÃO: **não implemente**

**Remover antes de commitar:**
- [ ] TODO comments sem issue vinculada
- [ ] Funções exportadas não usadas
- [ ] Parâmetros não utilizados
- [ ] Commented-out code
- [ ] Test files para features não implementadas

---

### 5️⃣ FEATURE-BASED FOLDER STRUCTURE

**Regra:** Organize POR FUNCIONALIDADE, não por camada.

```
❌ CAMADAS (estrutura PROIBIDA):
src/
├── pages/        ← Mistura 12 features
├── components/   ← 5+ pastas + 61 arquivos
├── services/     ← Genéricos
└── hooks/        ← Genéricos

✅ FEATURES (estrutura OBRIGATÓRIA):
src/
├── features/
│   ├── auth/           ← Tudo de Auth aqui
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── constants/
│   │   ├── types/
│   │   ├── mock-data/
│   │   └── index.ts
│   ├── dashboard/      ← Tudo de Dashboard aqui
│   └── ...
└── shared/            ← APENAS reuso puro
```

**Regra de Ouro:**
- Uma feature = uma pasta
- Tudo de uma feature EM UMA PASTA
- Ler uma feature = ler 1 diretório

**Índices (index.ts):**
```typescript
// features/auth/index.ts
export { AuthProvider, useAuth } from './contexts/AuthContext'
export { authService } from './services/auth.service'
export type { User, LoginResponse } from './types/auth.types'
```

---

### 6️⃣ SEPARATION OF CONCERNS (SoC)

**Regra:** Cada arquivo = 1 responsabilidade. Nunca misture responsabilidades.

```typescript
❌ ERRADO (responsabilidades misturadas):
// services/auth.service.ts contém:
// - Login/logout logic
// - Token persistence (localStorage)
// - UI notifications
// - Form validation

✅ CERTO (separado):
// services/auth.service.ts → APENAS autenticação
export const authService = {
  async login() { },
  async logout() { },
}

// constants/auth.constants.ts → APENAS constantes
export const AUTH_STORAGE_KEY = 'auth_token'
export const ROLES = { ADMIN: 'admin', ... }

// hooks/useAuth.ts → APENAS lógica de UI
export function useAuth() { }

// contexts/AuthContext.tsx → APENAS estado global
export const AuthContext = createContext()
```

**Padrão SoC por responsabilidade:**

| Responsabilidade | Arquivo | Exemplo |
|------------------|---------|---------|
| **Tipos** | `types/*.ts` | `export type User = { id, name, role }` |
| **Constantes** | `constants/*.ts` | `export const ROLES = { ADMIN: 'admin' }` |
| **Services** | `services/*.ts` | `export const authService = { login, logout }` |
| **Hooks** | `hooks/*.ts` | `export function useAuth() { }` |
| **Components** | `components/*.tsx` | `export function LoginForm() { }` |
| **Pages** | `pages/*.tsx` | `export function LoginPage() { }` |
| **Mock Data** | `mock-data/*.ts` | `export const mockUsers = [ { } ]` |
| **Context** | `contexts/*.tsx` | `export const AuthContext = createContext()` |

**Violações detectadas = Refatory Required:**
- [ ] `App.tsx` tem 100+ linhas? Extrair rotas
- [ ] `mock-data.ts` tem 200+ linhas? Splittar por feature
- [ ] `services/` faz validação e persistência? Separar
- [ ] `components/` importa diretamente de `lib/mock-data`? Refatorar

---

## 🚀 FLUXO DE DESENVOLVIMENTO COM 6 PREMISSAS

### 1. Receber Task
```
[Story] Implementar Feature X
```

### 2. Planejamento (15 min)
- [ ] Ler DEPENDENCY_GRAPH.md
- [ ] Identificar dependências
- [ ] Verificar se já existe código repetido
- [ ] Confirmar que é essencial (não YAGNI)

### 3. Design Arquitetural (10 min)
- [ ] Feature-based folder: `features/x/`
- [ ] Responsabilidades: types, constants, services, hooks, components
- [ ] SoC: cada arquivo com 1 responsabilidade

### 4. Implementação (variável)
- [ ] KISS: usar solução mais simples primeiro
- [ ] DRY: centralizar valores/funções
- [ ] Sem YAGNI: apenas necessário
- [ ] Seguir SoC: responsabilidades separadas

### 5. Validação (10 min)
```bash
npm run typecheck   # Sem erros
npm run lint        # Sem warnings
npm test            # Testes passando
npm run build       # Build sucesso
```

### 6. Commit
```
feat: implement Feature X [Story 123]

- Add features/x/pages/XPage.tsx
- Add features/x/services/x.service.ts
- Add features/x/constants/x.constants.ts
- Add features/x/hooks/useX.ts
- Update shared/lib/types for feature X

Follows 6-premissas:
✅ Dependências mapeadas
✅ DRY centralizado
✅ KISS simples
✅ YAGNI essencial
✅ Feature-based
✅ SoC separado
```

---

## 📏 CODE REVIEW CHECKLIST (6 PREMISSAS)

Usar este checklist ANTES de fazer commit:

```markdown
## 1️⃣ Dependências
- [ ] Feature não quebra dependências existentes?
- [ ] Dependências estão documentadas em DEPENDENCY_GRAPH.md?
- [ ] Não há dependência circular?

## 2️⃣ DRY
- [ ] Não há código repetido em 2+ arquivos?
- [ ] Constants estão centralizadas?
- [ ] localStorage keys/API endpoints estão em constants/?
- [ ] Funções comuns estão em utils/?

## 3️⃣ KISS
- [ ] Solução é a MAIS SIMPLES possível?
- [ ] Não há overengineering?
- [ ] Bibliotecas usadas são absolutamente necessárias?
- [ ] Sem abstrações prematuras?

## 4️⃣ YAGNI
- [ ] Todo código é USADO agora (não preventivo)?
- [ ] Sem funções exportadas não-utilizadas?
- [ ] Sem commented-out code?
- [ ] Sem TODO's sem issue vinculada?

## 5️⃣ Feature-Based
- [ ] Feature inteira em 1 pasta (features/x/)?
- [ ] index.ts exporta API pública?
- [ ] Não há imports de outras features (só shared)?
- [ ] mock-data está em features/x/mock-data/?

## 6️⃣ SoC
- [ ] Cada arquivo tem 1 responsabilidade?
- [ ] Components não contêm lógica de negócio?
- [ ] Services não contêm UI logic?
- [ ] Types, constants, utils separados?
```

---

## ⚠️ VIOLAÇÕES = BLOQUEIA COMMIT

Se qualquer premissa for violada:

```
❌ BLOQUEADO: Commit rejeitado
📝 Ação: Refatorar antes de commitar
📋 Usar checklist acima como guia
✅ Resubmeter após fixes
```

---

## 📚 REFERÊNCIAS

- `/root/ARQUITETURA_REFATORADA.md` — Estrutura proposta
- `/root/aios/DEPENDENCY_GRAPH.md` — Dependências entre features
- `features/*/README.md` — Cada feature tem seu README

---

## 🎯 LEMBRETE FINAL

Essas 6 premissas **NÃO SÃO SUGESTÕES**, são **REGRAS OBRIGATÓRIAS**.

Cada violação adiciona:
- ⏱️ 10-20 min de refatoração
- 🤖 200+ tokens de contexto desperdiçados
- 🐛 Risco de bugs por duplicação
- 😵 Confusão para próxima IA

**Melhor fazer certo na primeira vez! ✅**

---

*Last Updated: 2026-02-23*
*Versão: 1.0 — 6 Premissas Edition*
