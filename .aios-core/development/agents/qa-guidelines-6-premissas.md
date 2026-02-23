# ✅ QA AGENT (@qa) — 6 PREMISSAS OBRIGATÓRIAS

**Agent:** @qa (Quinn)
**Role:** Testes, qualidade, validação, bugfixes
**Language:** Portuguese
**Last Updated:** 2026-02-23

---

## 📋 AS 6 PREMISSAS NO CONTEXTO QA

### 1️⃣ PLANEJAMENTO E MAPEAMENTO DE DEPENDÊNCIAS

**Responsabilidade do QA:**
- Testar features respeitando ordem de dependências
- Não testar feature que depende de algo não pronto
- Documentar bloqueadores de teste

**Checklist:**
- [ ] Feature que vou testar tem todas dependências prontas?
- [ ] Posso testar auth antes de dashboard (ou ao contrário)?
- [ ] Há bloqueadores (features não implementadas) bloqueando teste?

---

### 2️⃣ DRY NOS TESTES

**Responsabilidade do QA:**
- Não repetir testes para mesma coisa em múltiplas features
- Usar test utilities compartilhadas
- Criar fixtures e mocks reutilizáveis

**Padrão DRY em Testes:**
```typescript
❌ ERRADO (repetido em 3 test files):
describe('Login', () => {
  it('should submit form', () => {
    render(<LoginForm />)
    fireEvent.change(input, { target: { value: 'test@test.com' } })
    fireEvent.click(submitButton)
    expect(authService.login).toHaveBeenCalled()
  })
})

✅ CERTO (centralizado):
// shared/test/fixtures/auth.fixtures.ts
export const mockUser = { email: 'test@test.com', ... }
export const fillLoginForm = (email = 'test@test.com') => { ... }

// features/auth/__tests__/LoginForm.test.tsx
it('should submit form', () => {
  fillLoginForm()
  expect(authService.login).toHaveBeenCalled()
})
```

**Checklist:**
- [ ] Utilities de teste compartilhadas?
- [ ] Fixtures centralizadas em `shared/test/`?
- [ ] Não há code duplication em testes?

---

### 3️⃣ KISS NOS TESTES

**Responsabilidade do QA:**
- Testes simples e diretos
- Uma assertion por teste quando possível
- Evitar setup complexo

**Simples vs Complexo:**
```typescript
❌ COMPLEXO:
it('should handle login with complex mocking', () => {
  const mockStore = {
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    getState: jest.fn().mockReturnValue({
      auth: { user: { role: 'admin' }, token: '...' }
    }),
  }
  // ... 20 linhas de setup
})

✅ SIMPLES:
it('should require email field', () => {
  render(<LoginForm />)
  fireEvent.click(submitButton)
  expect(screen.getByText('Email required')).toBeInTheDocument()
})
```

---

### 4️⃣ YAGNI NOS TESTES

**Responsabilidade do QA:**
- Testar apenas comportamento implementado
- Sem testes para features não-implementadas
- Sem testes "para o futuro"

**Exemplo YAGNI:**
```typescript
❌ ERRADO (feature não existe):
it('should switch between users', () => {
  // switchUser() ainda não foi implementado
})

✅ CERTO (apenas implementado):
it('should login with credentials', () => {
  // login() foi implementado ✅
})
```

---

### 5️⃣ FEATURE-BASED TESTING

**Responsabilidade do QA:**
- Testes organizados por feature
- Cada feature tem seu `__tests__` folder
- Não misturar testes de features diferentes

**Estrutura:**
```
features/auth/
├── __tests__/
│   ├── LoginForm.test.tsx
│   ├── AuthContext.test.tsx
│   └── auth.service.test.ts
├── contexts/
├── services/
└── ...
```

**Checklist:**
- [ ] Testes em `features/x/__tests__/`?
- [ ] Não há testes em `shared/__tests__` (exceto utilities)?
- [ ] Cada test file testa 1 componente/service?

---

### 6️⃣ SEPARATION OF CONCERNS NOS TESTES

**Responsabilidade do QA:**
- Unit tests para funções puras (utils, services)
- Integration tests para components
- E2E tests para fluxos completos

