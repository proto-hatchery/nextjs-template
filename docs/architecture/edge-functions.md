# ⚡ Edge Functions Architecture

**Edge Functions MUST follow Single Responsibility Principle (SRP) and use the
official template.**

## 🎯 Core Principles

### **1. Single Responsibility Principle (SRP)**

**Each file has ONE responsibility:**

```
supabase/functions/my-function/
├── index.ts          # Request/Response handling ONLY
├── handler.ts        # Business logic ONLY
├── types.ts          # Type definitions ONLY
├── validation.ts     # Input validation ONLY
└── _shared/
    ├── cors.ts       # Shared CORS headers
    └── supabase.ts   # Shared Supabase client
```

**NEVER create giant files:**

```
❌ FORBIDDEN:
supabase/functions/my-function/
└── index.ts          # 500 lines doing everything!
```

---

## 📁 Directory Structure

### **Function Structure (MANDATORY)**

```
supabase/functions/{function-name}/
├── index.ts          # Main entry (thin wrapper)
├── handler.ts        # Business logic
├── types.ts          # Types
├── validation.ts     # Validation
└── _shared/          # Shared utilities
    ├── cors.ts
    ├── supabase.ts
    └── [other shared]
```

### **Shared Structure**

```
supabase/functions/_shared/
├── cors.ts           # CORS headers (shared across all functions)
├── supabase.ts       # Supabase client factory
├── logging.ts        # Logging utilities
└── [other shared]
```

---

## 📝 File Responsibilities

### **index.ts - Request/Response ONLY**

**Responsibility:** Handle HTTP layer ONLY

```typescript
// ✅ CORRECT - Thin wrapper
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleMyFunction } from "./handler.ts"

serve(async (req: Request) => {
  // 1. Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // 2. Parse request
  const request = await req.json()

  // 3. Delegate to handler
  const response = await handleMyFunction(request, req)

  // 4. Return response
  return new Response(JSON.stringify(response))
})
```

**NEVER do in index.ts:**

- ❌ Business logic
- ❌ Database operations
- ❌ Complex validation
- ❌ More than 50 lines

---

### **handler.ts - Business Logic ONLY**

**Responsibility:** Implement business logic

```typescript
// ✅ CORRECT - Business logic only
import { createEdgeClient } from "./_shared/supabase.ts"
import type { MyFunctionRequest, MyFunctionResponse } from "./types.ts"

export async function handleMyFunction(
  request: MyFunctionRequest,
  req: Request
): Promise<MyFunctionResponse> {
  // 1. Create Supabase client
  const supabase = createEdgeClient()

  // 2. Business logic
  const { data, error } = await supabase.from("table").insert(request.data)

  // 3. Return response
  return { success: true, data }
}
```

**NEVER do in handler.ts:**

- ❌ Request parsing
- ❌ Response formatting
- ❌ CORS handling

---

### **types.ts - Type Definitions ONLY**

**Responsibility:** Define request/response types

```typescript
// ✅ CORRECT - Types only
export interface MyFunctionRequest {
  userId: string
  amount: number
}

export interface MyFunctionResponse {
  success: boolean
  data: {
    id: string
    createdAt: string
  }
}
```

---

### **validation.ts - Validation ONLY**

**Responsibility:** Validate input

```typescript
// ✅ CORRECT - Validation only
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const myFunctionSchema = z.object({
  userId: z.uuid(),
  amount: z.number().positive(),
})

export function validateMyFunctionRequest(request: unknown) {
  const result = myFunctionSchema.safeParse(request)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => e.message).join(", "),
    }
  }

  return { success: true, data: result.data }
}
```

---

## 🛠️ Creating Edge Functions

### **MANDATORY: Use Template**

```bash
# ✅ CORRECT - Use template
pnpm edge:new -- my-function

# ❌ FORBIDDEN - Manual creation
mkdir supabase/functions/my-function
touch supabase/functions/my-function/index.ts
```

### **Template Creates:**

```bash
pnpm edge:new -- process-payment

# Creates:
supabase/functions/process-payment/
├── index.ts          ✅ With CORS, logging, error handling
├── handler.ts        ✅ With Supabase client setup
├── types.ts          ✅ With type templates
├── validation.ts     ✅ With Zod validation template
└── _shared/
    ├── cors.ts       ✅ Shared CORS
    └── supabase.ts   ✅ Shared client
```

---

## 📦 Import Patterns

### **Standard Imports**

