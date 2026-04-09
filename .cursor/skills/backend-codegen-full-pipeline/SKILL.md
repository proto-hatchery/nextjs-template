# Backend Codegen Full Pipeline Skill

**Purpose:** Fully automated backend code generation from database schema to
production-ready code

**Triggers:** User asks to "generate backend", "run codegen", "create
repositories", "generate actions", "regenerate code"

## Critical (do not violate)

- **Never hand-edit** `*.codegen.*`. If output is wrong, **change the
  generator** under `scripts/codegen/` and `packages/codegen-tools/`, then
  re-run `pnpm codegen:backend` / `pnpm codegen:actions-hooks` /
  `pnpm codegen:full-pipeline`.
- **`pnpm codegen:clean`** deletes only paths matching `*.codegen.*` (and resets
  `config/action-semantic-plan.json` from `action-semantic-plan.example.json`).
  Template modules `profiles`, `user-access`, `user-roles` and backend stubs
  (`*.ts` with `// codegen:backend —`) are **not** removed by clean.

---

## What This Skill Does

This skill runs the **COMPLETE automated pipeline**:

1. **Phase 0: Semantic Analysis** - Reads database.types.ts and generates
   intelligent plans
2. **Phase 1: Repositories** - Generates DTOs, mappers, ports, repositories,
   integration tests
3. **Phase 2: Actions** - Generates Server Actions with Zod validation, auth,
   logging, unit tests
4. **Phase 3: Hooks** - Generates TanStack Query hooks with query keys, unit
   tests
5. **Validation** - Runs typecheck, lint, tests automatically

**Zero manual intervention required** for a green run — failures are fixed in
**codegen scripts**, not in generated files.

---

## How It Works

### Step 1: Pre-flight Checks (Automatic)

```typescript
// Skill checks:
✅ database.types.ts exists and is valid
✅ Supabase connection is configured
✅ Config files are valid JSON
```

**If checks fail:** Skill provides clear instructions to fix

### Step 2: Generate Semantic Plans (Phase 0)

```bash
pnpm codegen:actions-semantic-plan
```

**What happens:**

- Reads `packages/supabase-infra/src/types/database.types.ts`
- Analyzes 200+ tables semantically
- Identifies domains, relationships, PHI fields
- Generates 3 SSOT JSON files:
  - `config/domain-map.json` - Domains and auth rules
  - `config/repository-plan.json` - Tables and methods
  - `config/action-semantic-plan.json` - Action semantics

### Step 3: Generate Repositories (Phase 1)

```bash
pnpm codegen:backend --write
```

**What happens:**

- Generates modules for each domain
- Creates DTOs with Zod schemas
- Creates mappers (database ↔ DTO)
- Creates repository ports (interfaces)
- Creates repository implementations
- Generates integration tests

**Output:**

```
packages/supabase-data/src/modules/patients/
├── domain/
│   ├── dto/
│   │   └── psychologist-patient.dto.ts
│   └── ports/
│       └── psychologist-patient-repository.port.ts
└── infrastructure/
    ├── mappers/
    │   └── psychologist-patient.mapper.ts
    └── repositories/
        └── psychologist-patient-supabase.repository.ts

tests/integration/supabase-data/modules/patients/
└── psychologist-patient.repository.codegen.test.ts
```

### Step 4: Generate Actions + Hooks (Phase 2+3)

```bash
pnpm codegen:actions-hooks --write
```

**What happens:**

- Reads `action-semantic-plan.json`
- Generates Server Actions with:
  - Zod v4 validation
  - Auth via `requireAuth()`
  - Rate limiting
  - PHI sanitization
  - Structured logging
- Generates TanStack Query hooks
- Generates unit tests for both

**Output:**