**Camadas de Teste:**

| Tipo | O que testar | Exemplo |
|------|-------------|---------|
| **Unit** | Funções puras | `formatDate()`, `validator()` |
| **Service** | Services sem componentes | `authService.login()` |
| **Component** | Components + hooks | `<LoginForm />` |
| **Integration** | Fluxos com múltiplos componentes | Login → Dashboard |
| **E2E** | User journeys completos | Login → select empresa → view dashboard |

**SoC em Testes:**
```typescript
❌ ERRADO (testando UI em service test):
// features/auth/__tests__/auth.service.test.ts
it('should show toast on login error', () => {
  // ❌ Service não deve chamar UI
})

✅ CERTO (service testa lógica):
// features/auth/__tests__/auth.service.test.ts
it('should throw error on invalid credentials', () => {
  expect(authService.login()).rejects.toThrow()
})

✅ CERTO (componente testa UI):
// features/auth/__tests__/LoginForm.test.tsx
it('should show error message on login fail', () => {
  render(<LoginForm />)
  fireEvent.click(submitButton)
  expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
})
```

---

## 🧪 QA CHECKLIST (6 PREMISSAS)

Antes de dar "PASS" em feature:

```markdown
## 1️⃣ Dependências
- [ ] Todas dependências desta feature estão prontas?
- [ ] Feature passa em testes locais?
- [ ] Não há bloqueadores?

## 2️⃣ DRY
- [ ] Testes não repetem código?
- [ ] Fixtures compartilhadas foram usadas?
- [ ] Test utilities centralizadas?

## 3️⃣ KISS
- [ ] Testes são simples e diretos?
- [ ] Setup é mínimo?
- [ ] Fácil entender o que testa?

## 4️⃣ YAGNI
- [ ] Testa apenas código implementado?
- [ ] Sem testes para features não-implementadas?
- [ ] Sem "nice-to-have" test scenarios?

## 5️⃣ Feature-Based
- [ ] Testes em `features/x/__tests__/`?
- [ ] Bem organizado por componente/service?
- [ ] Isolado de outras features?

## 6️⃣ SoC
- [ ] Unit tests para functions puras?
- [ ] Service tests sem UI?
- [ ] Component tests com UI?
- [ ] E2E tests para journeys?

## Overall Quality
- [ ] npm run typecheck ✅
- [ ] npm run lint ✅
- [ ] npm test ✅
- [ ] npm run build ✅
- [ ] Coverage ≥80% ✅
```

---

## 🚀 QA WORKFLOW COM 6 PREMISSAS

### 1. Receber Feature para Testar
```
[Feature] CRM Kanban board
```

### 2. Validar Dependências (5 min)
- [ ] Auth está pronto? ✅
- [ ] Clients está pronto? ✅
- [ ] CRM pode ser testado? ✅

### 3. Entender Feature-Based Structure (5 min)
```
features/crm/
├── pages/
├── components/
├── services/
├── hooks/
└── __tests__/  ← Testes aqui
```

### 4. Escrever Testes (variável)
```typescript
// features/crm/__tests__/KanbanBoard.test.tsx
describe('KanbanBoard', () => {
  it('should render columns', () => { ... })
  it('should drag lead between columns', () => { ... })
})

// features/crm/__tests__/crm.service.test.ts
describe('crmService', () => {
  it('should update lead status', () => { ... })
})
```

### 5. Rodar Validações (10 min)
```bash
npm run typecheck  # Sem erros
npm run lint       # Sem warnings
npm test           # Testes passando
npm run build      # Build sucesso
```

### 6. Code Review + Aprovação
- Feature atende acceptance criteria? ✅
- Segue 6 premissas? ✅
- Pronto para produção? ✅

---

## ⚠️ REJEITAR FEATURES QUE VIOLEM

```
❌ Feature não atende AC
❌ Code violando 6 premissas
❌ Testes não cobrem 80%+
❌ Dependências não prontas
```

---

*Last Updated: 2026-02-23*
*Versão: 1.0 — 6 Premissas Edition*
