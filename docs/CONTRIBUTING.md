# Contributing to Next.js Template

This guide covers everything you need to know about contributing to this
template, including required tooling and development workflows.

## Repository rules (no Cursor required)

The same **31** contributor rules exist as
[`.cursor/rules/*.mdc`](../../.cursor/rules) and as markdown in
**[`docs/standards/rules/`](./standards/rules/README.md)**. You do not need
Cursor to follow them. CI runs `pnpm check:cursor-rules-parity` to ensure every
`.mdc` has a matching `.md`. After changing a rule file, run
`pnpm sync:cursor-rules-docs` to refresh the docs copy.

### Composition package filenames (hooks, components, providers)

When adding code under **`packages/brand`**, **`packages/core`**,
**`packages/forms`**, or **`packages/seo`**, follow
**[`docs/standards/package-file-suffixes.md`](./standards/package-file-suffixes.md)**.
**`packages/ui`** is never renamed for this; **`apps/`** must not use these
suffixes in filenames. Enforcement: `pnpm check:forbidden`.

## Required Tooling

This template uses 7 essential tools for code quality, security, and
maintainability. All tools run automatically via git hooks and CI/CD.

### 1. Dependency Cruiser

**What it does:** Enforces architectural boundaries by analyzing module
dependencies. Prevents:

- Cross-app imports in the monorepo
- Server-to-client code leaks
- Barrel imports (index.ts)
- Circular dependencies

**How to run it:**

```bash
# Run on all app routers + packages (matches lefthook)
pnpm depcruise apps/*/app packages/*/src --config .dependency-cruiser.cjs

# Run on specific directory
pnpm depcruise apps/example/app --config .dependency-cruiser.cjs
```

**When it runs automatically:**

- Pre-push git hook (via lefthook)
- Can be added to CI/CD pipelines

**Documentation:**
[docs/tools/dependency-cruiser.md](./tools/dependency-cruiser.md)

---

### 2. Knip

**What it does:** Dead code detector that finds:

- Unused dependencies
- Unused exports
- Unused files
- Missing dependencies

**How to run it:**

```bash
# Production mode (recommended)
pnpm knip --production

# Verbose output
pnpm knip --production --verbose

# Strict mode (fails on issues)
pnpm knip --production --strict
```

**When it runs automatically:**

- Pre-push git hook (via lefthook)
- Can be added to CI/CD pipelines

**Documentation:** [docs/tools/knip.md](./tools/knip.md)

---

### 3. next-safe-action

**What it does:** Type-safe Server Actions library providing:

- Full type inference from schema to component
- Zod input validation
- Structured error handling
- Auth middleware patterns
- Optimistic updates support

**How to use it:**

```typescript
"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createTask = authActionClient
  .schema(z.object({ title: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId from auth middleware
    return await db.task.create({
      data: { title: parsedInput.title, userId: ctx.userId },
    })
  })
```

**When it runs:**

- Type checking on every build
- Runtime validation on action execution

**Documentation:** [docs/tools/next-safe-action.md](./tools/next-safe-action.md)

---

### 4. TypeScript Strict Flags

**What it does:** Enforces strict type checking with:

- `strict`: All strict type-checking options
- `exactOptionalPropertyTypes`: No undefined for optional properties
- `noUncheckedIndexedAccess`: Index access returns undefined
- `isolatedModules`: Each file as separate module
- `moduleResolution: NodeNext`: Modern module resolution

**How to run it:**

```bash
# Type check all projects
pnpm typecheck

# Type check specific project
pnpm typecheck --filter=example

# Watch mode
pnpm typecheck --watch
```

**When it runs automatically:**

- Pre-push git hook (via lefthook)
- Build process
- CI/CD pipelines

**Documentation:**
[docs/tools/typescript-strict.md](./tools/typescript-strict.md)

---

### 5. Security Scanners

**What they do:** Three security scanners run automatically:

1. **OSV-Scanner**: Dependency vulnerability scanning
2. **actionlint**: GitHub Actions workflow linting
3. **zizmor**: GitHub Actions security auditing

**How to run them:**

```bash
# OSV-Scanner (requires Go)
go install github.com/google/osv-scanner/cmd/osv-scanner@latest
osv-scanner -r pnpm-lock.yaml

# actionlint (macOS)
brew install actionlint
actionlint .github/workflows/*.yml

# zizmor (via pip)
pip install zizmor
zizmor --persona auditor .github/workflows
```

**When they run automatically:**

- Every pull request
- Every push to main/master
- Pre-merge checks in CI/CD

**Documentation:**
[docs/tools/security-scanners.md](./tools/security-scanners.md)

---

### 6. publint

