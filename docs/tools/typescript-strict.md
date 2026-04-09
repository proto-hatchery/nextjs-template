# TypeScript Strict Flags

## What It Does

TypeScript strict mode enables a set of type-checking flags that enforce
stricter type safety:

- **`strict`**: Enable all strict type-checking options
- **`strictNullChecks`**: Null and undefined are not assignable to any type
- **`strictFunctionTypes`**: Strict checking of function types
- **`strictBindCallApply`**: Strict checking of bind, call, and apply methods
- **`strictPropertyInitialization`**: Class properties must be initialized
- **`noImplicitThis`**: Error on 'this' with implied 'any' type
- **`useUnknownInCatchVariables`**: Catch variables are unknown by default

Additional strict flags in this template:

- **`exactOptionalPropertyTypes`**: Optional properties must match exact type
  (no undefined)
- **`noUncheckedIndexedAccess`**: Index access returns undefined if out of
  bounds
- **`isolatedModules`**: Each file is treated as a separate module
- **`moduleResolution: Bundler`**: Resolution suited for bundled apps (Next.js,
  Vite)

## Why It Matters for AI-Assisted Development

Strict TypeScript is essential when working with AI coding assistants:

1. **Catches AI mistakes**: AI may generate code with type errors; strict mode
   catches them
2. **Better type inference**: Strict types help AI understand your codebase
   better
3. **Prevents runtime errors**: Null checks and strict types prevent common bugs
4. **Self-documenting code**: Types serve as documentation for AI and humans
5. **Consistent patterns**: Enforces consistent patterns across AI-generated
   code

## How to Run It

### Manual Execution

```bash
# Type check all files
pnpm typecheck

# Type check specific project
pnpm typecheck --filter=example

# Type check with watch mode
pnpm typecheck --watch
```

### Automated Execution

TypeScript type checking runs automatically on `git push`:

```yaml
# lefthook.yml
pre-push:
  commands:
    typecheck:
      run: pnpm typecheck || true
```

## Configuration

### Base Configuration

```json
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### Project Configuration

```json
// apps/example/tsconfig.json
{
  "extends": "@workspace/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "global.d.ts",
    "next-env.d.ts",
    "next.config.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## Common Errors and How to Fix Them

### 1. Strict Null Checks

**Error:**

```typescript
// ❌ Error - Object is possibly 'null' or 'undefined'
const length = user.name.length
```

**Fix:**

```typescript
// ✅ Add null check
const length = user.name?.length ?? 0

// ✅ Or use type guard
if (user.name) {
  const length = user.name.length
}
```

### 2. Exact Optional Property Types

**Error:**

```typescript
// ❌ Error - Cannot assign undefined to optional property
interface User {
  name?: string
}

const user: User = { name: undefined } // Error
```

**Fix:**

```typescript
// ✅ Omit the property or provide a value
const user: User = {} // OK
const user2: User = { name: "John" } // OK
```

### 3. No Unchecked Indexed Access

**Error:**

```typescript
// ❌ Error - Element implicitly has 'any' type
const arr = [1, 2, 3]
const value = arr[index] // Type is 'number | undefined'
```

**Fix:**

```typescript
// ✅ Handle undefined case
const arr = [1, 2, 3]
const value = arr[index] ?? 0

// ✅ Or use type guard
if (arr[index] !== undefined) {
  const value = arr[index]
}
```

### 4. Strict Function Types

**Error:**

```typescript
// ❌ Error - Function type compatibility
type Handler = (arg: string) => void
const handler: Handler = (arg: any) => {} // Error
```

**Fix:**

```typescript
// ✅ Use correct types
type Handler = (arg: string) => void
const handler: Handler = (arg: string) => {}
```

## Best Practices for AI-Assisted Development

### 1. Always Define Types Explicitly

```typescript
// ✅ Good - Explicit types help AI understand
interface Task {
  id: string
  title: string
  completed: boolean
}

// ❌ Bad - AI may infer wrong types
type Task = any
```

### 2. Use Type Guards

```typescript
// ✅ Good - Type guards help with strict null checks
function isTask(data: unknown): data is Task {
  return (
    typeof data === "object" && data !== null && "id" in data && "title" in data
  )
}
```

### 3. Avoid Type Assertions

Canonical rules for casts and `// @type-escape:` annotations:
[Type Safety Policy](../standards/type-safety-policy.md).

```typescript
// ❌ Bad - Bypasses type checking
const user = data as User

// ✅ Good - Use type guards or validation
if (isValidUser(data)) {
  const user = data
}
```

### 4. Use Zod for Runtime Validation

```typescript
// ✅ Good - Runtime validation + static types
import { z } from "zod"

const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})

type User = z.infer<typeof userSchema>
```

## Integration with AI Workflow

### When AI Generates Code

1. **Review types**: Ensure AI used correct types
2. **Check for `any`**: Replace any with proper types
3. **Verify null handling**: Ensure null/undefined are handled
4. **Run typecheck**: Always run `pnpm typecheck` after AI changes

### When AI Refactors Code

1. **Type check frequently**: Run typecheck during refactoring
2. **Fix errors immediately**: Don't let type errors accumulate
3. **Update types**: Ensure types match new implementation

## Related Tools

- **Zod** (v4): Runtime type validation
- **Oxlint** (`typescript/*` rules): Linting for TypeScript in this repo
- **ts-prune**: Find unused TypeScript types

## References

- [TypeScript Strict Mode Documentation](https://www.typescriptlang.org/tsconfig/#strict)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
