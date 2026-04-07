# 🧪 Testing Strategy

**Test-Driven Development is MANDATORY. All features MUST be test-first.**

## 🎯 Core Principle: Centralized Testing

**ALL tests MUST live in `/tests` directory.**

```
tests/
├── unit/                    # Unit tests (mirror structure)
├── integration/             # Integration tests (with DB)
├── rls/                     # RLS tests (per table)
└── mocks/                   # Shared mocks & fixtures
```

**NEVER create tests outside `/tests`:**

```
❌ WRONG:
apps/web/app/dashboard/page.test.ts
packages/supabase-data/src/actions/tasks.test.ts

✅ CORRECT:
tests/unit/web/app/dashboard/page.test.ts
tests/unit/supabase-data/actions/tasks.test.ts
```

**Exception:** pgTAP tests in `supabase/tests/` (database-level tests)

---

## 📁 Test Directory Structure

### **Mirror Structure**

Tests in `/tests` MUST mirror the source structure:

```
Source:                              Tests:
packages/supabase-data/              tests/unit/supabase-data/
├── src/                             ├── src/
│   ├── modules/                     │   ├── modules/
│   │   └── tasks/                   │   │   └── tasks/
│   │       ├── domain/              │   │       ├── domain/
│   │       │   └── dto/             │   │       │   └── dto/
│   │       │       └── task.dto.ts  │   │       │       └── task.dto.test.ts
│   │       └── infrastructure/      │   │       └── infrastructure/
│   │           └── repositories/    │   │           └── repositories/
│   │               └── task-repo.ts │   │               └── task-repo.test.ts
```

### **Why Mirror Structure?**

- ✅ Clear ownership
- ✅ Easy to find tests
- ✅ Prevents test files in source
- ✅ Enforces separation of concerns

---

## 📊 Test Types & Locations

### **1. Unit Tests** (`tests/unit/`)

**What to test:**

- Pure functions
- DTOs and schemas
- Utils and helpers
- Components (isolated)
- Repositories (with mocks)

**Where:**

```
tests/unit/
├── supabase-data/          # Mirror structure
│   ├── modules/
│   ├── actions/
│   └── hooks/
├── supabase-auth/          # Mirror structure
│   ├── session/
│   └── server/
├── supabase-infra/         # Mirror structure
│   ├── clients/
│   └── env/
├── brand/                  # Shared compositions (@workspace/brand)
└── web/                    # Mirror structure
    ├── components/
    └── lib/
```

**`@workspace/ui` (shadcn):** do **not** add tests under `tests/unit/ui/`. That
package is CLI-generated and treated as vendored; test **compositions** in
`tests/unit/brand/` and product components in `tests/unit/web/` (or e2e).

**Example:**

```typescript
// tests/unit/supabase-data/modules/tasks/task-repository.test.ts
import { describe, it, expect, vi } from "vitest"
import { TaskSupabaseRepository } from "@workspace/supabase-data/modules/tasks"

describe("TaskSupabaseRepository", () => {
  it("creates a task", async () => {
    const mockSupabase = createMockSupabase()
    const repo = new TaskSupabaseRepository(mockSupabase)

    const task = await repo.create({ title: "Test", studentId: "user-1" })

    expect(task.title).toBe("Test")
  })
})
```

**Database:** ❌ NO real database (use mocks)

---

### **2. Integration Tests** (`tests/integration/`)

**What to test:**

- Server Actions with real DB
- Repositories with real DB
- Auth flows
- API endpoints

**Where:**

```
tests/integration/
├── supabase-data/
│   ├── tasks/
│   │   ├── create-task.integration.test.ts
│   │   └── get-task.integration.test.ts
│   └── users/
└── supabase-auth/
    ├── login.integration.test.ts
    └── session.integration.test.ts
```

**Example:**

```typescript
// tests/integration/supabase-data/tasks/create-task.integration.test.ts
import { describe, it, expect, beforeAll } from "vitest"
import { createTaskAction } from "@workspace/supabase-data/actions/tasks/create-task"

describe("Create Task Integration", () => {
  beforeAll(async () => {
    // Setup: seed test data
  })

  it("creates a task with real DB", async () => {
    const result = await createTaskAction({
      title: "Test Task",
      description: "Test Description",
    })

    expect(result.success).toBe(true)
    expect(result.data.title).toBe("Test Task")
  })
})
```

