# Próximos Passos — Trafego OS Frontend v4.0

**Data:** 2026-02-20
**Status Atual:** Sprint 3 (100%) + Sprint 4 Parcial (50%)
**Tokens Utilizados:** ~130k / 200k
**Margem de Segurança:** ~70k tokens

---

## 📋 Tarefas Pendentes por Prioridade

### **SPRINT 4 — Acessibilidade & QA (Continuar)**

#### **Fase 1: Paginação (Média Complexidade — ~15k tokens)**

**Status:** ⏸️ Não iniciado

**Arquivos a modificar:**
1. `src/pages/Campaigns.tsx` — Adicionar paginação na tabela de campanhas
2. `src/pages/Reports.tsx` — Adicionar paginação na tabela de relatórios
3. `src/pages/Users.tsx` — Adicionar paginação na tabela de usuários
4. `src/components/dashboard/CampaignTable.tsx` — Suportar paginação

**Implementação:**
- Usar componente existente `ui/pagination.tsx`
- Adicionar estado `currentPage` com `useState`
- Implementar `itemsPerPage = 10` (configurável)
- Calcular slice de dados: `data.slice((page - 1) * itemsPerPage, page * itemsPerPage)`
- Adicionar controles de navegação (Anterior/Próximo/Números)

**Exemplo:**
```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
const totalPages = Math.ceil(filtered.length / itemsPerPage);
const paginatedData = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

**AC (Acceptance Criteria):**
- [ ] Paginação funciona em Campaigns
- [ ] Paginação funciona em Reports
- [ ] Paginação funciona em Users
- [ ] Controles navegam corretamente
- [ ] Estado persiste na mudança de filtros
- [ ] Build sem erros

---

#### **Fase 2: Testes de Acessibilidade (Baixa Complexidade — ~10k tokens)**

**Status:** ⏸️ Não iniciado

**Arquivos a analisar:**
- `src/components/dashboard/KpiCard.tsx` — aria-hidden no sparkline
- `src/components/ui/alert-dialog.tsx` — role="alertdialog"
- `src/pages/Campaigns.tsx` — aria-label em filtros
- `src/pages/CRM.tsx` — aria-label em colunas Kanban

**Melhorias:**
```tsx
// KpiCard.tsx
<svg aria-hidden="true" className="sparkline">

// Filtros em Campaigns.tsx
<Select aria-label="Filtrar por status">

// Kanban columns
<div role="region" aria-label={`Pipeline: ${column.title}`}>
```

---

### **SPRINT 5 — Integração com Backend (Futuro — Não iniciado)**

**Estimativa:** 3-4 sprints (80-120k tokens)

#### **Fase 1: Configuração de API Client (15k tokens)**

**Arquivos a criar:**
- `src/services/api.client.ts` — Axios + interceptors
- `src/lib/types.ts` — Novos tipos (AuthSession, ApiError, etc)

**Implementação:**
```typescript
// src/services/api.client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Interceptor: Injetar Bearer token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Refresh token em 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Chamar refresh token endpoint
      // Se sucesso: retry request original
      // Se falha: redirect para /login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**AC:**
- [ ] API client criado com Axios
- [ ] Interceptor de request (adiciona Bearer token)
- [ ] Interceptor de response (refresh token)
- [ ] Erro 403 trata permissões
- [ ] Erro 5xx faz log centralizado

---

#### **Fase 2: Serviços por Módulo (20k tokens)**

**Arquivos a criar:**
```
src/services/
├── auth.service.ts      — login, logout, refreshToken
├── empresa.service.ts   — listEmpresas, getEmpresa
├── dashboard.service.ts — getMetrics, getKpis, getChartData
├── campaign.service.ts  — listCampaigns, getCampaign
├── lead.service.ts      — listLeads, createLead, moveLead
├── report.service.ts    — listReports, generateReport
└── user.service.ts      — listUsers, createUser, updateUser
```

**Exemplo (auth.service.ts):**
```typescript
import apiClient from './api.client';
import type { User, LoginResponse } from '@/lib/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post('/auth/login', { email, password });
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  },

  async refreshToken(): Promise<string> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    sessionStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  },
};
```

---

#### **Fase 3: Hooks de Data (20k tokens)**

**Arquivos a criar:**
```
src/hooks/
├── useDashboardData.ts  — useQuery para KPIs
├── useLeads.ts          — useQuery + useMutation para leads
├── useCampaigns.ts      — useQuery + useMutation para campanhas
├── useReports.ts        — useQuery + useMutation para relatórios
└── useUsers.ts          — useQuery + useMutation para usuários
```

