# 🗄️ DATA ENGINEER AGENT (@data-engineer) — 6 PREMISSAS OBRIGATÓRIAS

**Agent:** @data-engineer (Dara)
**Role:** Database design, migrations, schema, data integrity
**Language:** Portuguese
**Last Updated:** 2026-02-23

---

## 📋 AS 6 PREMISSAS NO CONTEXTO DATA

### 1️⃣ PLANEJAMENTO E MAPEAMENTO DE DEPENDÊNCIAS

**Responsabilidade do Data Engineer:**
- Schema segue dependências de features
- Tables criadas respeitando ordem de features
- Foreign keys respeitam dependência graph

**Exemplo:**
```sql
-- Foundation (Auth depende apenas disso)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  role VARCHAR,
  ...
)

-- Level 1 (Clients depende de Auth)
CREATE TABLE empresas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,  -- Depende de users
  ...
)

-- Level 2 (CRM depende de Clients)
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  empresa_id UUID REFERENCES empresas,  -- Depende de empresas
  status VARCHAR,
  ...
)

-- Level 3 (Reports depende de tudo)
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  empresa_id UUID REFERENCES empresas,
  created_by UUID REFERENCES users,
  ...
)
```

**Checklist:**
- [ ] Tabelas criadas na ordem correta?
- [ ] Foreign keys respeitam dependências?
- [ ] Migrações em sequência linear?
- [ ] Rollback funciona sem erros?

---

### 2️⃣ DRY NO SCHEMA

**Responsabilidade do Data Engineer:**
- Não repetir definições de campos
- Usar tipos customizados (enums, domains)
- Centralizar constraints comuns

**Padrão DRY:**
```sql
❌ ERRADO (repetido em 5 tabelas):
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
status VARCHAR CHECK (status IN ('ativo', 'pausado', 'encerrado')),

✅ CERTO (centralizado):
-- domains.sql
CREATE DOMAIN status_enum AS VARCHAR CHECK (value IN ('ativo', 'pausado', 'encerrado'));
CREATE DOMAIN created_at_field AS TIMESTAMP DEFAULT NOW();

-- tables.sql
CREATE TABLE users (
  ...
  status status_enum,
  created_at created_at_field,
  updated_at created_at_field,
)

-- Reusar em todas tabelas
```

**Checklist:**
- [ ] Enums criados para valores fixos?
- [ ] Domains para tipos comuns?
- [ ] Sem duplicação de constraints?
- [ ] Defaults centralizados?

---

### 3️⃣ KISS NO DESIGN

**Responsabilidade do Data Engineer:**
- Schema o mais simples possível
- Normalização até 3NF (não além)
- Sem premature optimization

**Simples vs Complexo:**
```sql
❌ COMPLEXO (premature denormalization):
CREATE TABLE lead_metrics_cache (
  -- Dados que já existem em outras tabelas
)

✅ SIMPLES (normalize, query quando necessário):
CREATE TABLE leads (
  id, status, created_at, ...
)
-- Query quando precisar de metrics

❌ COMPLEXO (4NF+, boyce-codd):
-- Normalização excessiva criando joins absurdos

✅ SIMPLES (3NF):
-- Balanceado entre simplicity e normalization
```

---

### 4️⃣ YAGNI NO SCHEMA

**Responsabilidade do Data Engineer:**
- Criar APENAS campos necessários
- Sem "future-proofing" columns
- Adicionar campo quando requisito chegar

**Exemplo YAGNI:**
```sql
❌ ERRADO (antecipando):
CREATE TABLE users (
  id, name, email, phone, address, country, postal_code,
  mother_name, birth_date, ssn, credit_card_token,
  -- Tudo isso pode não ser necessário
)

✅ CERTO (apenas essencial):
CREATE TABLE users (
  id, email, role, created_at, updated_at
)
-- Adicionar campos quando requisição chegar
```

**Checklist:**
- [ ] Todos campos solicitados estão implementados?
- [ ] Nada além foi adicionado?
- [ ] Sem "nice-to-have" columns?
- [ ] Pronto para adicionar depois se precisar?

---

### 5️⃣ FEATURE-BASED SCHEMA ORGANIZATION

**Responsabilidade do Data Engineer:**
- Migrations organizadas por feature
- Tables agrupadas logicamente
- Clear separation entre features

**Estrutura de Migrations:**
```
db/migrations/
├── 001_auth/
│   ├── 001_create_users_table.sql
│   ├── 002_create_user_roles_table.sql
│   └── 003_seed_roles.sql
├── 002_clients/
│   ├── 001_create_empresas_table.sql
│   └── 002_create_empresa_contacts_table.sql
├── 003_crm/
│   ├── 001_create_leads_table.sql
│   ├── 002_create_lead_status_history.sql
│   └── 003_create_lead_indexes.sql
└── 004_reports/
    ├── 001_create_reports_table.sql
    └── 002_create_report_sections.sql
```

