# 🚀 PLANO DE REFATORAÇÃO — OPÇÃO A (YOLO MODE)

**Status:** Em execução 🔥
**Data:** 2026-02-23
**Objetivo:** Reorganizar de layer-based para feature-based + aplicar 6 premissas

---

## 📍 Estrutura Atual (LAYER-BASED ❌)

```
src/
├── pages/              ← Mistura 9 features
├── components/
│   ├── crm/           ← Parcialmente feature-based
│   ├── dashboard/     ← Parcialmente feature-based
│   ├── shared/
│   └── ui/
├── services/          ← API + genéricos
├── hooks/             ← Genéricos
├── contexts/          ← Global
└── lib/               ← Utilities
```

---

## 🎯 Estrutura Alvo (FEATURE-BASED ✅)

```
src/
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── dashboard/
│   ├── crm/
│   ├── campaigns/
│   ├── clients/
│   ├── reports/
│   ├── users/
│   ├── settings/
│   └── profile/
│
├── shared/
│   ├── components/
│   │   └── ui/
│   ├── contexts/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   └── __tests__/
│
└── App.tsx, main.tsx, etc.
```

---

## 📋 FASES DE REFATORAÇÃO

### Fase 1: Setup (10 min) ✅
- [ ] Criar pasta `features/`
- [ ] Criar pasta `shared/`
- [ ] Criar README para nova estrutura

### Fase 2: Global (Shared) (30 min)
- [ ] Mover `services/api.client.ts` → `shared/services/`
- [ ] Mover `contexts/ThemeContext` → `shared/contexts/`
- [ ] Mover `contexts/EmpresaContext` → `shared/contexts/`
- [ ] Mover `components/shared/` → `shared/components/shared/`
- [ ] Mover `components/ui/` → `shared/components/ui/`
- [ ] Mover `DashboardLayout.tsx` → `shared/layouts/`
- [ ] Mover `Map.tsx` → `shared/components/`
- [ ] Mover `hooks/useMobile.tsx` → `shared/hooks/`
- [ ] Criar `shared/index.ts` com exports

### Fase 3: Features (Auth) (20 min)
- [ ] Criar `features/auth/`
- [ ] Mover `pages/Login.tsx` → `features/auth/pages/`
- [ ] Mover `contexts/AuthContext.tsx` → `features/auth/contexts/`
- [ ] Mover `services/auth.service.ts` → `features/auth/services/`
- [ ] Criar `features/auth/index.ts`
- [ ] Atualizar imports em App.tsx

### Fase 4: Features (Clients) (30 min)
- [ ] Criar `features/clients/`
- [ ] Mover `pages/Clients.tsx, ClientDetail.tsx` → `features/clients/pages/`
- [ ] Mover `services/empresa.service.ts` → `features/clients/services/`
- [ ] Mover `components/` relacionados → `features/clients/components/`
- [ ] Criar `features/clients/index.ts`
- [ ] Atualizar imports

### Fase 5: Features (Dashboard) (20 min)
- [ ] Criar `features/dashboard/`
- [ ] Mover `pages/Dashboard.tsx` → `features/dashboard/pages/`
- [ ] Mover `components/dashboard/` → `features/dashboard/components/`
- [ ] Criar `features/dashboard/index.ts`
- [ ] Atualizar imports

### Fase 6: Features (CRM) (20 min)
- [ ] Criar `features/crm/`
- [ ] Mover `pages/CRM.tsx` → `features/crm/pages/`
- [ ] Mover `components/crm/` → `features/crm/components/`
- [ ] Criar `features/crm/index.ts`
- [ ] Atualizar imports

### Fase 7: Features (Campaigns) (15 min)
- [ ] Criar `features/campaigns/`
- [ ] Mover `pages/Campaigns.tsx, CampaignDetail.tsx`
- [ ] Criar `features/campaigns/index.ts`

### Fase 8: Features (Reports) (15 min)
- [ ] Criar `features/reports/`
- [ ] Mover `pages/Reports.tsx`
- [ ] Criar `features/reports/index.ts`

### Fase 9: Features (Users) (15 min)
- [ ] Criar `features/users/`
- [ ] Mover `pages/Users.tsx`
- [ ] Criar `features/users/index.ts`

### Fase 10: Features (Settings) (15 min)
- [ ] Criar `features/settings/`
- [ ] Mover `pages/Settings.tsx`
- [ ] Criar `features/settings/index.ts`

### Fase 11: Features (Profile) (15 min)
- [ ] Criar `features/profile/`
- [ ] Mover `pages/Profile.tsx`
- [ ] Criar `features/profile/index.ts`

### Fase 12: Cleanup (30 min)
- [ ] Atualizar `App.tsx` com novos imports
- [ ] Atualizar `main.tsx` se necessário
- [ ] Remover pastas vazias
- [ ] Validar imports em todos arquivos
- [ ] Verificar missing files

### Fase 13: Validation (30 min)
- [ ] `npm run typecheck` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅
- [ ] Testes passando

---

## ⏱️ Tempo Total Estimado
**~4 horas** de execução pura

---

## 🚀 COMEÇAR AGORA!

Executando Fase 1 → Fase 2 → ... → Fase 13
