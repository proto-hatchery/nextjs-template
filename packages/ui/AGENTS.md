# @workspace/ui - shadcn/ui Components Package

> **Human-readable summary (Portuguese):** [README.md](./README.md) — **do not
> hand-edit this package;** shared product UI belongs in **`@workspace/brand`**
> (`packages/brand`).

## ⚠️ CRITICAL: This Package is READ-ONLY

**This package contains shadcn/ui components that are AUTO-GENERATED and MUST
NEVER be manually modified for product logic.**

**Hand-written shared UI (compositions, brand-specific blocks used across apps)
belongs in `@workspace/brand`, not here.**

## What Lives Here

This package contains ONLY:

- ✅ shadcn/ui base components (installed via `pnpm dlx shadcn@latest add`)
- ✅ shadcn/ui hooks (auto-generated with components)
- ✅ Utility functions (utils, lib)
- ✅ Configuration files (components.json, tailwind setup)

## Testing

**No package-level unit tests.** shadcn primitives are CLI-managed; upstream
covers behaviour. Add tests for **composed** UI in `@workspace/brand` and for
app-specific components under `tests/unit/web/` (or e2e).

## What NEVER Lives Here

- ❌ Custom business logic components
- ❌ App-specific wrappers
- ❌ Domain-specific components (e.g., UserCard, ProductForm)
- ❌ Customized versions of shadcn components
- ❌ Any manual modifications to shadcn components
- ❌ **Cross-app product UI** — put those in **`packages/brand`**
  (`@workspace/brand`) instead

## Rules

### 1. Never Edit shadcn Components

**All component files in `src/components/` are managed by shadcn CLI:**

```bash
# ✅ CORRECT - Update via CLI
pnpm dlx shadcn@latest add button --overwrite

# ❌ WRONG - Manual editing
# Opening src/components/button.tsx and changing the code
```

### 2. Never Add Custom Components Here

**Custom components belong in the apps:**

```
apps/
└── admin/
    └── components/
        ├── custom-button.tsx    # ✅ Your wrappers
        ├── submit-button.tsx    # ✅ Extended components
        └── user-card.tsx        # ✅ Business components
```

### 3. How to Customize

When you need a customized component, create it in your app:

```tsx
// apps/example/app/adm/_components/custom-input.tsx
import { Input as ShadcnInput } from "@workspace/ui/components/input"

export function CustomInput({ error, ...props }) {
  return (
    <div>
      <ShadcnInput className={error ? "border-red-500" : ""} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

## Component Installation

To add new components to this package:

```bash
cd packages/ui
pnpm dlx shadcn@latest add <component-name>
```

This will:

- Download the component from shadcn registry
- Place it in `src/components/`
- Install any required dependencies
- Update configuration if needed

## Why This Matters

1. **Consistency**: All apps use identical base components
2. **Upgradability**: Can update shadcn components without merge conflicts
3. **Maintainability**: Clear separation between base and custom code
4. **Team Collaboration**: Everyone knows where to find/add components

## File Structure

```
packages/ui/
├── src/
│   ├── components/        # shadcn components (READ-ONLY)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── hooks/            # shadcn hooks (READ-ONLY)
│   │   └── use-mobile.ts
│   ├── lib/              # Utilities
│   │   └── utils.ts
│   └── styles/           # Global styles
│       └── globals.css
├── components.json       # shadcn configuration
├── package.json
├── README.md             # Human-facing “do not edit” (Portuguese)
└── AGENTS.md             # This file
```

## Questions?

- **Need a new component?** → Run `pnpm dlx shadcn@latest add <name>`
- **Need to customize?** → Create wrapper in your app
- **Need business logic?** → Create component in your app
- **Need shared UI across several apps?** → **`packages/brand`**
  (`@workspace/brand`) — see [README.md](./README.md) and
  [packages/brand/README.md](../brand/README.md)
- **Component has bug?** → Report to shadcn, don't patch locally
