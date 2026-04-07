# 🧪 Testing Culture

**Test-Driven Development is not optional. It's how we build software.**

## 🎯 Core Philosophy

### **1. Tests First, Code Second**

```
❌ WRONG:
1. Write code
2. Write tests (if you remember)
3. Commit

✅ CORRECT:
1. Write failing test
2. Write minimal code to pass
3. Refactor
4. Commit
```

### **2. Tests Live in /tests**

```
❌ WRONG:
packages/supabase-data/src/actions/tasks.test.ts

✅ CORRECT:
tests/unit/supabase-data/src/actions/tasks.test.ts
```

**Why:** Tests are implementation details. Source directories contain source
code, not tests.

### **3. Mirror Structure**

Tests MUST mirror source structure:

```
Source:  packages/supabase-data/src/modules/tasks/infrastructure/repositories/task-repo.ts
Test:    tests/unit/supabase-data/src/modules/tasks/infrastructure/repositories/task-repo.test.ts
```

**Why:** Easy to find tests, clear ownership, prevents test files in source.

---

## 📁 Where Tests Live

### **The Rule**

**ALL tests in `/tests` directory. Period.**

```
tests/
├── unit/                    # Unit tests (mocks, no DB)
├── integration/             # Integration tests (real DB)
├── rls/                     # RLS tests (per table, MANDATORY)
└── mocks/                   # Shared mocks
```

**Exception:** pgTAP tests in `supabase/tests/` (database-level only)

---

## 🚫 Where Tests DO NOT Live

### **NEVER in Source Directories**

```
❌ apps/web/app/dashboard/page.test.tsx
❌ packages/supabase-data/src/actions/tasks.test.ts
❌ packages/ui/src/components/button.test.ts
```

**Why:** Source directories are for source code. Tests are separate.

**`@workspace/ui`:** shadcn primitives are CLI-managed; this template does **not**
use `tests/unit/ui/`. Test shared compositions under `tests/unit/brand/` and
app code under `tests/unit/web/`.

### **NEVER in App Layer**

```
❌ apps/web/app/api/tasks/route.test.ts
```

**Why:** App layer should be thin. Test the business logic in
`/tests/integration/supabase-data/`.

---

## 📊 Test Types

### **Unit Tests** (`tests/unit/`)

**What:** Pure logic, no database  
**How:** Mocks for everything  
**When:** Always

```typescript
// tests/unit/supabase-data/modules/tasks/task-repository.test.ts
import { describe, it, expect, vi } from "vitest"

describe("TaskRepository", () => {
  it("creates a task", async () => {
    const mockSupabase = createMockSupabase()
    const repo = new TaskRepository(mockSupabase)

    const task = await repo.create({ title: "Test" })

    expect(task.title).toBe("Test")
  })
})
```

---

### **Integration Tests** (`tests/integration/`)

**What:** Server Actions, APIs, real flows  
**How:** Real Supabase database  
**When:** For all business logic

```typescript
// tests/integration/supabase-data/actions/tasks/create-task.integration.test.ts
import { describe, it, expect } from "vitest"

describe("Create Task Integration", () => {
  it("creates a task with real DB", async () => {
    const result = await createTaskAction({ title: "Test" })

    expect(result.success).toBe(true)
  })
})
```

---

### **RLS Tests** (`tests/rls/`)

**What:** Row Level Security policies  
**How:** Real Supabase with RLS  
**When:** MANDATORY for EVERY table

```typescript
// tests/rls/supabase-data/tasks.rls.test.ts
describe("Tasks RLS", () => {
  it("prevents user from viewing other users' tasks", async () => {
    // Test data isolation
  })

  it("allows authenticated user to create task", async () => {
    // Test insert permission
  })
})
```

**This is NOT optional.** Every table MUST have RLS tests.

---

### **pgTAP Tests** (`supabase/tests/`)

**What:** Database functions, triggers  
**How:** SQL with pgTAP extension  
**When:** For DB-level logic

```sql
-- supabase/tests/pgtap/001_access_control.sql
SELECT ok(public.auth_is_admin(), 'Admin has admin role');
```

**Only exception** to `/tests` rule.

---

## 🤖 AI Agent Culture

### **When Creating Features**

**ALWAYS:**

1. Create test file FIRST in `/tests`
2. Write failing test
3. Implement feature to pass test
4. Add RLS test if database involved
5. Run tests before committing

**NEVER:**

- Suggest creating test in source directory
- Create test outside `/tests`
- Forget RLS tests for database changes

### **Location Decision Tree**

```
Is it testing RLS for a table?
└─ YES → tests/rls/supabase-data/{table}.rls.test.ts

Is it testing with real database?
└─ YES → tests/integration/{package}/{feature}.integration.test.ts

Is it testing pure logic?
└─ YES → tests/unit/{mirror-structure}/{file}.test.ts
```

---

## 📋 Non-Negotiable Rules

### **Rule 1: Tests in /tests**

```
✅ tests/unit/supabase-data/actions/tasks.test.ts
❌ packages/supabase-data/src/actions/tasks.test.ts
```

### **Rule 2: Mirror Structure**

```
Source:  packages/supabase-data/src/modules/tasks/task-repo.ts
Test:    tests/unit/supabase-data/src/modules/tasks/task-repo.test.ts
```

### **Rule 3: RLS Tests Mandatory**

```
Created a table? → Create tests/rls/supabase-data/{table}.rls.test.ts
```

### **Rule 4: Test First**

```
Write test → Write code → Refactor → Commit
```

---

## 🔒 Enforcement

### **Pre-Commit Hook**

```bash
# Block tests outside /tests
if find apps/ packages/ -name "*.test.ts" | grep -v node_modules; then
  echo "❌ Tests must be in /tests directory"
  exit 1
fi
```

### **Code Review**

- Block tests in source directories
- Require RLS tests for schema changes
- Verify mirror structure

### **AI Agents**

- Auto-suggest `/tests` location
- Never create tests outside allowed dirs
- Always remind about RLS tests

---

## 📈 Coverage Requirements

| Metric     | Minimum |
| ---------- | ------- |
| Lines      | 80%     |
| Statements | 80%     |
| Branches   | 75%     |
| Functions  | 80%     |

**Critical files (Server Actions, Repositories, RLS): 100%**

---

## 🚀 Commands

```bash
pnpm test              # Unit tests
pnpm test:coverage     # With coverage
pnpm test:integration  # With real DB
pnpm test:rls          # RLS tests (mandatory)
pnpm test:all          # Everything
```

---

**Culture is not what you say. It's what you do.**

**We test first. We test everything. We test in /tests.**

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Compliance:** Cultural (Non-Negotiable)