**Exemplo (useCampaigns.ts):**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { campaignService } from '@/services/campaign.service';

export function useCampaigns(empresaId?: string) {
  return useQuery({
    queryKey: ['campaigns', empresaId],
    queryFn: () => campaignService.listCampaigns(empresaId),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaign) => campaignService.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
```

---

#### **Fase 4: Substituir Mock Data (25k tokens)**

**Ordem de substituição (por prioridade):**

1. **Dashboard** — `src/pages/Dashboard.tsx`
   - Substituir `getKpiCardsForEmpresa()` por `useDashboardData()`
   - Remover `Math.random()` dos gráficos

2. **CRM** — `src/pages/CRM.tsx`
   - Substituir `leads` por `useLeads()`
   - Manter drag-and-drop local (antes de enviar para API)

3. **Campaigns** — `src/pages/Campaigns.tsx`
   - Substituir `campaigns` por `useCampaigns()`
   - Manter paginação local

4. **Reports** — `src/pages/Reports.tsx`
   - Substituir `reports` por `useReports()`
   - Implementar geração real de relatórios

5. **Users** — `src/pages/Users.tsx`
   - Substituir `users` por `useUsers()`
   - Adicionar criar/editar usuários

---

### **SPRINT 6 — Qualidade & Performance (Futuro)**

**Status:** ⏸️ Não iniciado
**Estimativa:** 2-3 sprints

**Tarefas:**
- [ ] Bundle analysis (`npm run build -- --analyze`)
- [ ] Code splitting para rotas
- [ ] Lazy loading de componentes
- [ ] Lighthouse audit (alvo: ≥90)
- [ ] Testes unitários (80% cobertura)
- [ ] Testes E2E com Playwright

---

## 🔧 Configuração de Ambiente

### **Variáveis de Ambiente**

Criar `.env` na raiz do frontend:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Trafego OS
VITE_APP_VERSION=4.0.0
```

### **Dependências a Instalar (para Sprint 5)**

```bash
npm install @tanstack/react-query
npm install axios
npm install @hello-pangea/dnd      # Já instalado, mas verificar versão
```

---

## 📊 Checklist de Preparação para Próxima Sessão

### **Antes de começar:**
- [ ] Ler este arquivo completo
- [ ] Verificar build: `npm run build`
- [ ] Rodar dev server: `npm run dev`
- [ ] Testar páginas:
  - [ ] Dashboard carrega sem erros
  - [ ] Campanhas mostra tabela
  - [ ] CRM mostra leads
  - [ ] Reports mostra relatórios
  - [ ] Users mostra usuários

### **Após cada Sprint:**
- [ ] Executar linter: `npm run lint -- --fix`
- [ ] Executar typecheck: `npm run typecheck`
- [ ] Fazer commit com padrão: `feat/fix: Descrição [Story X]`
- [ ] Push para `owilian1212-dev/aios-core`
- [ ] Atualizar este arquivo se necessário

---

## 🎯 Estimativas de Tempo

| Sprint | Tarefas | Tokens | Dias |
|--------|---------|--------|------|
| 3 | Refatoração | ✅ 40k | ✅ 1 |
| 4 | Acessibilidade | ✅ 30k | ✅ 1 |
| 4 | Paginação | 15k | 1 |
| 4 | Testes A11y | 10k | 0.5 |
| 5 | API Client | 15k | 1 |
| 5 | Serviços | 20k | 1.5 |
| 5 | Hooks | 20k | 1.5 |
| 5 | Substituir Mocks | 25k | 2 |
| 6 | Performance | 20k | 1.5 |
| **Total** | | ~175k | ~10 dias |

---

## 📝 Notas Importantes

1. **Mock Data:** O arquivo `src/lib/mock-data.ts` será removido gradualmente durante Sprint 5
2. **React Query:** Instalar e configurar antes de começar Sprint 5
3. **API Backend:** Necessário ter backend rodando em `localhost:3000` para testes
4. **Tokens:** Monitorar uso de tokens a cada sessão (checkpoint a cada 50k)
5. **GitHub:** Sempre fazer push para `owilian1212-dev/aios-core` (já configurado)

---

## 🚀 Atalho para Próxima Sessão

```bash
# Entrar no diretório
cd /root/aios/squads/trafego-os/frontend

# Instalar dependências (se necessário)
npm install

# Iniciar dev server
npm run dev

# Em outro terminal, abrir este arquivo
cat NEXT_STEPS.md

# Começar com a próxima tarefa de Sprint 4 (Paginação)
```

---

**Última atualização:** 2026-02-20
**Próximo responsável:** @dev (Dex)
**Status de compilação:** ✅ Sem erros
