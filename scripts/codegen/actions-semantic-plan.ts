#!/usr/bin/env tsx
/**
 * Phase 0: Semantic Plan Generation
 *
 * Builds a deterministic, frontend-consumable semantic plan from:
 * - repository-plan.json
 * - domain-map.json
 * - database.types.ts
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { parseDomainMapJson, type DomainEntry } from "@workspace/codegen-tools/domain-map-schema"
import {
  extractTableShapes,
  type ExtractedField,
} from "@workspace/codegen-tools/extract-table-shapes"
import {
  parseRepositoryPlanJson,
  type RepositoryPlanEntry,
  type RepositoryPlanFile,
} from "@workspace/codegen-tools/repository-plan-schema"

const repoRoot = resolve(process.cwd())

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1 || !process.argv[index + 1]) {
    return undefined
  }
  return process.argv[index + 1]
}

type CrudMethod = RepositoryPlanEntry["methods"][number]
type ActionKind = "query" | "mutation"
type AuthPolicy = "public" | "session" | "admin"

interface SemanticField {
  description?: string
  name: string
  required: boolean
  sample: string
  type: string
  validation: string[]
  zodSchema: string
}

interface QueryFrontendContract {
  actionImportPath: string
  hookImportPath: string
  hookKind: "query"
  hookName: string
  queryKeyFactory: string
}

interface MutationFrontendContract {
  actionImportPath: string
}

interface ActionSemanticPlan {
  actionName: string
  actionPath: string
  authPolicy: AuthPolicy
  cacheInvalidation: {
    invalidateKeys: string[]
    optimisticUpdate: boolean
  }
  domainId: string
  frontendContract: QueryFrontendContract | MutationFrontendContract
  inputSchema: {
    fields: SemanticField[]
    typeName: string
    zodSchema: string
  }
  kind: ActionKind
  logging: {
    errorMetadata: string[]
    successMetadata: string[]
  }
  method: CrudMethod
  notes?: string[]
  outputSchema: {
    fields: Array<{ name: string; source: "computed" | "relation" | "row"; type: string }>
    returnType: string
  }
  queryKeyPolicy?: {
    accessor: string
    paramsTypeName?: string
    scope: "all" | "byId" | "list"
  }
  repositoryCall: {
    arguments: string[]
    method: CrudMethod
  }
  table: string
  tenantScoping: boolean
}

interface SemanticPlanFile {
  actions: ActionSemanticPlan[]
  generatedAt: string
  meta: {
    confidence: "high" | "low" | "medium"
    generator: string
    modelUsed?: string
    requiresHumanReview: boolean
  }
  version: number
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

function stripUndefinedAndNull(typeText: string): string {
  return typeText
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part !== "undefined" && part !== "null")
    .join(" | ")
}

function isUuidField(name: string): boolean {
  return name === "id" || name.endsWith("_id") || name.endsWith("Id")
}

function toDtoFieldName(columnName: string): string {
  return toCamelCase(columnName)
}

function mapPrimitiveType(
  typeText: string,
  fieldName: string
): { type: string; zodSchema: string } {
  const normalized = stripUndefinedAndNull(typeText)
  const looseCellSchema = "z.union([z.string(), z.number(), z.boolean(), z.null()])"
  const looseCellType = "string | number | boolean | null"

  if (/^".*"( \| ".*")+$/.test(normalized) || /^".*"$/.test(normalized)) {
    const variants = normalized
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
    return {
      type: variants.join(" | "),
      zodSchema: `z.enum([${variants.join(", ")}])`,
    }
  }

  if (normalized === "string") {
    return {
      type: "string",
      zodSchema: isUuidField(fieldName) ? 'z.uuid({ error: "Invalid UUID" })' : "z.string()",
    }
  }

  if (normalized === "number") {
    return { type: "number", zodSchema: "z.number()" }
  }

  if (normalized === "boolean") {
    return { type: "boolean", zodSchema: "z.boolean()" }
  }

  if (normalized === "Json") {
    return { type: looseCellType, zodSchema: looseCellSchema }
  }

  if (normalized.endsWith("[]")) {
    const item = mapPrimitiveType(normalized.slice(0, -2), fieldName)
    return {
      type: `${item.type}[]`,
      zodSchema: `z.array(${item.zodSchema})`,
    }
  }

  return { type: looseCellType, zodSchema: looseCellSchema }
}

function toSemanticField(
  field: ExtractedField,
  options?: { forceOptional?: boolean }
): SemanticField {
  const dtoFieldName = toDtoFieldName(field.name)
  const primitive = mapPrimitiveType(field.typeText, field.name)
  const required = options?.forceOptional ? false : !field.isOptional
  const nullableSchema = field.isNullable
    ? `${primitive.zodSchema}.nullable()`
    : primitive.zodSchema
  const zodSchema = required ? nullableSchema : `${nullableSchema}.optional()`

  return {
    description: `Generated from database field "${field.name}"`,
    name: dtoFieldName,
    required,
    sample: sampleValueForField(dtoFieldName, primitive.type),
    type: field.isNullable ? `${primitive.type} | null` : primitive.type,
    validation: collectValidationHints(field.name, primitive.type, field.isNullable, required),
    zodSchema,
  }
}

function sampleValueForField(fieldName: string, fieldType: string): string {
  if (fieldType === "string" || fieldType.includes("string")) {
    return isUuidField(fieldName)
      ? '"00000000-0000-0000-0000-000000000000"'
      : `"sample-${toKebabCase(fieldName)}"`
  }
  if (fieldType === "number") {
    return "1"
  }
  if (fieldType === "boolean") {
    return "true"
  }
  if (fieldType.endsWith("[]")) {
    return "[]"
  }
  if (fieldType.includes("number")) {
    return "1"
  }
  if (fieldType.includes("boolean")) {
    return "true"
  }
  if (fieldType.includes("null")) {
    return "null"
  }
  return `"sample-${toKebabCase(fieldName)}"`
}

function collectValidationHints(
  fieldName: string,
  fieldType: string,
  isNullable: boolean,
  required: boolean
): string[] {
  const hints: string[] = []
  if (fieldType === "string" && isUuidField(fieldName)) {
    hints.push("uuid")
  }
  if (fieldType === "number") {
    hints.push("number")
  }
  if (fieldType === "boolean") {
    hints.push("boolean")
  }
  if (isNullable) {
    hints.push("nullable")
  }
  hints.push(required ? "required" : "optional")
  return hints
}

function renderZodObject(fields: SemanticField[]): string {
  if (fields.length === 0) {
    return "z.object({})"
  }

  const body = fields.map((field) => `  ${field.name}: ${field.zodSchema},`).join("\n")
  return `z.object({\n${body}\n})`
}

function inferAuthPolicy(domain: DomainEntry): AuthPolicy {
  if (domain.auth === "public") {
    return "public"
  }
  if (domain.auth === "admin") {
    return "admin"
  }
  return "session"
}

function inferTenantScoping(entry: RepositoryPlanEntry, fields: ExtractedField[]): boolean {
  const fieldNames = new Set(fields.map((field) => field.name))

  if (
    fieldNames.has("psychologist_id") ||
    fieldNames.has("psychologist_client_id") ||
    fieldNames.has("psychologist_patient_id")
  ) {
    return true
  }

  return entry.table.includes("psychologist") || entry.table.includes("patient")
}

function inferActionKind(method: CrudMethod): ActionKind {
  return method === "list" || method === "findById" ? "query" : "mutation"
}

function defaultAuditFields(entry: RepositoryPlanEntry): string[] {
  return entry.auditSafeFields && entry.auditSafeFields.length > 0
    ? entry.auditSafeFields.map(toDtoFieldName)
    : ["id", "createdAt", "updatedAt"]
}

function queryKeyFactoryName(table: string, method: CrudMethod): string {
  const tableCamel = toCamelCase(table)
  if (method === "findById") {
    return `${tableCamel}ById`
  }
  if (method === "list") {
    return `${tableCamel}List`
  }
  return tableCamel
}

function hookNameFor(table: string, method: "list" | "findById"): string {
  const tablePascal = toPascalCase(table)
  if (method === "list") {
    return `use${tablePascal}Query`
  }
  return `use${tablePascal}ByIdQuery`
}

function hookFileNameFor(table: string, method: "list" | "findById"): string {
  if (method === "list") {
    return `use-${toKebabCase(table)}-query.hook.codegen`
  }
  return `use-${toKebabCase(table)}-by-id-query.hook.codegen`
}

function inferListFields(entry: RepositoryPlanEntry, rowFields: ExtractedField[]): SemanticField[] {
  const filters = (entry.list?.filterFields ?? []).map((fieldName) => {
    const rowField = rowFields.find((candidate) => candidate.name === fieldName)
    return toSemanticField(
      rowField ?? {
        isNullable: false,
        isOptional: true,
        name: fieldName,
        typeText: "string",
      },
      { forceOptional: true }
    )
  })

  return [
    ...filters,
    {
      description: "Pagination limit",
      name: "limit",
      required: false,
      sample: "20",
      type: "number",
      validation: ["number", "optional"],
      zodSchema: `z.number().int().positive().max(${entry.list?.maxPageSize ?? 100}).optional()`,
    },
    {
      description: "Pagination offset",
      name: "offset",
      required: false,
      sample: "0",
      type: "number",
      validation: ["number", "optional"],
      zodSchema: "z.number().int().nonnegative().optional()",
    },
  ]
}

function nonSystemField(field: ExtractedField): boolean {
  if (field.name === "id") {
    return false
  }
  return !["created_at", "updated_at", "deleted_at"].includes(field.name)
}

function inferInputFields(
  entry: RepositoryPlanEntry,
  method: CrudMethod,
  shapes: ReturnType<typeof extractTableShapes>
) {
  const idColumn = entry.idColumn ?? "id"
  const rawIdField = shapes.row.find((field) => field.name === idColumn) ?? {
    isNullable: false,
    isOptional: false,
    name: idColumn,
    typeText: "string",
  }
  const rowIdField = {
    ...rawIdField,
    isNullable: false,
    isOptional: false,
    typeText: "string",
  }

  if (method === "findById" || method === "delete") {
    return [toSemanticField(rowIdField)]
  }

  if (method === "list") {
    return inferListFields(entry, shapes.row)
  }

  if (method === "insert") {
    return shapes.insert.filter(nonSystemField).map((field) => toSemanticField(field))
  }

  if (method === "update" || method === "upsert") {
    const updateFields = shapes.update
      .filter((field) => field.name !== idColumn)
      .filter(nonSystemField)
      .map((field) => toSemanticField(field, { forceOptional: true }))

    return [
      toSemanticField(rowIdField),
      {
        description: "Partial DTO payload",
        name: "data",
        required: true,
        sample: renderObjectSample(updateFields),
        type: `{ ${updateFields.map((field) => `${field.name}?: ${field.type}`).join("; ")} }`,
        validation: ["required"],
        zodSchema: `${renderZodObject(updateFields)}.refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" })`,
      },
    ]
  }

  return []
}

function renderObjectSample(fields: SemanticField[]): string {
  const firstRequired = fields.find((field) => field.required) ?? fields[0]
  if (!firstRequired) {
    return "{}"
  }
  return `{ ${firstRequired.name}: ${firstRequired.sample} }`
}

function inferOutputType(
  entry: RepositoryPlanEntry,
  method: CrudMethod
): ActionSemanticPlan["outputSchema"] {
  const dtoType = `${toPascalCase(entry.table)}DTO`
  if (method === "list") {
    return {
      fields: [{ name: "rows", source: "row", type: `${dtoType}[]` }],
      returnType: `{ rows: ${dtoType}[] }`,
    }
  }
  if (method === "findById") {
    return {
      fields: [{ name: "entity", source: "row", type: `${dtoType} | null` }],
      returnType: `${dtoType} | null`,
    }
  }
  if (method === "delete") {
    return {
      fields: [{ name: "success", source: "computed", type: "true" }],
      returnType: "{ success: true }",
    }
  }
  return {
    fields: [{ name: "entity", source: "row", type: dtoType }],
    returnType: dtoType,
  }
}

function inferIdFieldName(entry: RepositoryPlanEntry): string {
  return toDtoFieldName(entry.idColumn ?? "id")
}

function inferRepositoryArguments(entry: RepositoryPlanEntry, method: CrudMethod): string[] {
  const idFieldName = inferIdFieldName(entry)

  if (method === "findById" || method === "delete") {
    return [`validated.${idFieldName}`]
  }
  if (method === "list" || method === "insert") {
    return ["validated"]
  }
  if (method === "update" || method === "upsert") {
    return [`validated.${idFieldName}`, "validated.data"]
  }
  return []
}

function inferLoggingMetadata(
  entry: RepositoryPlanEntry,
  method: CrudMethod
): ActionSemanticPlan["logging"] {
  const idFieldName = inferIdFieldName(entry)

  if (method === "list") {
    return {
      errorMetadata: ["input"],
      successMetadata: ["rowCount: result.rows.length"],
    }
  }
  if (method === "delete") {
    return {
      errorMetadata: ["input"],
      successMetadata: [`id: validated.${idFieldName}`],
    }
  }
  if (method === "insert") {
    return {
      errorMetadata: ["input"],
      successMetadata: ["id: (result as { id?: string | number | boolean | null }).id ?? null"],
    }
  }
  if (method === "update" || method === "upsert") {
    return {
      errorMetadata: ["input"],
      successMetadata: [
        `id: (result as { id?: string | number | boolean | null }).id ?? validated.${idFieldName}`,
      ],
    }
  }
  return {
    errorMetadata: ["input"],
    successMetadata: [`id: validated.${idFieldName}`],
  }
}

function inferCacheInvalidation(entry: RepositoryPlanEntry, method: CrudMethod) {
  const baseAccessor = `${toCamelCase(entry.domainId)}QueryKeys.${toCamelCase(entry.table)}()`
  if (method === "list" || method === "findById") {
    return {
      invalidateKeys: [],
      optimisticUpdate: false,
    }
  }
  return {
    invalidateKeys: [baseAccessor],
    optimisticUpdate: false,
  }
}

function buildActionSemanticPlan(
  entry: RepositoryPlanEntry,
  method: CrudMethod,
  domain: DomainEntry,
  typesSource: string
): ActionSemanticPlan {
  const schemaSource =
    method === "list" || method === "findById"
      ? entry.read
      : (entry.write ?? entry.read)

  const shapes = extractTableShapes(
    typesSource,
    schemaSource.name,
    schemaSource.kind === "view" ? "Views" : "Tables"
  )
  const inputFields = inferInputFields(entry, method, shapes)
  const outputSchema = inferOutputType(entry, method)
  const domainKebab = toKebabCase(entry.domainId)
  const tableKebab = toKebabCase(entry.table)
  const methodCamel = toCamelCase(method)
  const actionName = `${methodCamel}${toPascalCase(entry.table)}Action`
  const isQueryMethod = method === "list" || method === "findById"

  const frontendContract: QueryFrontendContract | MutationFrontendContract = isQueryMethod
    ? {
        actionImportPath: `@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen`,
        hookImportPath: `@workspace/supabase-data/hooks/${domainKebab}/${hookFileNameFor(entry.table, method)}`,
        hookKind: "query",
        hookName: hookNameFor(entry.table, method),
        queryKeyFactory: queryKeyFactoryName(entry.table, method),
      }
    : {
        actionImportPath: `@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen`,
      }

  return {
    actionName,
    actionPath: `@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${methodCamel}.codegen`,
    authPolicy: inferAuthPolicy(domain),
    cacheInvalidation: inferCacheInvalidation(entry, method),
    domainId: entry.domainId,
    frontendContract,
    inputSchema: {
      fields: inputFields,
      typeName: `${toPascalCase(entry.table)}${toPascalCase(method)}Input`,
      zodSchema: renderZodObject(inputFields),
    },
    kind: inferActionKind(method),
    logging: inferLoggingMetadata(entry, method),
    method,
    notes: [
      `Generated for ${entry.table}.${method}`,
      `Audit-safe fields: ${defaultAuditFields(entry).join(", ")}`,
    ],
    outputSchema,
    queryKeyPolicy:
      method === "list"
        ? {
            accessor: queryKeyFactoryName(entry.table, method),
            paramsTypeName: `${toPascalCase(entry.table)}${toPascalCase(method)}Input`,
            scope: "list",
          }
        : method === "findById"
          ? {
              accessor: queryKeyFactoryName(entry.table, method),
              paramsTypeName: `${toPascalCase(entry.table)}${toPascalCase(method)}Input`,
              scope: "byId",
            }
          : undefined,
    repositoryCall: {
      arguments: inferRepositoryArguments(entry, method),
      method,
    },
    table: entry.table,
    tenantScoping: inferTenantScoping(entry, shapes.row),
  }
}

function generateSemanticPlan(
  plan: RepositoryPlanFile,
  domainMapRaw: unknown,
  typesSource: string
): SemanticPlanFile {
  const domainMap = parseDomainMapJson(domainMapRaw)
  const actions: ActionSemanticPlan[] = []

  for (const entry of plan.entries) {
    const domain = domainMap.domains.find((candidate) => candidate.id === entry.domainId)
    if (!domain || domain.exposeActions === false || domain.codegen === false) {
      continue
    }

    for (const method of entry.methods) {
      actions.push(buildActionSemanticPlan(entry, method, domain, typesSource))
    }
  }

  return {
    actions,
    generatedAt: new Date().toISOString(),
    meta: {
      confidence: "high",
      generator: "actions-semantic-plan",
      requiresHumanReview: false,
    },
    version: 2,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const planPath = resolve(repoRoot, argValue("--plan") ?? "config/repository-plan.json")
  const domainMapPath = resolve(repoRoot, argValue("--map") ?? "config/domain-map.json")
  const typesPath = resolve(
    repoRoot,
    argValue("--types") ?? "packages/supabase-infra/src/types/database.types.ts"
  )

  try {
    const plan = parseRepositoryPlanJson(JSON.parse(readFileSync(planPath, "utf8")))
    const domainMap = JSON.parse(readFileSync(domainMapPath, "utf8")) as unknown
    const typesSource = readFileSync(typesPath, "utf8")
    const semanticPlan = generateSemanticPlan(plan, domainMap, typesSource)
    const outputPath = resolve(repoRoot, "config/action-semantic-plan.json")

    writeFileSync(outputPath, JSON.stringify(semanticPlan, null, 2) + "\n", "utf8")

    console.log(`Generated semantic plan: ${outputPath}`)
    console.log(`  Actions: ${semanticPlan.actions.length}`)
    console.log(`  Confidence: ${semanticPlan.meta.confidence}`)
    console.log(`  Requires human review: ${semanticPlan.meta.requiresHumanReview}`)
  } catch (error) {
    console.error("Error generating semantic plan:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

export {
  generateSemanticPlan,
  type ActionSemanticPlan,
  type MutationFrontendContract,
  type QueryFrontendContract,
  type SemanticField,
  type SemanticPlanFile,
}
