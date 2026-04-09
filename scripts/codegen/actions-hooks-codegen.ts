#!/usr/bin/env tsx
/**
 * Automated codegen for frontend-consumable actions and hooks.
 *
 * Consumes the semantic plan as the executable SSOT.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import {
  planDtoImportSpecifier,
  planPortImportSpecifier,
  planRepositoryImportSpecifier,
} from "@workspace/codegen-tools/backend-codegen/plan-module-paths"
import { parseDomainMapJson } from "@workspace/codegen-tools/domain-map-schema"
import { parseRepositoryPlanJson } from "@workspace/codegen-tools/repository-plan-schema"

import {
  generateSemanticPlan,
  type ActionSemanticPlan,
  type QueryFrontendContract,
  type SemanticField,
  type SemanticPlanFile,
} from "./actions-semantic-plan"

type QueryActionSemanticPlan = ActionSemanticPlan & { frontendContract: QueryFrontendContract }

interface ActionsHooksCodegenOptions {
  checkOnly: boolean
  domainFilter?: string
  domainMapPath: string
  force?: boolean
  planPath: string
  repoRoot: string
  semanticPlanPath?: string
  typesPath: string
}

interface CodegenResult {
  actionsGenerated: number
  errors: string[]
  filesWritten: string[]
  hooksGenerated: number
  ok: boolean
  queryKeysUpdated: number
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1 || !process.argv[index + 1]) {
    return undefined
  }
  return process.argv[index + 1]
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
}

function toCamelCase(value: string): string {
  return toKebabCase(value).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toPascalCase(value: string): string {
  const camel = toCamelCase(value)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

function ensureDir(filePath: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function renderValidInput(fields: SemanticField[], method: ActionSemanticPlan["method"]): string {
  if (method === "list") {
    return "{}"
  }

  const identifierField = fields.find((field) => field.name !== "data")
  const parts = fields
    .filter((field) => field.required)
    .map((field) => `  ${field.name}: ${field.sample},`)

  if (method === "update" || method === "upsert") {
    const dataField = fields.find((field) => field.name === "data")
    return `{\n  ${identifierField?.name ?? "id"}: ${identifierField?.sample ?? '"00000000-0000-0000-0000-000000000000"'},\n  data: ${dataField?.sample ?? "{}"},\n}`
  }

  if (parts.length === 0) {
    return "{}"
  }

  return `{\n${parts.join("\n")}\n}`
}

function renderActionExecution(plan: ActionSemanticPlan): string {
  const dtoTypeName = `${toPascalCase(plan.table)}DTO`
  const listParamsTypeName = `${toPascalCase(plan.table)}ListParams`
  const idArg = plan.repositoryCall.arguments[0] ?? "validated.id"

  if (plan.method === "delete") {
    return `await repository.delete(${idArg})\n    const result = { success: true } as const`
  }

  if (plan.method === "findById") {
    return `const result = await repository.findById(${idArg})`
  }

  if (plan.method === "list") {
    return `const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as ${listParamsTypeName}
    const result = await repository.list(repositoryInput)`
  }

  if (plan.method === "insert") {
    return `const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<${dtoTypeName}>
    const result = await repository.insert(repositoryInput)`
  }

  if (plan.method === "update" || plan.method === "upsert") {
    return `const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<${dtoTypeName}>
    const result = await repository.${plan.method}(${idArg}, repositoryInput)`
  }

  return `const result = await repository.${plan.repositoryCall.method}(${plan.repositoryCall.arguments.join(", ")})`
}

function renderAuthBlock(plan: ActionSemanticPlan): string {
  if (plan.authPolicy === "public") {
    return 'const actorIdForLog = "anonymous"'
  }

  const requiredRole = plan.authPolicy === "admin" ? ', requiredRole: "admin"' : ""
  return `const { userId } = await requireAuth({ action: "${toCamelCase(plan.method)}_${toKebabCase(plan.table)}"${requiredRole} })
  const actorIdForLog = userId`
}

function renderActorType(plan: ActionSemanticPlan): string {
  return plan.authPolicy === "public" ? '"unknown"' : '"user"'
}

function renderOutputTypeName(plan: ActionSemanticPlan): string {
  return `${toPascalCase(plan.table)}${toPascalCase(plan.method)}Output`
}

function renderInputTypeName(plan: ActionSemanticPlan): string {
  return plan.inputSchema.typeName
}

function renderActionFile(plan: ActionSemanticPlan): string {
  const domainKebab = toKebabCase(plan.domainId)
  const tableKebab = toKebabCase(plan.table)
  const methodCamel = toCamelCase(plan.method)
  const entityPascal = toPascalCase(plan.table)
  const inputTypeName = renderInputTypeName(plan)
  const outputTypeName = renderOutputTypeName(plan)
  const repositoryClassName = `${entityPascal}SupabaseRepository`
  const dtoTypeName = `${entityPascal}DTO`
  const listParamsTypeName = `${entityPascal}ListParams`
  const authImport =
    plan.authPolicy === "public"
      ? ""
      : 'import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"\n'
  const dtoImport =
    plan.outputSchema.returnType.includes(dtoTypeName) ||
    plan.method === "insert" ||
    plan.method === "update"
      ? `import type { ${dtoTypeName} } from "${planDtoImportSpecifier(domainKebab, tableKebab)}"\n`
      : ""
  const listParamsImport =
    plan.method === "list"
      ? `import type { ${listParamsTypeName} } from "${planPortImportSpecifier(domainKebab, tableKebab)}"\n`
      : ""

  return `/**
 * ${plan.actionName}
 *
 * @module ${plan.actionPath}
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

${authImport}import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
${dtoImport}${listParamsImport}import { ${repositoryClassName} } from "${planRepositoryImportSpecifier(domainKebab, tableKebab)}"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ${inputTypeName}Schema = ${plan.inputSchema.zodSchema}

export type ${inputTypeName} = z.infer<typeof ${inputTypeName}Schema>
export type ${outputTypeName} = ${plan.outputSchema.returnType}

export async function ${plan.actionName}(input: ${inputTypeName}): Promise<${outputTypeName}> {
  const startedAt = Date.now()
  ${renderAuthBlock(plan)}

  try {
    const validated = ${inputTypeName}Schema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ${repositoryClassName}(supabase)
    ${renderActionExecution(plan)}

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: ${renderActorType(plan)},
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "${methodCamel}_${tableKebab}_success",
      operation: "${plan.method}",
      operationType: "action",
      outcome: "success",
      metadata: { ${plan.logging.successMetadata.join(", ")} },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: ${renderActorType(plan)},
      component: "${domainKebab}.${tableKebab}.${methodCamel}",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "${methodCamel}_${tableKebab}_failed",
      operation: "${plan.method}",
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

function renderQueryKeyImports(actions: ActionSemanticPlan[]): string {
  const imports = actions
    .filter((action) => action.queryKeyPolicy)
    .map(
      (action) =>
        `import type { ${action.inputSchema.typeName} } from "${action.frontendContract.actionImportPath}"`
    )

  return Array.from(new Set(imports)).join("\n")
}

function renderQueryKeysFile(domainId: string, actions: ActionSemanticPlan[]): string {
  const domainCamel = toCamelCase(domainId)
  const exportName = `${domainCamel}QueryKeys`
  const grouped = new Map<string, ActionSemanticPlan[]>()
  for (const action of actions.filter((candidate) => candidate.queryKeyPolicy)) {
    const bucket = grouped.get(action.table) ?? []
    bucket.push(action)
    grouped.set(action.table, bucket)
  }

  const body = Array.from(grouped.entries())
    .map(([table, tableActions]) => {
      const tableCamel = toCamelCase(table)
      const lines = [
        `  ${tableCamel}: () => [...${exportName}.all, "${toKebabCase(table)}"] as const,`,
      ]

      const listAction = tableActions.find((action) => action.method === "list")
      if (listAction) {
        lines.push(`  ${tableCamel}List: (input?: ${listAction.inputSchema.typeName}) =>
    [...${exportName}.${tableCamel}(), "list", input ?? {}] as const,`)
      }

      const byIdAction = tableActions.find((action) => action.method === "findById")
      if (byIdAction) {
        const byIdParamName = byIdAction.inputSchema.fields[0]?.name ?? "id"
        lines.push(`  ${tableCamel}ById: (input: ${byIdAction.inputSchema.typeName}) =>
    [...${exportName}.${tableCamel}(), "byId", input.${byIdParamName}] as const,`)
      }

      return lines.join("\n")
    })
    .join("\n")

  const importBlock = renderQueryKeyImports(actions)

  return `/**
 * Query key factory for domain "${toKebabCase(domainId)}".
 *
 * codegen:actions-hooks (generated) — do not hand-edit
 */