```
packages/supabase-data/src/actions/patients/
├── create-patient.codegen.ts
├── list-patients.codegen.ts
└── update-patient.codegen.ts

packages/supabase-data/src/hooks/patients/
└── use-patient-query.hook.codegen.ts

tests/unit/supabase-data/
├── actions/patients/*.codegen.test.ts
└── hooks/patients/*-query.hook.codegen.test.ts
```

### Step 5: Validation (Automatic)

```bash
pnpm typecheck  # TypeScript validation
pnpm lint       # Code style validation
pnpm test       # Unit + integration tests
```

**On failure:** adjust **`scripts/codegen/*`** and
**`packages/codegen-tools/`**, then re-run — **do not** patch `*.codegen.*` by
hand. Optional: `pnpm format` if lint is style-only.

### Step 6: Final Report

**Success:**

```
✅ Pipeline completed successfully!

🎉 Generated:
   - 3 semantic plans
   - 45 repositories
   - 200+ actions
   - 200+ hooks
   - 400+ tests

📝 Next steps:
   1. Review generated code (optional)
   2. Add package.json exports (if new modules)
   3. Commit changes
   4. Deploy!
```

**Partial Success:**

```
⚠️  Pipeline completed with warnings:
   - Test Suite (12 failures)

📝 Optional steps failed, but core generation succeeded.
   You can still use the generated code.

💡 To fix tests:
   - Review failing tests
   - Update test expectations
   - Re-run: pnpm test
```

---

## Usage Examples

### Example 1: Full Generation (Recommended)

**User:** "Generate the complete backend from the database schema"

**Skill Response:**

```
🚀 Running full codegen pipeline...

✅ Pre-flight checks passed
✅ Phase 0: Generated semantic plans (3 files)
✅ Phase 1: Generated repositories (45 modules)
✅ Phase 2+3: Generated actions + hooks (400+ files)
✅ TypeScript check passed
✅ Lint check passed
✅ Tests passed (400/400)

🎉 Pipeline completed successfully!

Generated files are ready to commit.
```

### Example 2: Regenerate After Schema Change

**User:** "I changed the database schema, regenerate everything"

**Skill Response:**

```
🔄 Regenerating backend after schema change...

1. Cleaning auto-generated files...
   ✅ Cleaned 643 files

2. Generating types from Supabase...
   ✅ database.types.ts updated

3. Running full pipeline...
   ✅ Phase 0-3 completed
   ✅ All validations passed

🎉 Regeneration complete!
```

### Example 3: Generate Specific Domain

**User:** "Generate code for the patients domain only"

**Skill Response:**

```
🎯 Generating patients domain...

✅ Phase 0: Updated semantic plans
✅ Phase 1: Generated patients repositories (7 modules)
✅ Phase 2: Generated patients actions (15 actions)
✅ Phase 3: Generated patients hooks (15 hooks)
✅ All validations passed

🎉 Patients domain generated successfully!
```

---

## Error Handling

### Error: database.types.ts not found

**Skill Response:**

```
❌ database.types.ts not found!

💡 Solution:
1. Connect to Supabase: pnpm supabase link
2. Generate types: pnpm supabase:types:local
3. Re-run: pnpm codegen:full-pipeline

Want me to run these commands for you? (yes/no)
```

### Error: TypeScript check failed

**Skill Response:**

```
❌ TypeScript check failed with 12 errors

Common causes:
- Repository not exported in package.json
- Import path missing .codegen extension
- Type mismatch in DTO

📋 Top 3 errors:
1. Cannot find module '@workspace/supabase-data/modules/patients/...'
   → Add to package.json exports?

2. Property 'id' does not exist on type '...'
   → Schema changed, regenerate types?

3. Module was resolved, but its type declarations are missing
   → Run pnpm install?

Want me to:
1. Auto-fix common issues (recommended)
2. Show all errors
3. Skip validation and continue

Choice (1/2/3):
```

### Error: Lint failed

**Skill Response:**

```
❌ Lint check failed with 5 errors

Auto-fixing...
✅ Running: pnpm format

✅ Lint errors fixed automatically!

Continuing pipeline...
```

