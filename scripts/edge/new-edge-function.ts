#!/usr/bin/env tsx
/**
 * Edge Function Template Generator
 *
 * This script generates a new Edge Function with proper structure,
 * logging, error handling, and shared utilities already configured.
 *
 * Usage:
 *   pnpm edge:new -- <function-name>
 *
 * Example:
 *   pnpm edge:new -- process-payment
 *
 * Output:
 *   Creates supabase/functions/process-payment/ with:
 *   - index.ts (main entry)
 *   - _shared/ (shared utilities)
 *   - types.ts (function types)
 *   - handler.ts (business logic)
 *   - validation.ts (input validation)
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"

// Parse arguments
const args = process.argv.slice(2)
const [functionName] = args

if (!functionName) {
  console.error("Usage: pnpm edge:new -- <function-name>")
  console.error("Example: pnpm edge:new -- process-payment")
  process.exit(1)
}

// Create function directory
const functionDir = join(process.cwd(), "supabase/functions", functionName)
const sharedDir = join(functionDir, "_shared")

if (!existsSync(functionDir)) {
  mkdirSync(functionDir, { recursive: true })
  mkdirSync(sharedDir, { recursive: true })
  console.log(`✅ Created directory: ${functionDir}`)
}

// Generate index.ts (main entry - thin wrapper)
const indexTemplate = `/**
 * ${functionName} Edge Function
 * 
 * Main entry point - thin wrapper that delegates to handler.
 * Follows Single Responsibility Principle (SRP).
 * 
 * @module supabase/functions/${functionName}
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { logEdgeEvent } from "npm:@workspace/logging/edge"
import { handle${capitalize(functionName)} } from "./handler.ts"
import type { ${capitalize(functionName)}Request, ${capitalize(functionName)}Response } from "./types.ts"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  const startedAt = Date.now()
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  
  try {
    // Parse request
    const request: ${capitalize(functionName)}Request = await req.json()
    
    // Delegate to handler (business logic)
    const response = await handle${capitalize(functionName)}(request, req)
    
    // Log success
    await logEdgeEvent(req, {
      component: "${functionName}",
      eventFamily: "edge.request",
      eventName: "${functionName.replace(/-/g, "_")}_success",
      outcome: "success",
      durationMs: Date.now() - startedAt,
      metadata: {
        // TODO: Add relevant metadata
      },
    })
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    // Log error
    await logEdgeEvent(req, {
      component: "${functionName}",
      eventFamily: "edge.request",
      eventName: "${functionName.replace(/-/g, "_")}_failed",
      outcome: "failure",
      error,
      durationMs: Date.now() - startedAt,
    })
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, "")
}
`

// Generate handler.ts (business logic)
const handlerTemplate = `/**
 * ${functionName} Handler
 * 
 * Business logic for ${functionName} Edge Function.
 * Follows Single Responsibility Principle (SRP).
 * 
 * @module supabase/functions/${functionName}/handler
 */
import { createClient } from "https://deno.land/x/supabase@2/mod.ts"
import type { ${capitalize(functionName)}Request, ${capitalize(functionName)}Response } from "./types.ts"

/**
 * Handle ${functionName} request
 * 
 * @param request - Request data
 * @param req - Original Request object
 * @returns Response data
 */
export async function handle${capitalize(functionName)}(
  request: ${capitalize(functionName)}Request,
  req: Request
): Promise<${capitalize(functionName)}Response> {
  // TODO: Implement business logic
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
  
  // TODO: Your business logic here
  // Example:
  // const { data, error } = await supabase
  //   .from("table")
  //   .insert(request.data)
  
  return {
    // TODO: Return response
    success: true,
    data: {},
  }
}
`

// Generate types.ts (type definitions)
const typesTemplate = `/**
 * ${functionName} Type Definitions
 * 
 * Request and response types for ${functionName} Edge Function.
 * 
 * @module supabase/functions/${functionName}/types
 */

/**
 * Request input for ${functionName}
 */
export interface ${capitalize(functionName)}Request {
  // TODO: Define request fields
  // Example:
  // userId: string
  // amount: number
}

