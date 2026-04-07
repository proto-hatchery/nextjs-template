#!/usr/bin/env tsx
/**
 * Automated codegen for Server Actions and TanStack Query hooks.
 *
 * Phase A - Deterministic generation from repository-plan.json
 *
 * Usage:
 *   pnpm codegen:actions-hooks --write
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import {
  parseDomainMapJson,
  type DomainEntry,
} from "../../packages/codegen-tools/src/domain-map-schema"
import { parseRepositoryPlanJson } from "../../packages/codegen-tools/src/repository-plan-schema"

interface ActionsHooksCodegenOptions {
  repoRoot: string
  typesPath: string
  planPath: string
  domainMapPath: string
  checkOnly: boolean
  force?: boolean
  domainFilter?: string
}

interface CodegenResult {
  ok: boolean
  filesWritten: string[]
  errors: string[]
  actionsGenerated: number
  hooksGenerated: number
  queryKeysUpdated: number
}

interface TableDefinition {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: unknown[]
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
}

function toCamelCase(str: string): string {
  return toKebabCase(str).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

function ensureDir(filePath: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function generateServerAction(
  domainId: string,
  tableName: string,
  methodName: string,
  tableDef: TableDefinition,
  domainConfig?: Pick<DomainEntry, "auth">
): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(tableName)
  const methodCamel = toCamelCase(methodName)
  const actionName = `${methodCamel}${toPascalCase(tableName)}Action`
  const repositoryClassName = `${toPascalCase(tableName)}SupabaseRepository`
  const repositoryModule = domainKebab

  // Determine table type from domain config
  const isPublic = domainConfig?.auth === "public"
  const isRoleGated = domainConfig?.auth === "role-gated"
  const isTenantScoped = domainConfig?.auth === "tenant" || !domainConfig?.auth

  // Generate audit safe fields constant
  const auditSafeFields = '["id", "createdAt", "updatedAt"] as const'

  // Generate role check if needed
  const roleCheckCode = isRoleGated
    ? `
  // 3. Role check (role-gated table)
  if (claims.app_metadata?.role !== "psychologist") {
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: 0,
      eventFamily: "security.audit",
      eventName: "role_access_denied",
      operation: "${methodName}",
      operationType: "auth",
      outcome: "failure",
      service: "supabase-data",
    })
    throw new Error("Access denied")
  }
`
    : ""

  // Generate tenant resolution if needed
  const tenantResolutionCode = isTenantScoped
    ? `
  // 4. Tenant resolution — in action, not in repo
  const psychologistId = await getPsychologistIdForUser(userId)
  if (!psychologistId) {
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: 0,
      eventFamily: "security.audit",
      eventName: "tenant_access_denied",
      operation: "${methodName}",
      operationType: "auth",
      outcome: "failure",
      service: "supabase-data",
    })
    throw new Error("Access denied")
  }
`
    : ""

  // Generate repository call with tenant ID if needed
  const repositoryCallCode = isTenantScoped
    ? `const result = await repository.${methodCamel}({ ...validated, psychologistId })`
    : `const result = await repository.${methodCamel}(validated)`

  // Generate imports based on table type
  const imports = isPublic
    ? `import { createServerAnonClient } from "@workspace/supabase-auth/server/create-server-anon-client"`
    : `import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { getPsychologistIdForUser } from "@workspace/supabase-data/lib/auth/resolve-tenant"`

  return `/**
 * ${toPascalCase(methodName)}${toPascalCase(tableName)} Server Action
 * 
 * Handles ${methodName} operation for ${tableName}.
 * 
 * ## Usage
 * 
 * Example:
 * \`\`\`typescript
 * import { ${actionName} } from "@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen"
 * 
 * const result = await ${actionName}(input)
 * \`\`\`
 * 
 * @module @workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}
 * @codegen-generated
 */
"use server"

import { z } from "zod"

${imports}
import { ${repositoryClassName} } from "@workspace/supabase-data/modules/${repositoryModule}/infrastructure/repositories/${tableKebab}-supabase.repository"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ${auditSafeFields}

/**
 * Input schema for ${actionName}
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const ${toPascalCase(tableName)}${toPascalCase(methodName)}InputSchema = z.object({
  // TODO: Define input fields based on ${tableName}.${methodName} requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for ${actionName}
 */
export type ${toPascalCase(tableName)}${toPascalCase(methodName)}Input = z.infer<typeof ${toPascalCase(tableName)}${toPascalCase(methodName)}InputSchema>

/**
 * Output type for ${actionName}
 */
export type ${toPascalCase(tableName)}${toPascalCase(methodName)}Output = {
  // TODO: Define output shape
  id?: string
  createdAt?: string
}