---

## Configuration Files

### Generated by Phase 0 (SSOT)

| File                               | Purpose                       | Editable?          |
| ---------------------------------- | ----------------------------- | ------------------ |
| `config/domain-map.json`           | Domain boundaries, auth rules | ✅ Manual override |
| `config/repository-plan.json`      | Tables, methods, DTOs         | ✅ Manual override |
| `config/action-semantic-plan.json` | Action semantics              | ✅ Manual override |

### Generated by Pipeline (Auto)

| Directory                             | Content                     | Auto-generated? |
| ------------------------------------- | --------------------------- | --------------- |
| `packages/supabase-data/src/modules/` | Repositories, DTOs, mappers | ✅ Yes          |
| `packages/supabase-data/src/actions/` | Server Actions              | ✅ Yes          |
| `packages/supabase-data/src/hooks/`   | TanStack Query hooks        | ✅ Yes          |
| `tests/integration/`                  | Integration tests           | ✅ Yes          |
| `tests/unit/supabase-data/`           | Unit tests                  | ✅ Yes          |

### Manual Files (Preserved)

| Directory                                         | Content            | Auto-generated? |
| ------------------------------------------------- | ------------------ | --------------- |
| `packages/supabase-data/src/actions/_shared/`     | Shared utilities   | ❌ No           |
| `packages/supabase-data/src/actions/user-access/` | User access logic  | ❌ No           |
| `packages/supabase-data/src/actions/user-roles/`  | Role management    | ❌ No           |
| `packages/supabase-data/src/actions/profiles/`    | Profile management | ❌ No           |
| `packages/supabase-data/src/actions/example/`     | Examples           | ❌ No           |

---

## Best Practices

### When to Run Full Pipeline

✅ **DO run when:**

- Schema changes (new tables, columns, relationships)
- Starting a new domain
- Regenerating after cleanup
- Template setup

❌ **DON'T run when:**

- You have manual changes in generated files (they'll be overwritten)
- You only need to fix a single action/hook
- Database is not connected

### After Running Pipeline

1. **Review generated code** (optional but recommended for first run)
2. **Add package.json exports** for new modules:
   ```json
   {
     "exports": {
       "./modules/patients/*": "./src/modules/patients/*"
     }
   }
   ```
3. **Commit generated files** (yes, commit them!)
4. **Deploy**

### Version Control

**Commit these:**

- ✅ `config/*.json` (semantic plans)
- ✅ `packages/supabase-data/src/modules/**/*` (repositories)
- ✅ `packages/supabase-data/src/actions/**/*.codegen.ts`
- ✅ `packages/supabase-data/src/hooks/**/*.codegen.ts`
- ✅ All generated tests

**Don't commit:**

- ❌ `packages/supabase-infra/src/types/database.types.ts` (generated by
  Supabase CLI)
- ❌ Manual files (they're already tracked)

---

## Related Skills

- [`backend-domain-codegen-init`](../backend-domain-codegen-init/SKILL.md) -
  Initial setup
- [`backend-domain-map`](../backend-domain-map/SKILL.md) - Domain map generation
- [`repository-pattern`](../repository-pattern/SKILL.md) - Repository pattern
  implementation

---

## Commands Reference

```bash
# Full pipeline (recommended)
pnpm codegen:full-pipeline

# Skip tests (faster)
pnpm codegen:full-pipeline:clean

# CI mode (skip optional validation)
pnpm codegen:full-pipeline:ci

# Clean only (remove generated files)
pnpm codegen:clean

# Individual phases
pnpm codegen:actions-semantic-plan  # Phase 0
pnpm codegen:backend --write         # Phase 1
pnpm codegen:actions-hooks --write   # Phase 2+3
```

---

**Skill ID:** BACKEND-CODEGEN-FULL-PIPELINE  
**Version:** 1.0.0  
**Last Updated:** 2026-04-07
