# Next.js + Supabase + Tailwind CSS Template

**Enterprise-grade monorepo template for AI-assisted development.**

## 🤖 For AI Agents

**⚠️ CRITICAL: Read These First (Non-Negotiable)**

- **[CRITICAL ARCHITECTURE RULES](./docs/architecture/CRITICAL-RULES.md)** — 5
  rules that WILL GET YOUR PR REJECTED if violated
- **[AGENTS.md](./AGENTS.md)** - Main instructions for all AI agents
- **[Golden Rules](./docs/standards/rules/README.md)** - Non-negotiable rules
- **[Skills](./skills/README.md)** - AI agent skills (17 available)

**Common Mistakes That Get Rejected:**

1. ❌ Creating actions in `apps/` → MUST be in
   `packages/supabase-data/src/actions/`
2. ❌ Using `.schema()` → MUST use `.inputSchema()` (v8)
3. ❌ Missing `()` on validators → `z.uuid()` not `.uuid`
4. ❌ Server imports in client components → Use Server Actions
5. ❌ Barrel exports → Explicit imports only (GR-001)

**See:**
[`docs/architecture/CRITICAL-RULES.md`](./docs/architecture/CRITICAL-RULES.md)
for complete list with examples.

## 📚 Documentation

**Architecture:**

- [Testing Strategy](./docs/architecture/testing.md)
- [Edge Functions](./docs/architecture/edge-functions.md)
- [Logging](./docs/architecture/logging.md)
- [Auth](./docs/architecture/auth.md)

**Standards:**

- [Golden Rules](./docs/standards/rules/README.md) - GR-001 to GR-021
- [Package file suffixes](./docs/standards/package-file-suffixes.md) —
  `*.component.tsx` / `*.hook.*` / `*.provider.tsx` in composition packages
  (`brand`, `core`, `forms`, `seo`); not `apps/`; not `packages/ui`
- [JSDoc Style Guide](./docs/standards/jsdoc-style-guide.md)
- [Test File Location](./docs/standards/rules/test-file-location.md)

**Guides:**

- [Supabase Setup](./docs/guides/supabase-setup.md)
- [Migration Workflow](./docs/guides/migration-workflow.md)
- [Security](./docs/guides/security.md)

## 🛠️ Quick Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm workflow               # lint → typecheck → build → format

# Testing
pnpm test                   # Unit tests
pnpm test:rls               # RLS tests (mandatory for schema changes)
pnpm test:all               # All tests

# Creation (use templates)
pnpm action:new -- <module> <name>     # Server Action
pnpm edge:new -- <name>                # Edge Function
pnpm supabase:migration:new -- <name>  # Migration

# AI Skills
pnpm skills:update          # Update all skills from docs
pnpm skills:validate        # Validate skills
```

## 📁 Structure

```
nextjs-template/
├── apps/
│   └── example/             # Main Next.js 16 app
├── packages/
│   ├── supabase-infra/      # Types, clients, env
│   ├── supabase-auth/       # Auth, session, guards
│   ├── supabase-data/       # Repositories, actions, hooks
│   ├── ui/                  # shadcn/ui (CLI-only)
│   ├── brand/               # Custom UI
│   └── logging/             # Structured logging
├── tests/                   # ALL tests live here
├── docs/                    # Level 1 docs
├── scripts/                 # Automation scripts
└── skills/                  # AI agent skills
```

## 🎯 Golden Rules

**GR-001:** Zero-Barrel Policy - Explicit subpath imports only  
**GR-004:** Auth Invariants - getClaims() primary, getUser() secondary  
**GR-005:** No Console Logging - Use structured logging  
**GR-007:** Edge Function Template - Always use template  
**GR-010:** Test File Location - All tests in /tests  
**GR-015:** CLI Migrations Only - Never manual  
**GR-017:** Server Actions Boundary - ActionResult<T>  
**GR-021:** JSDoc Required - All exports documented

**See [Golden Rules](./docs/standards/rules/README.md) for all 21 rules.**

## 🤖 AI Agent Instructions

**When working with this codebase:**

1. **READ** [AGENTS.md](./AGENTS.md) first
2. **USE** skills when available (auto-trigger or manual)
3. **FOLLOW** Golden Rules strictly
4. **LOG** with structured logging (never console)
5. **TEST** in /tests directory (mirror structure)
6. **DOCUMENT** with JSDoc (all exports)

**Skills auto-trigger for:**

- Server Actions → server-action-template
- Tests → test-location-guide + test-generator
- Logging → logging-required
- Auth → auth-invariants
- Edge Functions → edge-function-template
- Repositories → repository-pattern
- Migrations → migration-workflow
- RLS Tests → rls-test-generator
- Documentation → three-level-docs + doc-template

---

**Template Version:** 0.1.0  
**Last Updated:** 2026-04-04  
**For:** AI-assisted development (Cursor, Claude, Copilot, Gemini)