${importBlock}

export const ${exportName} = {
  all: ["${toKebabCase(domainId)}"] as const,
${body}
}
`
}

function renderQueryHook(plan: QueryActionSemanticPlan): string {
  const domainKebab = toKebabCase(plan.domainId)
  const hookName = plan.frontendContract.hookName
  const queryKeysExport = `${toCamelCase(plan.domainId)}QueryKeys`
  const actionOutputType = renderOutputTypeName(plan)
  const paramsSignature =
    plan.method === "list"
      ? `input?: ${plan.inputSchema.typeName}`
      : `input: ${plan.inputSchema.typeName}, options?: { enabled?: boolean }`
  const queryKeyCall =
    plan.method === "list"
      ? `${queryKeysExport}.${toCamelCase(plan.table)}List(input)`
      : `${queryKeysExport}.${toCamelCase(plan.table)}ById(input)`
  const enabledLine = plan.method === "findById" ? "\n    enabled: options?.enabled ?? true," : ""
  const inputFallback = plan.method === "list" ? "input ?? {}" : "input"

  return `/**
 * ${hookName}
 *
 * @module ${plan.frontendContract.hookImportPath}
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import {
  ${plan.actionName},
  type ${plan.inputSchema.typeName},
  type ${actionOutputType},
} from "${plan.frontendContract.actionImportPath}"
import { ${queryKeysExport} } from "@workspace/supabase-data/hooks/${domainKebab}/query-keys.codegen"

export function ${hookName}(${paramsSignature}): UseQueryResult<${actionOutputType}, Error> {
  return useQuery({
    queryKey: ${queryKeyCall},
    queryFn: async () => ${plan.actionName}(${inputFallback}),${enabledLine}
  })
}
`
}

function renderHookTest(plan: QueryActionSemanticPlan): string {
  const hookName = plan.frontendContract.hookName
  const domainKebab = toKebabCase(plan.domainId)
  const queryKeysExport = `${toCamelCase(plan.domainId)}QueryKeys`
  const byIdField = plan.inputSchema.fields[0]
  const queryKeyAccessor =
    plan.method === "list"
      ? `${queryKeysExport}.${toCamelCase(plan.table)}List({})`
      : plan.method === "findById"
        ? `${queryKeysExport}.${toCamelCase(plan.table)}ById({ ${byIdField?.name ?? "id"}: ${byIdField?.sample ?? '"00000000-0000-0000-0000-000000000000"'} })`
        : `${queryKeysExport}.${toCamelCase(plan.table)}()`

  return `import { beforeEach, describe, expect, it, vi } from "vitest"
import { ${queryKeysExport} } from "@workspace/supabase-data/hooks/${domainKebab}/query-keys.codegen"

describe("${hookName}", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("exports the generated hook", async () => {
    vi.doMock("${plan.frontendContract.actionImportPath}", () => ({
      ${plan.actionName}: vi.fn(async () => undefined),
    }))

    const { ${hookName} } = await import("@workspace/supabase-data/hooks/${domainKebab}/${hookFileBasename(plan)}")
    expect(${hookName}).toBeTypeOf("function")
  })

  it("exposes the expected query key factory", () => {
    expect(${queryKeyAccessor}).toBeDefined()
  })
})
`
}

function hookFileBasename(plan: QueryActionSemanticPlan): string {
  return plan.frontendContract.hookImportPath.split("/").at(-1) ?? "missing-hook"
}

function renderActionTest(plan: ActionSemanticPlan): string {
  const domainKebab = toKebabCase(plan.domainId)
  const tableKebab = toKebabCase(plan.table)
  const methodCamel = toCamelCase(plan.method)
  const repositoryClassName = `${toPascalCase(plan.table)}SupabaseRepository`
  const repositoryImportPath = planRepositoryImportSpecifier(domainKebab, tableKebab)
  const authMock =
    plan.authPolicy === "public"
      ? ""
      : `    vi.doMock("@workspace/supabase-data/lib/auth/require-auth", () => ({
      requireAuth: vi.fn().mockResolvedValue({
        claims: { app_metadata: {}, sub: "test-user-id", user_metadata: {} },
        userId: "test-user-id",
      }),
    }))
`
  const validInput = renderValidInput(plan.inputSchema.fields, plan.method)
  const repoMock =
    plan.method === "list"
      ? `{ list: vi.fn().mockResolvedValue({ rows: [] }) }`
      : plan.method === "findById"
        ? `{ findById: vi.fn().mockResolvedValue({ id: "test-id" }) }`
        : plan.method === "delete"
          ? `{ delete: vi.fn().mockResolvedValue(undefined) }`
          : plan.method === "update" || plan.method === "upsert"
            ? `{ ${plan.method}: vi.fn().mockResolvedValue({ id: "test-id" }) }`
            : `{ insert: vi.fn().mockResolvedValue({ id: "test-id" }) }`

  return `import { beforeEach, describe, expect, it, vi } from "vitest"

describe("${plan.actionName}", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("accepts valid input", async () => {
${authMock}    vi.doMock("@workspace/supabase-auth/server/create-server-auth-client", () => ({
      createServerAuthClient: vi.fn().mockResolvedValue({}),
    }))

    vi.doMock("${repositoryImportPath}", () => ({
      ${repositoryClassName}: class MockGeneratedRepository {
        constructor() {
          return ${repoMock}
        }
      },
    }))

    vi.doMock("@workspace/logging/server", () => ({
      logServerEvent: vi.fn(),
    }))

    const { ${plan.actionName} } = await import("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen")
    await expect(${plan.actionName}(${validInput})).resolves.toBeDefined()
  })
})
`
}

function loadSemanticPlan(options: ActionsHooksCodegenOptions): SemanticPlanFile {
  if (options.semanticPlanPath) {
    return JSON.parse(readFileSync(options.semanticPlanPath, "utf8")) as SemanticPlanFile
  }

  const repositoryPlan = parseRepositoryPlanJson(JSON.parse(readFileSync(options.planPath, "utf8")))
  const domainMap = JSON.parse(readFileSync(options.domainMapPath, "utf8")) as unknown
  const typesSource = readFileSync(options.typesPath, "utf8")
  return generateSemanticPlan(repositoryPlan, domainMap, typesSource)
}

function assertSemanticCompleteness(plan: SemanticPlanFile): string[] {
  const errors: string[] = []
  for (const action of plan.actions) {
    if (action.inputSchema.fields.length === 0 && action.method !== "list") {
      errors.push(`Semantic plan missing input fields for ${action.actionName}`)
    }
    if (/TODO|Wire Server Action/.test(action.inputSchema.zodSchema)) {
      errors.push(`Semantic plan contains placeholder schema for ${action.actionName}`)
    }
    if (/\bunknown\b|TODO/.test(action.outputSchema.returnType)) {
      errors.push(`Semantic plan contains placeholder output for ${action.actionName}`)
    }
  }
  return errors
}

export function runActionsHooksCodegen(options: ActionsHooksCodegenOptions): CodegenResult {
  const {
    checkOnly,
    domainFilter,
    domainMapPath,
    planPath,
    repoRoot,
    semanticPlanPath,
    typesPath,
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

    if (!existsSync(planPath)) {
      errors.push(`Repository plan not found: ${planPath}`)
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    if (!existsSync(domainMapPath)) {
      errors.push(`Domain map not found: ${domainMapPath}`)
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    const semanticPlan = loadSemanticPlan({
      checkOnly,
      domainFilter,
      domainMapPath,
      planPath,
      repoRoot,
      semanticPlanPath,
      typesPath,
    })
    errors.push(...assertSemanticCompleteness(semanticPlan))

    if (errors.length > 0) {
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    const domainMap = parseDomainMapJson(JSON.parse(readFileSync(domainMapPath, "utf8")))
    const actionsByDomain = new Map<string, ActionSemanticPlan[]>()

    for (const action of semanticPlan.actions) {
      if (domainFilter && action.domainId !== domainFilter) {
        continue
      }
      const domain = domainMap.domains.find((entry) => entry.id === action.domainId)
      if (!domain || domain.codegen === false || domain.exposeActions === false) {
        continue
      }

      let bucket = actionsByDomain.get(action.domainId)
      if (!bucket) {
        bucket = []
        actionsByDomain.set(action.domainId, bucket)
      }
      bucket.push(action)
    }

    if (domainFilter && !actionsByDomain.has(domainFilter)) {
      errors.push(`Domain "${domainFilter}" not found in semantic plan`)
      return { ok: false, filesWritten, errors, actionsGenerated, hooksGenerated, queryKeysUpdated }
    }

    for (const [domainId, actions] of actionsByDomain.entries()) {
      const domainActionsDir = join(repoRoot, "packages/supabase-data/src/actions", domainId)
      const domainHooksDir = join(repoRoot, "packages/supabase-data/src/hooks", domainId)
      const queryKeyFile = join(domainHooksDir, "query-keys.codegen.ts")

      if (!checkOnly) {
        mkdirSync(domainActionsDir, { recursive: true })
        mkdirSync(domainHooksDir, { recursive: true })
      }

      const queryActions = actions.filter((action) => action.queryKeyPolicy)
      if (!checkOnly && queryActions.length > 0) {
        const queryKeysContent = renderQueryKeysFile(domainId, queryActions)
        ensureDir(queryKeyFile)
        writeFileSync(queryKeyFile, queryKeysContent, "utf8")
        filesWritten.push(relative(repoRoot, queryKeyFile))
        queryKeysUpdated += 1
      }

      for (const action of actions) {
        const actionFile = join(
          domainActionsDir,
          `${toKebabCase(action.table)}-${toCamelCase(action.method)}.codegen.ts`
        )
        const actionTestFile = join(
          repoRoot,
          "tests/unit/supabase-data/actions",
          domainId,
          `${toKebabCase(action.table)}-${toCamelCase(action.method)}.codegen.test.ts`
        )

        if (!checkOnly) {
          writeFileSync(actionFile, renderActionFile(action), "utf8")
          ensureDir(actionTestFile)
          writeFileSync(actionTestFile, renderActionTest(action), "utf8")
          filesWritten.push(relative(repoRoot, actionFile), relative(repoRoot, actionTestFile))
        }
        actionsGenerated += 1

        if (action.kind !== "query") {
          continue
        }

        const queryAction = action as QueryActionSemanticPlan
        const hookFile = join(domainHooksDir, `${hookFileBasename(queryAction)}.ts`)
        const hookTestFile = join(
          repoRoot,
          "tests/unit/supabase-data/hooks",
          domainId,
          `${hookFileBasename(queryAction)}.test.ts`
        )

        if (!checkOnly) {
          const hookContent = renderQueryHook(queryAction)
          writeFileSync(hookFile, hookContent, "utf8")
          ensureDir(hookTestFile)
          writeFileSync(hookTestFile, renderHookTest(queryAction), "utf8")
          filesWritten.push(relative(repoRoot, hookFile), relative(repoRoot, hookTestFile))
        }
        hooksGenerated += 1
      }
    }

    return {
      actionsGenerated,
      errors,
      filesWritten,
      hooksGenerated,
      ok: errors.length === 0,
      queryKeysUpdated,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown error during codegen")
    return {
      actionsGenerated,
      errors,
      filesWritten,
      hooksGenerated,
      ok: false,
      queryKeysUpdated,
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write")
  const checkOnly = process.argv.includes("--check") || !write
  const repoRoot = resolve(process.cwd())
  const result = runActionsHooksCodegen({
    checkOnly,
    domainFilter: argValue("--domain"),
    domainMapPath: resolve(repoRoot, argValue("--map") ?? "config/domain-map.json"),
    force: process.argv.includes("--force"),
    planPath: resolve(repoRoot, argValue("--plan") ?? "config/repository-plan.json"),
    repoRoot,
    semanticPlanPath: argValue("--semantic-plan")
      ? resolve(repoRoot, argValue("--semantic-plan") as string)
      : undefined,
    typesPath: resolve(
      repoRoot,
      argValue("--types") ?? "packages/supabase-infra/src/types/database.types.ts"
    ),
  })

  if (!result.ok) {
    for (const error of result.errors) {
      process.stderr.write(`${error}\n`)
    }
    process.exit(1)
  }

  if (checkOnly) {
    process.stdout.write(
      `codegen:actions-hooks --check OK: ${result.actionsGenerated} actions, ${result.hooksGenerated} hooks, ${result.queryKeysUpdated} query key files would be generated.\n`
    )
  } else {
    process.stdout.write(`Generated ${result.filesWritten.length} file(s).\n`)
  }
}

export {
  renderActionFile,
  renderHookTest,
  renderQueryHook,
  renderQueryKeysFile,
}