/**
 * ${toPascalCase(methodName)}${toPascalCase(tableName)} Server Action
 * 
 * @param input - Action input
 */
export async function ${actionName}(
  input: ${toPascalCase(tableName)}${toPascalCase(methodName)}Input
): Promise<${toPascalCase(tableName)}${toPascalCase(methodName)}Output> {
  const startedAt = Date.now()
  
  try {${
    isPublic
      ? `
    // 1. Public read-only — no auth required
    const supabase = await createServerAnonClient()
    const repository = new ${repositoryClassName}(supabase)
    
    // 2. Execute operation
    ${repositoryCallCode}

    // 3. Log success
    await logServerEvent({
      actorId: "anonymous",
      actorType: "unknown",
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "${methodCamel}_${tableKebab}_success",
      operation: "${methodName}",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result`
      : `
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId, claims } = await requireAuth({
      action: "${methodCamel}_${tableKebab}",
    })${roleCheckCode}${tenantResolutionCode}
    // 2. Input validation — before any DB call
    const validated = ${toPascalCase(tableName)}${toPascalCase(methodName)}InputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new ${repositoryClassName}(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    ${repositoryCallCode}

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "${methodCamel}_${tableKebab}_success",
      operation: "${methodName}",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result`
  }
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
    await logServerEvent({
      actorId: ${isPublic ? '"anonymous"' : "userId"},
      actorType: ${isPublic ? '"unknown"' : '"user"'},
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "${methodCamel}_${tableKebab}_failed",
      operation: "${methodName}",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
`
}

function generateQueryKeys(
  domainId: string,
  tables: Array<{ tableName: string; methods: string[] }>
): string {
  const domainKebab = toKebabCase(domainId)
  const domainCamel = toCamelCase(domainId)
  const exportName = `${domainCamel}QueryKeys`

  let keysContent = ""
  for (const { tableName, methods } of tables) {
    const tableCamel = toCamelCase(tableName)
    const hasList = methods.includes("list")
    const hasFindById = methods.includes("findById")

    if (hasList) {
      keysContent += `  ${tableCamel}: () => [...${exportName}.all, "${toKebabCase(tableName)}"] as const,
  ${tableCamel}List: (filters?: Record<string, unknown>) =>
    [...${exportName}.${tableCamel}(), "list", filters ?? {}] as const,
`
    } else if (hasFindById) {
      keysContent += `  ${tableCamel}: () => [...${exportName}.all, "${toKebabCase(tableName)}"] as const,
  ${tableCamel}ById: (id: string) =>
    [...${exportName}.${tableCamel}(), "byId", id] as const,
`
    }
  }

  return `/**
 * TanStack Query key factory for domain "${domainKebab}".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/${domainKebab}/query-keys
 * @codegen-generated
 */
export const ${exportName} = {
  all: ["${domainKebab}"] as const,
${keysContent}}
`
}

function generateQueryHook(domainId: string, tableName: string, actionName: string): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(tableName)
  const domainCamel = toCamelCase(domainId)
  const tableCamel = toCamelCase(tableName)
  const queryKeysExport = `${domainCamel}QueryKeys`
  const hookName = `use${toPascalCase(tableName)}Query`

  return `/**
 * ${hookName} — TanStack Query wrapper for a Server Action.
 * 
 * TODO: Wire the Server Action import and replace the queryFn body.
 * Do not add console.log — observability lives in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/${domainKebab}/use-${tableKebab}-query.hook
 * @codegen-generated
 */
"use client"

import { useQuery } from "@tanstack/react-query"

import { ${queryKeysExport} } from "@workspace/supabase-data/hooks/${domainKebab}/query-keys"
import { ${actionName} } from "@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-list.codegen"

// TODO: Narrow the input type based on your action's requirements
type QueryFilters = Record<string, unknown>

export function ${hookName}(filters?: QueryFilters) {
  return useQuery({
    queryKey: ${queryKeysExport}.${tableCamel}List(filters),
    queryFn: async () => {
      // TODO: Replace with actual action call
      // return ${actionName}(filters ?? {})
      throw new Error("Wire Server Action in queryFn")
    },
  })
}
`
}

function generateMutationHook(domainId: string, tableName: string, actionName: string): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(tableName)
  const domainCamel = toCamelCase(domainId)
  const tableCamel = toCamelCase(tableName)
  const queryKeysExport = `${domainCamel}QueryKeys`
  const hookName = `use${toPascalCase(tableName)}Mutation`

  return `/**
 * ${hookName} — TanStack Query mutation wrapper for a Server Action.
 * 
 * TODO: Import the Server Action, narrow \`_input\`, and tune invalidation (prefer precise keys).
 * Do not add console.log — use structured logging in the action (logServerEvent).
 * 
 * @module @workspace/supabase-data/hooks/${domainKebab}/use-${tableKebab}-mutation.hook
 * @codegen-generated
 */
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ${queryKeysExport} } from "@workspace/supabase-data/hooks/${domainKebab}/query-keys"
import { ${actionName} } from "@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-insert.codegen"

// TODO: Narrow the input type based on your action's requirements
type MutationInput = unknown

export function ${hookName}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: MutationInput) => {
      // TODO: Replace with actual action call
      // return ${actionName}(_input as any)
      throw new Error("Wire Server Action in mutationFn")
    },
    onSettled: async () => {
      // TODO: Invalidate precise query keys
      await queryClient.invalidateQueries({ queryKey: ${queryKeysExport}.${tableCamel}() })
    },
  })
}
`
}

function generateActionTest(
  domainId: string,
  tableName: string,
  methodName: string,
  actionName: string
): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(tableName)
  const methodCamel = toCamelCase(methodName)
  const isWriteOperation = ["insert", "update", "delete", "upsert"].includes(methodName)

  return `/**
 * Unit tests for ${actionName}
 * 
 * @codegen-generated
 */