**Database:** ✅ Real Supabase local database

---

### **3. RLS Tests** (`tests/rls/`)

**What to test:**

- Row Level Security policies
- Data isolation
- Permission checks
- Access control

**Where:**

```
tests/rls/
└── supabase-data/
    ├── tasks.rls.test.ts
    ├── users.rls.test.ts
    ├── profiles.rls.test.ts
    └── [every table].rls.test.ts
```

**Example:**

```typescript
// tests/rls/supabase-data/tasks.rls.test.ts
import { describe, it, expect, beforeAll } from "vitest"
import { createClient } from "@supabase/supabase-js"

describe("Tasks RLS", () => {
  let user1Client: TypedSupabaseClient
  let user2Client: TypedSupabaseClient

  beforeAll(async () => {
    // Create test users with different auth tokens
    user1Client = await createTestClient("user-1")
    user2Client = await createTestClient("user-2")
  })

  describe("SELECT policies", () => {
    it("allows user to view their own tasks", async () => {
      // Create task as user1
      const { data: task } = await user1Client
        .from("tasks")
        .insert({ title: "My Task", student_id: "user-1" })
        .select()
        .single()

      // User1 can see their own task
      const { data } = await user1Client
        .from("tasks")
        .select()
        .eq("id", task.id)
        .single()

      expect(data).toBeDefined()
    })

    it("prevents user from viewing other users' tasks", async () => {
      // User2 tries to see user1's task
      const { data, error } = await user2Client
        .from("tasks")
        .select()
        .eq("id", task.id)
        .single()

      // RLS should return null or error
      expect(data).toBeNull()
    })
  })

  describe("INSERT policies", () => {
    it("allows authenticated user to create task", async () => {
      const { data, error } = await user1Client
        .from("tasks")
        .insert({ title: "New Task", student_id: "user-1" })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it("prevents unauthenticated insert", async () => {
      const anonClient = createAnonClient()

      const { error } = await anonClient
        .from("tasks")
        .insert({ title: "Hacker Task" })

      expect(error).toBeDefined()
      expect(error.code).toBe("PGRST301") // RLS violation
    })
  })
})
```

**Database:** ✅ Real Supabase with RLS enabled  
**Mandatory:** ✅ For EVERY table

---

### **4. pgTAP Tests** (`supabase/tests/`)

**Exception to `/tests` rule!**

**What to test:**

- Database functions
- Stored procedures
- Triggers
- Database-level constraints

**Where:**

```
supabase/tests/
├── pgtap/
│   ├── 001_access_control.sql
│   ├── 002_functions.sql
│   └── 003_triggers.sql
└── fixtures/
    └── test-data.sql
```

**Example:**

```sql
-- supabase/tests/pgtap/001_access_control.sql
BEGIN;

SELECT plan(3);

-- Test auth_is_admin() function
SELECT ok(
  public.auth_is_admin(),
  'Admin user has admin role'
);

-- Test get_user_access_payload()
SELECT results_eq(
  $$ SELECT permissions::text FROM public.get_user_access_payload('user-id') $$,
  $$ VALUES ('{}') $$,
  'Empty permissions for regular user'
);

SELECT * FROM finish();

ROLLBACK;
```

**Run with:**

```bash
pnpm test:db
```

**Database:** ✅ Real Supabase with pgTAP extension

---

## 🚫 Where NOT to Put Tests

### **NEVER in Source Directories**

```
❌ FORBIDDEN:
apps/web/app/dashboard/page.test.ts
packages/supabase-data/src/actions/tasks.test.ts
packages/ui/src/components/button.test.ts

✅ REQUIRED:
tests/unit/web/app/dashboard/page.test.ts
tests/unit/supabase-data/actions/tasks.test.ts
tests/unit/brand/components/your-composition.test.tsx
```

**Note:** There is **no** `tests/unit/ui/` tree by design — shadcn primitives are
not re-tested in this template (see `@workspace/ui` README / AGENTS).

### **NEVER in App Layer for Business Logic**

```
❌ FORBIDDEN:
apps/web/app/api/tasks/route.test.ts  // API routes should be thin

✅ REQUIRED:
tests/integration/supabase-data/actions/tasks.test.ts  // Test the action
```

**Why:** Apps layer should delegate to Server Actions which are tested in
`/tests/integration/supabase-data/`