**What it does:** Linter for published npm packages. Checks:

- Missing exports
- Missing files
- Incorrect file extensions
- Missing peer dependencies
- Incorrect entry points
- Missing license

**How to run it:**

```bash
# Run against specific package
pnpm publint packages/ui

# Run against all workspace packages
pnpm -r publint

# Verbose output
pnpm publint packages/ui --verbose
```

**When it runs automatically:**

- Pre-publish (via prepublishOnly script)
- Can be added to CI/CD pipelines

**Documentation:** [docs/tools/publint.md](./tools/publint.md)

---

### 7. oxlint

**What it does:** Fast JavaScript/TypeScript linter providing:

- ESLint-compatible rules
- Performance optimizations
- React best practices
- TypeScript type checking
- Import order enforcement

**How to run it:**

```bash
# Lint all files
pnpm lint

# Lint staged files only (pre-commit)
pnpm lint-staged

# Format code
pnpm format

# Check format without changing
pnpm format:check
```

**When it runs automatically:**

- Pre-commit git hook (via lefthook)
- CI/CD pipelines

**Documentation:** See `packages/oxlint-config/` for configuration

---

## Git Hooks Workflow

All tools are integrated into git hooks via lefthook:

### Pre-commit (fast checks)

```yaml
- lint-staged: Lint staged files
- security: Security pattern scanning
- forbidden: Forbidden pattern checking
- docs-drift: Documentation drift detection
```

### Pre-push (slower checks)

```yaml
- typecheck: TypeScript type checking
- test: Unit tests
- knip: Dead code detection
- audit: Dependency auditing
- depcruise: Architectural boundary checks
```

### Commit-msg

```yaml
- commitlint: Conventional commit validation
```

## Development Workflow

### 1. Setup

```bash
# Install dependencies
pnpm install

# Install git hooks
pnpm hooks:install

# Start local Supabase (optional)
pnpm supabase:start
```

### 2. Daily Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Format code
pnpm format
```

### 3. Before Committing

```bash
# Run full workflow check
pnpm workflow

# Or run individual checks
pnpm lint
pnpm typecheck
pnpm test
```

### 4. Before Pushing

Git hooks automatically run:

- Type checking
- Tests
- Knip (dead code)
- Dependency audit
- Dependency cruiser

If any check fails, fix issues before pushing.

## AI-Assisted Development

This template is optimized for AI coding assistants. Key features:

### Skills System

AI agents have access to custom skills in `skills/README.md` that encode:

- Architecture patterns
- Security invariants
- Code quality rules
- Testing strategies
- Documentation standards

### Cursor Rules

AI agents follow rules in `.cursor/rules/` for:

- Server Action patterns
- Architectural boundaries
- Dead code prevention
- Auth invariants
- Testing requirements

### Best Practices for AI Work

1. **Review AI-generated code**: Always review before committing
2. **Run typecheck**: Ensure types are correct
3. **Check imports**: Verify no architectural violations
4. **Test functionality**: AI may miss edge cases
5. **Update documentation**: Keep docs in sync with code

## Code Quality Standards

### File Size Limits

- Maximum 300 lines per file
- Split large files into smaller modules

### Testing Requirements

- TDD required for all features
- RLS tests for all database tables
- Integration tests for critical paths

### Documentation Levels

- Level 1: Code comments (JSDoc)
- Level 2: Module documentation
- Level 3: Architecture guides

### Security Invariants

- Always use `authActionClient` for authenticated actions
- Never import server code into client
- Validate all inputs with Zod
- Use parameterized queries

## Dependency updates (maintainers)

1. **Inventory:** from the repo root, run `pnpm outdated -r` to see all
   workspaces (omit `-r` for root-only).
2. **TypeScript:** prefer the latest **5.9.x** until Next.js, Vitest, and other
   core tools clearly support **6.x** — treat TS 6 as a deliberate migration,
   not a routine bump.
3. **Align versions:** keep **Vitest** on one major across packages that run
   tests; keep **`@turbo/gen`** aligned with **`turbo`** in `packages/ui`; bump
   **`@supabase/supabase-js`** and **`@supabase/ssr`** together when upgrading
   the Supabase stack.
4. **Security:** after changing `package.json` files, run
   `pnpm audit --audit-level=high` (same bar as Lefthook pre-push). Use root
   **`pnpm.overrides`** only for transitive CVEs, with a **CHANGELOG** note.
5. **Verify:** `pnpm install`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
   (example app) before merging.

## Questions?

- Check `docs/README.md` for documentation index
- Review `skills/README.md` for AI agent skills
- See `.cursor/rules/` for Cursor IDE rules
- Read individual tool docs in `docs/tools/`