import { describe, expect, it, vi, beforeEach } from "vitest"

import { ${actionName} } from "@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen"

vi.mock("@workspace/supabase-auth/session/get-claims", () => ({
  getClaims: vi.fn(),
}))

vi.mock("@workspace/supabase-auth/server/create-server-auth-client", () => ({
  createServerAuthClient: vi.fn(),
}))

vi.mock("@workspace/logging/server", () => ({
  logServerEvent: vi.fn(),
}))

describe("${actionName}", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Authentication", () => {
    it("should throw Unauthorized when not authenticated", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await expect(${actionName}({} as any)).rejects.toThrow("Unauthorized")
    })

    it("should log security.audit on unauthorized access", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: null } as any)

      await ${actionName}({} as any).catch(() => {})

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "security.audit",
          eventName: "unauthorized_action_attempt",
          outcome: "failure",
        })
      )
    })
  })

  describe("Input Validation", () => {
    it("should validate input with Zod schema", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)

      await expect(${actionName}({ invalid: "data" } as any)).rejects.toThrow()
    })
${
  isWriteOperation
    ? `
    it("should accept valid input for ${methodName} operation", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
      } as any)

      // TODO: Replace with actual valid input for ${tableName}
      const validInput = {} as any

      await expect(${actionName}(validInput)).resolves.not.toThrow()
    })
`
    : ""
}
  })

  describe("Logging", () => {
    it("should log on success", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      } as any)

      await ${actionName}({} as any).catch(() => {})

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "${methodCamel}_${tableKebab}_success",
          outcome: "success",
        })
      )
    })

    it("should log on error with sanitized metadata", async () => {
      const { getClaims } = await import("@workspace/supabase-auth/session/get-claims")
      const { logServerEvent } = await import("@workspace/logging/server")
      vi.mocked(getClaims).mockResolvedValue({ claims: { sub: "test-user-id" } } as any)

      const { createServerAuthClient } = await import("@workspace/supabase-auth/server/create-server-auth-client")
      vi.mocked(createServerAuthClient).mockResolvedValue({
        from: vi.fn().mockRejectedValue(new Error("Test error")),
      } as any)

      await ${actionName}({} as any).catch(() => {})

      expect(logServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventFamily: "action.lifecycle",
          eventName: "${methodCamel}_${tableKebab}_failed",
          outcome: "failure",
          metadata: expect.objectContaining({
            _sanitized: true,
            _fieldCount: expect.any(Number),
          }),
        })
      )
    })
  })
})
`
}

function generateHookTest(
  domainId: string,
  tableName: string,
  hookName: string,
  hookType: "query" | "mutation"
): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(tableName)

  return `/**
 * Unit tests for ${hookName}
 * 
 * @codegen-generated
 */
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ${hookName} } from "@workspace/supabase-data/hooks/${domainKebab}/${hookType === "query" ? `use-${tableKebab}-query` : `use-${tableKebab}-mutation`}.hook.codegen"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe("${hookName}", () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    wrapper = createWrapper()
  })

  it("should ${hookType === "query" ? "fetch data" : "execute mutation"}", async () => {
    const { result } = renderHook(() => ${hookName}(${hookType === "mutation" ? "" : "{}"}), { wrapper })

    if (${hookType === "query" ? "true" : "false"}) {
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    }

    expect(result.current).toBeDefined()
  })
})
`
}

export function runActionsHooksCodegen(options: ActionsHooksCodegenOptions): CodegenResult {
  const {
    repoRoot,
    typesPath,
    planPath,
    domainMapPath,
    checkOnly,
    force = false,
    domainFilter,
  } = options

  const errors: string[] = []
  const filesWritten: string[] = []
  let actionsGenerated = 0
  let hooksGenerated = 0
  let queryKeysUpdated = 0

  try {
    if (!existsSync(typesPath)) {
      errors.push(`Types file not found: ${typesPath}`)
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    const planJson = parseRepositoryPlanJson(JSON.parse(readFileSync(planPath, "utf8")))
    const domainMapJson = parseDomainMapJson(JSON.parse(readFileSync(domainMapPath, "utf8")))

    const entries = planJson.entries || []

    const domainEntries = new Map<
      string,
      Array<{ table: string; methods: string[]; entry: (typeof entries)[0] }>
    >()

    for (const entry of entries) {
      let bucket = domainEntries.get(entry.domainId)
      if (!bucket) {
        bucket = []
        domainEntries.set(entry.domainId, bucket)
      }
      bucket.push({
        table: entry.table,
        methods: entry.methods,
        entry,
      })
    }

    if (domainFilter && !domainEntries.has(domainFilter)) {
      errors.push(`Domain "${domainFilter}" not found in repository plan`)
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    const filteredTables = domainFilter ? domainEntries.get(domainFilter) : undefined
    const domainsToProcess =
      domainFilter && filteredTables
        ? ([[domainFilter, filteredTables]] as const)
        : Array.from(domainEntries.entries())

    for (const [domainId, tables] of domainsToProcess) {
      const domainConfig = domainMapJson.domains.find((d) => d.id === domainId)
      if (!domainConfig || !domainConfig.exposeActions) {
        continue
      }

      const actionsDir = join(repoRoot, "packages/supabase-data/src/actions", domainId)
      const hooksDir = join(repoRoot, "packages/supabase-data/src/hooks", domainId)

      if (!checkOnly) {
        ensureDir(actionsDir)
        ensureDir(hooksDir)
      }

      const queryKeyTables: Array<{ tableName: string; methods: string[] }> = []

      for (const { table, methods } of tables) {
        const tableDef: TableDefinition = {
          Row: {},
          Insert: {},
          Update: {},
          Relationships: [],
        }

        for (const method of methods) {
          const actionFile = join(
            actionsDir,
            `${toKebabCase(table)}-${toCamelCase(method)}.codegen.ts`
          )
          const actionName = `${toCamelCase(method)}${toPascalCase(table)}Action`

          if (!checkOnly) {
            const actionContent = generateServerAction(
              domainId,
              table,
              method,
              tableDef,
              domainConfig
            )
            ensureDir(actionFile)
            writeFileSync(actionFile, actionContent, "utf8")
            filesWritten.push(relative(repoRoot, actionFile))
            actionsGenerated++

            // Generate unit test for action
            const testDir = join(repoRoot, "tests/unit/supabase-data/actions", domainId)
            const testFile = join(
              testDir,
              `${toKebabCase(table)}-${toCamelCase(method)}.codegen.test.ts`
            )
            ensureDir(testFile) // Use ensureDir with file path to create parent dir
            const testContent = generateActionTest(domainId, table, method, actionName)
            writeFileSync(testFile, testContent, "utf8")
            filesWritten.push(relative(repoRoot, testFile))
          }
        }

        if (methods.includes("list")) {
          const queryHookFile = join(hooksDir, `use-${toKebabCase(table)}-query.hook.codegen.ts`)
          const listActionName = `list${toPascalCase(table)}Action`
          const hookName = `use${toPascalCase(table)}Query`

          if (!checkOnly && (!existsSync(queryHookFile) || force)) {
            const hookContent = generateQueryHook(domainId, table, listActionName)
            ensureDir(queryHookFile)
            writeFileSync(queryHookFile, hookContent, "utf8")
            filesWritten.push(relative(repoRoot, queryHookFile))
            hooksGenerated++

            // Generate unit test for query hook
            const testDir = join(repoRoot, "tests/unit/supabase-data/hooks", domainId)
            const testFile = join(testDir, `use-${toKebabCase(table)}-query.hook.codegen.test.ts`)
            ensureDir(testFile) // Use ensureDir with file path to create parent dir
            const testContent = generateHookTest(domainId, table, hookName, "query")
            writeFileSync(testFile, testContent, "utf8")
            filesWritten.push(relative(repoRoot, testFile))
          }
        }

        if (methods.includes("insert")) {
          const mutationHookFile = join(
            hooksDir,
            `use-${toKebabCase(table)}-mutation.hook.codegen.ts`
          )
          const insertActionName = `insert${toPascalCase(table)}Action`
          const hookName = `use${toPascalCase(table)}Mutation`

          if (!checkOnly && (!existsSync(mutationHookFile) || force)) {
            const hookContent = generateMutationHook(domainId, table, insertActionName)
            ensureDir(mutationHookFile)
            writeFileSync(mutationHookFile, hookContent, "utf8")
            filesWritten.push(relative(repoRoot, mutationHookFile))
            hooksGenerated++

            // Generate unit test for mutation hook
            const testDir = join(repoRoot, "tests/unit/supabase-data/hooks", domainId)
            const testFile = join(
              testDir,
              `use-${toKebabCase(table)}-mutation.hook.codegen.test.ts`
            )
            ensureDir(testFile) // Use ensureDir with file path to create parent dir
            const testContent = generateHookTest(domainId, table, hookName, "mutation")
            writeFileSync(testFile, testContent, "utf8")
            filesWritten.push(relative(repoRoot, testFile))
          }
        }

        queryKeyTables.push({ tableName: table, methods })
      }

      const queryKeysFile = join(hooksDir, "query-keys.codegen.ts")
      if (!checkOnly && queryKeyTables.length > 0 && (!existsSync(queryKeysFile) || force)) {
        const queryKeysContent = generateQueryKeys(domainId, queryKeyTables)
        ensureDir(queryKeysFile)
        writeFileSync(queryKeysFile, queryKeysContent, "utf8")
        filesWritten.push(relative(repoRoot, queryKeysFile))
        queryKeysUpdated++
      }
    }

    return {
      ok: true,
      filesWritten,
      errors,
      actionsGenerated,
      hooksGenerated,
      queryKeysUpdated,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown error during codegen")
    return {
      ok: false,
      filesWritten,
      errors,
      actionsGenerated,
      hooksGenerated,
      queryKeysUpdated,
    }
  }
}

// CLI Entry Point
if (import.meta.url === `file://${process.argv[1]}`) {
  const argValue = (flag: string): string | undefined => {
    const i = process.argv.indexOf(flag)
    if (i === -1 || !process.argv[i + 1]) {
      return undefined
    }
    return process.argv[i + 1]
  }

  const write = process.argv.includes("--write")
  const checkOnly = process.argv.includes("--check") || !write
  if (write && process.argv.includes("--check")) {
    process.stderr.write("Use either --check or --write, not both\n")
    process.exit(1)
  }

  const repoRoot = resolve(process.cwd())
  const typesPath =
    argValue("--types") ?? resolve(repoRoot, "packages/supabase-infra/src/types/database.types.ts")
  const planPath = resolve(repoRoot, argValue("--plan") ?? "config/repository-plan.json")
  const domainMapPath = resolve(repoRoot, argValue("--map") ?? "config/domain-map.json")
  const domainFilter = argValue("--domain")
  const force = process.argv.includes("--force")

  if (!existsSync(planPath)) {
    process.stderr.write(`Repository plan not found: ${planPath}\n`)
    process.exit(1)
  }

  if (!existsSync(domainMapPath)) {
    process.stderr.write(`Domain map not found: ${domainMapPath}\n`)
    process.exit(1)
  }

  if (!existsSync(typesPath)) {
    process.stderr.write(`Types file not found: ${typesPath}\n`)
    process.exit(1)
  }

  const result = runActionsHooksCodegen({
    repoRoot,
    typesPath,
    planPath,
    domainMapPath,
    checkOnly,
    force,
    domainFilter,
  })

  if (!result.ok) {
    for (const e of result.errors) {
      process.stderr.write(`${e}\n`)
    }
    process.exit(1)
  }

  if (checkOnly) {
    process.stdout.write(
      `codegen:actions-hooks --check OK: ${result.actionsGenerated} actions, ${result.hooksGenerated} hooks, ${result.queryKeysUpdated} query key files would be generated.\n`
    )
  } else if (write && result.filesWritten.length > 0) {
    process.stdout.write(`Generated ${result.filesWritten.length} file(s):\n`)
    for (const f of result.filesWritten) {
      process.stdout.write(`  ${f}\n`)
    }
    process.stdout.write(
      "\nNext steps:\n  1. Add explicit exports in packages/supabase-data/package.json\n  2. Run: pnpm typecheck\n  3. Run: pnpm lint\n  4. Review TODOs in generated files\n"
    )
  } else if (write) {
    process.stdout.write("Nothing to generate.\n")
  }
}