---

## 📋 Test File Naming

### **Unit Tests**

```
{file-name}.test.ts

Examples:
- task.dto.test.ts
- task-repository.test.ts
- button.test.tsx
```

### **Integration Tests**

```
{feature}.integration.test.ts

Examples:
- create-task.integration.test.ts
- login.integration.test.ts
```

### **RLS Tests**

```
{table}.rls.test.ts

Examples:
- tasks.rls.test.ts
- users.rls.test.ts
- profiles.rls.test.ts
```

### **pgTAP Tests**

```
{number}_{description}.sql

Examples:
- 001_access_control.sql
- 002_functions.sql
- 003_triggers.sql
```

---

## 🎯 Test Coverage Requirements

### **Minimum Thresholds**

| Metric     | Minimum |
| ---------- | ------- |
| Lines      | 80%     |
| Statements | 80%     |
| Branches   | 75%     |
| Functions  | 80%     |

### **Critical Files (100% Required)**

- ✅ Server Actions
- ✅ Repositories
- ✅ Auth guards
- ✅ RLS policies
- ✅ Security checks

---

## 🤖 AI Agent Instructions

### **When Creating Features**

1. **CREATE test file first** in `/tests/unit/` or `/tests/integration/`
2. **WRITE failing test**
3. **IMPLEMENT feature** to make test pass
4. **ADD RLS test** if database table involved
5. **RUN tests** before committing

### **Test File Location Decision Tree**

```
Is it testing a database table's RLS policies?
├─ YES → tests/rls/supabase-data/{table}.rls.test.ts
└─ NO → Continue

Is it testing with real database?
├─ YES → tests/integration/{package}/{feature}.integration.test.ts
└─ NO → Continue

Is it testing pure logic (no DB)?
└─ YES → tests/unit/{mirror-structure}/{file}.test.ts
```

### **NEVER Do This**

```typescript
// ❌ FORBIDDEN: Test in source directory
// packages/supabase-data/src/actions/tasks.test.ts
import { describe, it } from "vitest"
// ...

// ✅ CORRECT: Test in /tests directory
// tests/unit/supabase-data/actions/tasks.test.ts
import { describe, it } from "vitest"
// ...
```

### **ALWAYS Do This**

```typescript
// ✅ ALWAYS: Mirror structure in /tests
// Source: packages/supabase-data/src/modules/tasks/infrastructure/repositories/task-repository.ts
// Test: tests/unit/supabase-data/modules/tasks/infrastructure/repositories/task-repository.test.ts

// ✅ ALWAYS: Use integration tests for Server Actions
// Test: tests/integration/supabase-data/actions/tasks/create-task.integration.test.ts

// ✅ ALWAYS: Create RLS test for every table
// Test: tests/rls/supabase-data/tasks.rls.test.ts
```

---

## 📊 Test Suites Overview

| Suite           | Location             | DB      | Purpose                 | When                 |
| --------------- | -------------------- | ------- | ----------------------- | -------------------- |
| **Unit**        | `tests/unit/`        | ❌ Mock | Test logic in isolation | Always               |
| **Integration** | `tests/integration/` | ✅ Real | Test with real DB       | Server Actions, APIs |
| **RLS**         | `tests/rls/`         | ✅ Real | Test security policies  | Every table          |
| **pgTAP**       | `supabase/tests/`    | ✅ Real | Test DB functions       | Functions, triggers  |

---

## 🔒 Security Rules

### **Test Data**

```typescript
// ✅ CORRECT: Use test users
const testUserId = "test-user-123"

// ❌ FORBIDDEN: Hardcoded production IDs
const userId = "prod-user-abc123"
```

### **Credentials**

```typescript
// ✅ CORRECT: From environment
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ❌ FORBIDDEN: Hardcoded
const supabaseKey = "eyJhbGciOiJIUzI1NiIs..."
```

---

## 🚀 Commands

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run integration tests (requires Supabase running)
pnpm test:integration

# Run RLS tests (requires Supabase running)
pnpm test:rls

# Run pgTAP tests (requires Supabase running)
pnpm test:db

# Vitest integration + RLS + pgTAP in one go (requires Supabase running)
pnpm test:db:all

# Run all tests
pnpm test:all
```

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Compliance:** Mandatory  
**Enforcement:** Automated + Human Review