/**
 * Response output for ${functionName}
 */
export interface ${capitalize(functionName)}Response {
  // TODO: Define response fields
  // Example:
  // success: boolean
  // data: {
  //   id: string
  //   createdAt: string
  // }
  success: boolean
  data: unknown
}
`

// Generate validation.ts (input validation)
const validationTemplate = `/**
 * ${functionName} Validation
 * 
 * Input validation for ${functionName} Edge Function.
 * Uses Zod for schema validation.
 * 
 * @module supabase/functions/${functionName}/validation
 */
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"
import type { ${capitalize(functionName)}Request } from "./types.ts"

/**
 * Request schema for ${functionName}
 */
const ${functionName.replace(/-/g, "_")}Schema = z.object({
  // TODO: Define validation schema
  // Example:
  // userId: z.uuid(),
  // amount: z.number().positive(),
})

/**
 * Validate ${functionName} request
 * 
 * @param request - Request to validate
 * @returns Validated request or error
 */
export function validate${capitalize(functionName)}Request(
  request: unknown
): { success: true; data: ${capitalize(functionName)}Request } | { success: false; error: string } {
  const result = ${functionName.replace(/-/g, "_")}Schema.safeParse(request)
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => e.message).join(", "),
    }
  }
  
  return {
    success: true,
    data: result.data,
  }
}
`

// Generate _shared/cors.ts (shared CORS headers)
const corsTemplate = `/**
 * CORS Headers
 * 
 * Shared CORS configuration for all Edge Functions.
 * 
 * @module supabase/functions/_shared/cors
 */

/**
 * Standard CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/**
 * Apply CORS headers to response
 * 
 * @param headers - Existing headers
 * @returns Headers with CORS applied
 */
export function applyCorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    ...corsHeaders,
  }
}
`

// Generate _shared/supabase.ts (shared Supabase client)
const supabaseTemplate = `/**
 * Supabase Client
 * 
 * Shared Supabase client factory for Edge Functions.
 * 
 * @module supabase/functions/_shared/supabase
 */
import { createClient } from "https://deno.land/x/supabase@2/mod.ts"
import type { Database } from "../database.types.ts"

/**
 * Create Supabase client for Edge Function
 * 
 * @returns Typed Supabase client
 */
export function createEdgeClient() {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "edge-function",
        },
      },
    }
  )
}
`

// Write files
writeFileSync(join(functionDir, "index.ts"), indexTemplate)
writeFileSync(join(functionDir, "handler.ts"), handlerTemplate)
writeFileSync(join(functionDir, "types.ts"), typesTemplate)
writeFileSync(join(functionDir, "validation.ts"), validationTemplate)
writeFileSync(join(sharedDir, "cors.ts"), corsTemplate)
writeFileSync(join(sharedDir, "supabase.ts"), supabaseTemplate)

console.log(`✅ Created Edge Function: ${functionName}`)
console.log("")
console.log("📁 Structure:")
console.log(`  ${functionDir}/`)
console.log(`  ├── index.ts          (main entry - thin wrapper)`)
console.log(`  ├── handler.ts        (business logic)`)
console.log(`  ├── types.ts          (type definitions)`)
console.log(`  ├── validation.ts     (input validation)`)
console.log(`  └── _shared/`)
console.log(`      ├── cors.ts       (shared CORS)`)
console.log(`      └── supabase.ts   (shared client)`)
console.log("")
console.log("📝 Next steps:")
console.log("  1. Define types in types.ts")
console.log("  2. Implement validation in validation.ts")
console.log("  3. Implement business logic in handler.ts")
console.log("  4. Test: deno task supabase functions:serve ${functionName}")
console.log("")
console.log("⚠️  IMPORTANT:")
console.log("  - Keep index.ts thin (only request/response handling)")
console.log("  - Put business logic in handler.ts")
console.log("  - Use _shared/ for shared utilities")
console.log("  - Follow Single Responsibility Principle (SRP)")
console.log("  - Always use logEdgeEvent for logging")