```typescript
// ✅ CORRECT - Use Deno.land for Supabase
import { createClient } from "https://deno.land/x/supabase@2/mod.ts"

// ✅ CORRECT - Use npm: prefix for logging
import { logEdgeEvent } from "npm:@workspace/logging/edge"

// ✅ CORRECT - Use relative imports for shared
import { createEdgeClient } from "./_shared/supabase.ts"
import { corsHeaders } from "./_shared/cors.ts"

// ❌ FORBIDDEN - Don't use npm for Supabase
import { createClient } from "npm:@supabase/supabase-js"

// ❌ FORBIDDEN - Don't use relative imports for external
import { createClient } from "../../node_modules/@supabase/supabase-js"
```

### **Import Order**

```typescript
// 1. Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 2. External dependencies (npm: prefix)
import { logEdgeEvent } from "npm:@workspace/logging/edge"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// 3. Supabase
import { createClient } from "https://deno.land/x/supabase@2/mod.ts"

// 4. Shared utilities
import { createEdgeClient } from "./_shared/supabase.ts"
import { corsHeaders } from "./_shared/cors.ts"

// 5. Local files
import { handleMyFunction } from "./handler.ts"
import type { MyFunctionRequest } from "./types.ts"
```

---

## 🔒 Security Rules

### **Service Role Key**

```typescript
// ✅ CORRECT - From environment
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// ❌ FORBIDDEN - Hardcoded
const supabase = createClient(
  "https://xyz.supabase.co",
  "eyJhbGciOiJIUzI1NiIs..." // NEVER!
)
```

### **CORS**

```typescript
// ✅ CORRECT - Use shared corsHeaders
import { corsHeaders } from "./_shared/cors.ts"

return new Response(JSON.stringify(data), {
  headers: corsHeaders,
})

// ❌ FORBIDDEN - Inline CORS
return new Response(JSON.stringify(data), {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization",
  },
})
```

---

## 🤖 AI Agent Instructions

### **NEVER Do This**

```typescript
// ❌ NEVER create giant index.ts
// supabase/functions/my-function/index.ts (500 lines)
export async function handleEverything() {
  // Parse request
  // Validate input
  // Business logic
  // Database operations
  // Response formatting
}

// ❌ NEVER create function manually
mkdir supabase/functions/my-function
```

### **ALWAYS Do This**

```typescript
// ✅ ALWAYS use template
pnpm edge:new -- my-function

// ✅ ALWAYS follow SRP
// index.ts - Request/Response only (< 50 lines)
// handler.ts - Business logic only
// types.ts - Types only
// validation.ts - Validation only

// ✅ ALWAYS use _shared/
import { corsHeaders } from "./_shared/cors.ts"
import { createEdgeClient } from "./_shared/supabase.ts"

// ✅ ALWAYS use logEdgeEvent
await logEdgeEvent(req, {
  component: "my-function",
  eventFamily: "edge.request",
  eventName: "my_function_success",
  outcome: "success",
})
```

### **Creation Workflow**

1. **RUN template**: `pnpm edge:new -- my-function`
2. **DEFINE types**: Edit `types.ts`
3. **IMPLEMENT validation**: Edit `validation.ts`
4. **IMPLEMENT logic**: Edit `handler.ts`
5. **TEST**: `pnpm supabase functions:serve my-function`

---

## 📊 File Size Limits

| File            | Max Lines | Responsibility   |
| --------------- | --------- | ---------------- |
| `index.ts`      | 50        | Request/Response |
| `handler.ts`    | 200       | Business logic   |
| `types.ts`      | 100       | Type definitions |
| `validation.ts` | 100       | Validation       |

**If exceeding limit:** Extract to new file in `_shared/`

---

## 🚀 Commands

```bash
# Create new Edge Function (MANDATORY)
pnpm edge:new -- <function-name>

# Serve locally
pnpm supabase functions:serve <function-name>

# Deploy to production
pnpm supabase functions:deploy <function-name>
```

---

## 📋 Checklist

Before deploying Edge Function:

- [ ] Created with `pnpm edge:new --`
- [ ] `index.ts` is thin (< 50 lines)
- [ ] Business logic in `handler.ts`
- [ ] Types defined in `types.ts`
- [ ] Validation in `validation.ts`
- [ ] Uses `_shared/` utilities
- [ ] Uses `logEdgeEvent` for logging
- [ ] No hardcoded credentials
- [ ] CORS headers applied
- [ ] Tested locally with `functions:serve`

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Compliance:** Mandatory  
**Enforcement:** Automated + Human Review