**Documentation per feature:**
```
db/migrations/001_auth/README.md
- Qual feature: Auth
- Dependências: Nenhuma (foundation)
- Tables: users, user_roles
- Rollback: Seguro? ✅
```

---

### 6️⃣ SEPARATION OF CONCERNS

**Responsabilidade do Data Engineer:**
- Cada migration = 1 responsabilidade
- Não misturar schema + seeds
- Separar constraints de dados

**SoC em Migrations:**
```
❌ ERRADO (responsabilidades misturadas):
CREATE TABLE users (
  id, email, role, created_at, ...
);
INSERT INTO users VALUES (...)  -- Data aqui
INSERT INTO user_roles VALUES (...)
ALTER TABLE users ADD CONSTRAINT ...

✅ CERTO (separado por responsabilidade):
001_create_users_table.sql
  → Apenas schema

002_create_user_roles_table.sql
  → Apenas schema

003_seed_roles.sql
  → Apenas seed data

004_add_user_constraints.sql
  → Apenas constraints
```

**Pattern SoC:**

| Arquivo | Responsabilidade |
|---------|-----------------|
| `001_create_table.sql` | Schema apenas |
| `002_add_indexes.sql` | Performance apenas |
| `003_add_constraints.sql` | Integridade apenas |
| `004_seed_data.sql` | Dados iniciais apenas |
| `005_add_triggers.sql` | Lógica apenas |

---

## 📊 DATA ENGINEER CHECKLIST (6 PREMISSAS)

```markdown
## 1️⃣ Dependências
- [ ] Migration segue ordem de dependências?
- [ ] Foreign keys corretos?
- [ ] Rollback não quebra referências?

## 2️⃣ DRY
- [ ] Enums criados para valores fixos?
- [ ] Domains reutilizáveis criados?
- [ ] Constraints não repetem?

## 3️⃣ KISS
- [ ] Schema é o mais simples?
- [ ] Normalização adequada (3NF)?
- [ ] Sem over-engineering?

## 4️⃣ YAGNI
- [ ] Todos campos requisitados?
- [ ] Nada além foi adicionado?
- [ ] Pronto para crescer depois?

## 5️⃣ Feature-Based
- [ ] Migrations organizadas por feature?
- [ ] Cada feature em sua pasta?
- [ ] README documentando?

## 6️⃣ SoC
- [ ] Schema, indexes, constraints, seed separados?
- [ ] Cada arquivo = 1 responsabilidade?
- [ ] Triggers em arquivo próprio?

## Quality
- [ ] Migration testa up/down? ✅
- [ ] Sem erros de syntax? ✅
- [ ] Documentado em README? ✅
```

---

## 🚀 DATA ENGINEER WORKFLOW

### 1. Receber Requisito de Feature
```
[Feature] CRM - Leads management
```

### 2. Entender Schema Necessário
- Quais fields precisa?
- Quais relações com outras features?
- Quais constraints?

### 3. Planejar Migrações
```
Ordem:
1. users (foundation) ← já existe
2. leads (novo)
3. lead_status_history (relacionado)
4. indexes
```

### 4. Escrever Migrações
```sql
-- db/migrations/003_crm/001_create_leads_table.sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  empresa_id UUID REFERENCES empresas,
  user_id UUID REFERENCES users,
  status status_enum,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- db/migrations/003_crm/002_create_lead_status_history.sql
CREATE TABLE lead_status_history (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads,
  old_status status_enum,
  new_status status_enum,
  changed_by UUID REFERENCES users,
  changed_at TIMESTAMP DEFAULT NOW()
)

-- db/migrations/003_crm/003_add_lead_indexes.sql
CREATE INDEX idx_leads_empresa ON leads(empresa_id);
CREATE INDEX idx_leads_user ON leads(user_id);
```

### 5. Testar Up/Down
```bash
# Up
psql -f db/migrations/003_crm/*.sql

# Down (reverso)
# Confirmar que rollback funciona
```

### 6. Documentação
```
db/migrations/003_crm/README.md
- Feature: CRM
- Tables: leads, lead_status_history
- Dependências: Auth, Clients
- Status: Pronto para produção ✅
```

---

## ⚠️ REJEITAR MIGRATIONS QUE VIOLEM

```
❌ Schema não respeitando dependências
❌ Campos além do necessário (YAGNI)
❌ Responsabilidades misturadas (SoC)
❌ Sem rollback testado
❌ Sem documentação
```

---

*Last Updated: 2026-02-23*
*Versão: 1.0 — 6 Premissas Edition*
