# Boundary Module

Canonical boundary layer for server action result handling. This module provides the complete architecture for:

- **Server-side**: `neverthrow` Result types for internal logic
- **Transport**: Discriminated union `ActionResult` types (JSON-serializable)
- **Client-side**: Zod validation, unwrapping, and React Query integration

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Server-Side   │     │    Transport     │     │   Client-Side   │
│                 │     │                  │     │                 │
│ Result<T,       │────▶│ ActionResult<T>  │────▶│ T (unwrapped)   │
│ AppError>       │     │ {success, data}  │     │ or ActionError  │
│                 │     │ {success, error} │     │                 │
│ neverthrow      │     │ JSON-serializable│     │ Zod validation  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Modules

### `action-result.ts`

Core transport contract. Defines discriminated union types and Zod schemas.

```typescript
import {
  type ActionResult,
  type ActionResultVoid,
  type ActionSuccess,
  type ActionFailure,
  type SerializableActionError,
  validateActionResult,
} from "@workspace/supabase/lib/boundary";
```

### `action-error.ts`

Rich client-side error class for expected failures.

```typescript
import { ActionError, isActionError, getErrorMessage } from "@workspace/supabase/lib/boundary";

try {
  // ...
} catch (error) {
  if (isActionError(error)) {
    console.error(error.code); // Error code
    console.error(error.message); // Human-readable message

    if (error.hasFieldErrors()) {
      const errors = error.getFieldErrors("fieldName");
    }
  }
}
```

### `unwrap-action.ts`

Client-side boundary validation and unwrapping.

```typescript
import { unwrapActionResult, unwrapActionResultVoid } from "@workspace/supabase/lib/boundary";
import { z } from "zod";

const Schema = z.object({ id: z.string() });

// With data
const data = await unwrapActionResult(await action(input), Schema);

// Void operation
unwrapActionResultVoid(await deleteAction(input));
```

### `serialize-result.ts`

Server-side serialization from `Result<T, AppError>` to `ActionResult<T>`.

```typescript
import { serializeResult, serializeResultVoid } from "@workspace/supabase/lib/boundary";

// In server action
const result = await internalLogic();
return serializeResult(result);
```

> **Note**: `deserializeResult` is exported for server-side composition only (server actions calling other server actions). Client code should use `unwrapActionResult`.

### `create-action.ts`

Factory for creating server actions with consistent boundaries.

```typescript
import { createAction } from "@workspace/supabase/lib/boundary/create-action";

const _myAction = createAction<Request, Response>({
  name: "myAction",
  inputSchema: requestSchema,
  handler: async (input, context) => {
    // Return Result<T, AppError>
    return ok({ data: result });
  },
});
```

### `react-query.ts`

React Query integration hooks.

```typescript
import { useActionMutation, useActionMutationVoid } from "@workspace/supabase/lib/boundary";
```

## Usage Patterns

### Server Action Pattern

```typescript
"use server";

import { createAction } from "@workspace/supabase/lib/boundary/create-action";
import {
  serializeResult,
  type SerializedResult,
} from "@workspace/supabase/lib/boundary/serialize-result";
import { ok, err } from "neverthrow";
import { AppError, AppErrorCode } from "@workspace/supabase/lib/errors/app-error";
import { z } from "zod";

const requestSchema = z.object({ name: z.string() });
type Request = z.infer<typeof requestSchema>;
type Response = { id: string };

const _createItem = createAction<Request, Response>({
  name: "createItem",
  inputSchema: requestSchema,
  handler: async (input, { userId, supabase }) => {
    // Internal logic uses neverthrow Result
    const result = await db.insert({ name: input.name, userId });
    if (result.error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create item"));
    }
    return ok({ id: result.data.id });
  },
});

export async function createItemAction(input: Request): Promise<SerializedResult<Response>> {
  const result = await _createItem(input);
  return serializeResult(result);
}
```

### Client Hook Pattern

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createItemAction } from "@workspace/supabase/actions/items/create-item";
import { unwrapActionResult, isActionError } from "@workspace/supabase/lib/boundary";

const ItemSchema = z.object({
  id: z.string(),
});

export function useItemMutations() {
  const create = useMutation({
    mutationFn: async (input: CreateItemInput) => {
      try {
        const data = await unwrapActionResult(await createItemAction(input), ItemSchema);
        return { success: true as const, data };
      } catch (error) {
        if (isActionError(error)) {
          return { success: false as const, error: error.message };
        }
        throw error;
      }
    },
  });

  return { create };
}
```

### Component Usage

```typescript
"use client";

import { useItemMutations } from "./use-item-mutations";

export function ItemForm() {
  const { create } = useItemMutations();

  const handleSubmit = async (input: CreateItemInput) => {
    const result = await create.mutateAsync(input);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Item created: ${result.data.id}`);
  };
}
```

## Error Handling

### Error Types

| Code Pattern   | Description                        | Retryable |
| -------------- | ---------------------------------- | --------- |
| `VALIDATION_*` | Input validation failed            | No        |
| `AUTH_*`       | Authentication/authorization error | No        |
| `NOT_FOUND_*`  | Resource not found                 | No        |
| `CONFLICT_*`   | Resource conflict                  | No        |
| `INFRA_*`      | Infrastructure error               | Yes       |

### Field Errors

For form validation errors:

```typescript
try {
  const data = await unwrapActionResult(await action(input), Schema);
} catch (error) {
  if (isActionError(error) && error.hasFieldErrors()) {
    const emailErrors = error.getFieldErrors("email");
    // ["Invalid email format", "Email already exists"]
  }
}
```

## Migration from Legacy

### Before (deserializeResult)

```typescript
import { deserializeResult } from "@workspace/supabase/lib/boundary/serialize-result";
import { Result } from "neverthrow";

const result: Result<Data, AppError> = deserializeResult(await action(input));

if (result.isOk()) {
  return { success: true, data: result.value };
} else {
  return { success: false, error: result.error.message };
}
```

### After (unwrapActionResult)

```typescript
import { unwrapActionResult, isActionError } from "@workspace/supabase/lib/boundary";
import { z } from "zod";

const Schema = z.object({ ... });

try {
  const data = await unwrapActionResult(await action(input), Schema);
  return { success: true, data };
} catch (error) {
  if (isActionError(error)) {
    return { success: false, error: error.message };
  }
  throw error;
}
```

## References

- [ADR 001: neverthrow Result Types](../../../docs/architecture/decisions/001-neverthrow-result-types.md)
- [ADR 005: Server Actions Serialization](../../../docs/architecture/decisions/005-server-actions-serialization.md)
- [ADR 013: App Consumption of Supabase Boundaries](../../../docs/architecture/decisions/013-app-consumption-of-supabase-boundaries.md)
- [ADR 016: Action Result Boundary Pattern](../../../docs/architecture/decisions/016-action-result-boundary-pattern.md)
