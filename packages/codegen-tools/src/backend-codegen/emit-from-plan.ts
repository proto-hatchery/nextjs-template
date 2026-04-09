/* oxlint-disable eslint-plugin-import/no-relative-parent-imports -- internal package subfolder */
/* oxlint-disable complexity -- string builder for repository class */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import type { RepositoryPlanEntry } from "@workspace/codegen-tools/repository-plan-schema"

import { CODEGEN_HEADER, isCodegenManagedSource } from "./constants"
import { camelFromSnake, pascalFromSnake } from "./naming"
import { dtoPath, integrationTestPath, mapperPath, portPath, repositoryPath } from "./paths"
import {
  planDtoImportSpecifier,
  planMapperImportSpecifier,
  planModuleEntityKebab,
  planPortImportSpecifier,
  planRepositoryImportSpecifier,
} from "./plan-module-paths"

type EmitFromPlanOptions = {
  checkOnly: boolean
  domainId: string
  entry: RepositoryPlanEntry
  repoRoot: string
  /** snake_case columns for DTO / select */
  columns: string[]
  force: boolean
}

type EmitResult = {
  errors: string[]
  filesWritten: string[]
}

function rowTypeRef(entry: RepositoryPlanEntry): string {
  if (entry.read.kind === "view") {
    return `Database["public"]["Views"]["${entry.read.name}"]["Row"]`
  }
  return `Database["public"]["Tables"]["${entry.read.name}"]["Row"]`
}

function insertTypeRef(writeTable: string): string {
  return `Database["public"]["Tables"]["${writeTable}"]["Insert"]`
}

function updateTypeRef(writeTable: string): string {
  return `Database["public"]["Tables"]["${writeTable}"]["Update"]`
}

function selectList(columns: string[]): string {
  return columns.join(", ")
}

function ensureWrite(
  absPath: string,
  content: string,
  opts: { checkOnly: boolean; force: boolean }
): { ok: boolean; error?: string; wrote: boolean } {
  if (opts.checkOnly) {
    if (!existsSync(absPath)) {
      return { ok: false, error: `Missing generated file (run --write): ${absPath}`, wrote: false }
    }
    const disk = readFileSync(absPath, "utf8")
    if (!isCodegenManagedSource(disk)) {
      return {
        ok: false,
        error: `File exists but is not codegen-managed (missing codegen:backend — header): ${absPath}`,
        wrote: false,
      }
    }
    if (disk !== content) {
      return { ok: false, error: `Codegen drift (re-run --write): ${absPath}`, wrote: false }
    }
    return { ok: true, wrote: false }
  }

  if (existsSync(absPath)) {
    const disk = readFileSync(absPath, "utf8")
    if (!isCodegenManagedSource(disk) && !opts.force) {
      return {
        ok: false,
        error: `Refusing to overwrite non-managed file (use --force): ${absPath}`,
        wrote: false,
      }
    }
  }

  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, content, "utf8")
  return { ok: true, wrote: true }
}

function emitDto(
  pascal: string,
  entry: RepositoryPlanEntry,
  columns: string[],
  camelFields: { snake: string; camel: string }[]
): string {
  const dtoName = `${pascal}DTO`
  if (entry.dto.style === "type") {
    const lines = camelFields.map((f) => `  readonly ${f.camel}: unknown`)
    return `${CODEGEN_HEADER}export interface ${dtoName} {
${lines.join("\n")}
}
`
  }

  const zodFields = camelFields.map((f) => `  ${f.camel}: looseCell`)
  return `${CODEGEN_HEADER}import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const ${dtoName}Schema = z.object({
${zodFields.join(",\n")}
})

type ${dtoName} = z.infer<typeof ${dtoName}Schema>

export { ${dtoName}Schema, type ${dtoName} }
`
}

function emitMapper(
  pascal: string,
  entry: RepositoryPlanEntry,
  entityKebab: string,
  domainId: string,
  camelFields: { snake: string; camel: string }[],
  rowRef: string,
  writeTable?: string
): string {
  const dtoName = `${pascal}DTO`
  const dtoImport =
    entry.dto.style === "zod" ? `${dtoName}Schema, type ${dtoName}` : `type ${dtoName}`
  const hasWriteTable = typeof writeTable === "string" && writeTable.length > 0

  const fromBody = camelFields.map((f) => `    ${f.camel}: row.${f.snake},`).join("\n")
  const fieldMappingsConstName = `${pascal}FieldMappings`
  const fieldMappingsBody = camelFields.map((f) => `  ${f.camel}: "${f.snake}",`).join("\n")

  const dtoModuleImport = planDtoImportSpecifier(domainId, entityKebab)

  return `${CODEGEN_HEADER}import type { Database } from "@workspace/supabase-infra/types/database"

import { ${dtoImport} } from "${dtoModuleImport}"

type ${pascal}Row = ${rowRef}
${hasWriteTable ? `type ${pascal}Insert = ${insertTypeRef(writeTable)}\ntype ${pascal}Update = ${updateTypeRef(writeTable)}\n` : ""}

const ${fieldMappingsConstName} = {
${fieldMappingsBody}
} as const

${hasWriteTable ? `type ${pascal}Field = keyof typeof ${fieldMappingsConstName}` : `type _${pascal}Field = keyof typeof ${fieldMappingsConstName}`}

function from${pascal}Row(row: ${pascal}Row): ${dtoName} {
  const mapped = {
${fromBody}
  }
  return ${entry.dto.style === "zod" ? `${dtoName}Schema.parse(mapped)` : `(mapped as ${dtoName})`}
}

${hasWriteTable ? `
function to${pascal}Insert(dto: Partial<${dtoName}>): ${pascal}Insert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(${fieldMappingsConstName}) as Array<
    [${pascal}Field, (typeof ${fieldMappingsConstName})[${pascal}Field]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as ${pascal}Insert
}

function to${pascal}Update(dto: Partial<${dtoName}>): ${pascal}Update {
  return to${pascal}Insert(dto) as ${pascal}Update
}

export { from${pascal}Row, to${pascal}Insert, to${pascal}Update }
` : `export { from${pascal}Row }\n`}
`
}

function emitPort(
  pascal: string,
  entry: RepositoryPlanEntry,
  entityKebab: string,
  domainId: string
): string {
  const dtoName = `${pascal}DTO`
  const dtoImport = `import type { ${dtoName} } from "${planDtoImportSpecifier(domainId, entityKebab)}"`

  const lines: string[] = []
  const methods = new Set(entry.methods)

  if (methods.has("findById")) {
    lines.push(`  findById(id: string): Promise<${dtoName} | null>`)
  }
  if (methods.has("list")) {
    lines.push(`  list(params: ${pascal}ListParams): Promise<${pascal}ListResult>`)
  }
  if (methods.has("insert")) {
    lines.push(`  insert(data: Partial<${dtoName}>): Promise<${dtoName}>`)
  }
  if (methods.has("update")) {
    lines.push(`  update(id: string, patch: Partial<${dtoName}>): Promise<${dtoName}>`)
  }
  if (methods.has("upsert")) {
    lines.push(`  upsert(data: Partial<${dtoName}>): Promise<${dtoName}>`)
  }
  if (methods.has("delete")) {
    lines.push(`  delete(id: string): Promise<void>`)
  }
  if (methods.has("softDelete")) {
    lines.push(`  softDelete(id: string): Promise<void>`)
  }

  for (const c of entry.customMethods ?? []) {
    lines.push(`  ${c.name}(): Promise<unknown>`)
  }

  const filterFields = entry.list?.filterFields ?? []
  const filterProps = filterFields.map((f) => `  ${camelFromSnake(f)}?: string`).join("\n")

  const listTypes = methods.has("list")
    ? `
export interface ${pascal}ListParams {
  limit?: number
  offset?: number
${filterProps ? `${filterProps}\n` : ""}}

export interface ${pascal}ListResult {
  rows: ${dtoName}[]
}
`
    : ""

  return `${CODEGEN_HEADER}${dtoImport}
${listTypes}
interface ${pascal}Repository {
${lines.join("\n")}
}

export { type ${pascal}Repository }
`
}

function emitRepository(
  pascal: string,
  entry: RepositoryPlanEntry,
  entityKebab: string,
  domainId: string,
  columns: string[],
  idColumn: string
): string {
  const dtoName = `${pascal}DTO`
  const readFrom = entry.read.name
  const writeTable = entry.write?.name ?? entry.table
  const sel = selectList(columns)
  const methods = new Set(entry.methods)
  const deferred = entry.deferred === true

  const portImport = planPortImportSpecifier(domainId, entityKebab)
  const mapperImport = planMapperImportSpecifier(domainId, entityKebab)

  const deferThrow = (method: string): string =>
    `    throw new SupabaseRepositoryError("Deferred codegen stub (${method}) for ${entry.table}.", undefined)`

  const mapperImportNames: string[] = [`from${pascal}Row`]
  if (methods.has("insert") || methods.has("upsert")) {
    mapperImportNames.push(`to${pascal}Insert`)
  }
  if (methods.has("update")) {
    mapperImportNames.push(`to${pascal}Update`)
  }

  const head: string[] = [
    `${CODEGEN_HEADER}import type { SupabaseClient } from "@supabase/supabase-js"`,
    ``,
    `import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"`,
    ``,
    `import type { ${pascal}Repository${methods.has("list") ? `, ${pascal}ListParams, ${pascal}ListResult` : ""} } from "${portImport}"`,
    `import { ${mapperImportNames.join(", ")} } from "${mapperImport}"`,
    `import type { ${dtoName} } from "${planDtoImportSpecifier(domainId, entityKebab)}"`,
    ``,
    `class ${pascal}SupabaseRepository implements ${pascal}Repository {`,
    `  constructor(private readonly supabase: SupabaseClient) {}`,
    ``,
  ]

  const body: string[] = []

  if (methods.has("findById")) {
    if (deferred) {
      body.push(
        `  async findById(_id: string): Promise<${dtoName} | null> {`,
        deferThrow("findById"),
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async findById(id: string): Promise<${dtoName} | null> {`,
        `    const { data, error } = await this.supabase`,
        `      .from("${readFrom}")`,
        `      .select("${sel}")`,
        `      .eq("${idColumn}", id)`,
        `      .maybeSingle()`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to load ${entry.table}.", { cause: error })`,
        `    }`,
        `    if (!data) return null`,
        `    return from${pascal}Row(data)`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("list")) {
    const defaultLimit = entry.list?.pageSizeDefault ?? 20
    const maxLimit = entry.list?.maxPageSize ?? 100
    if (deferred) {
      body.push(
        `  async list(_params: ${pascal}ListParams): Promise<${pascal}ListResult> {`,
        deferThrow("list"),
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async list(params: ${pascal}ListParams): Promise<${pascal}ListResult> {`,
        `    const limit = Math.min(params.limit ?? ${defaultLimit}, ${maxLimit})`,
        `    const offset = params.offset ?? 0`,
        `    const end = offset + limit - 1`,
        `    const q = this.supabase.from("${readFrom}").select("${sel}").range(offset, end)`,
        `    const { data, error } = await q`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to list ${entry.table}.", { cause: error })`,
        `    }`,
        `    const rows = (data ?? []).map((row) => from${pascal}Row(row))`,
        `    return { rows }`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("insert")) {
    if (deferred) {
      body.push(
        `  async insert(_data: Partial<${dtoName}>): Promise<${dtoName}> {`,
        deferThrow("insert"),
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async insert(data: Partial<${dtoName}>): Promise<${dtoName}> {`,
        `    const payload = to${pascal}Insert(data)`,
        `    const { data: row, error } = await this.supabase`,
        `      .from("${writeTable}")`,
        `      .insert(payload)`,
        `      .select("${sel}")`,
        `      .single()`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to insert ${entry.table}.", { cause: error })`,
        `    }`,
        `    return from${pascal}Row(row)`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("update")) {
    if (deferred) {
      body.push(
        `  async update(_id: string, _patch: Partial<${dtoName}>): Promise<${dtoName}> {`,
        deferThrow("update"),
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async update(id: string, patch: Partial<${dtoName}>): Promise<${dtoName}> {`,
        `    const payload = to${pascal}Update(patch)`,
        `    const { data: row, error } = await this.supabase`,
        `      .from("${writeTable}")`,
        `      .update(payload)`,
        `      .eq("${idColumn}", id)`,
        `      .select("${sel}")`,
        `      .single()`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to update ${entry.table}.", { cause: error })`,
        `    }`,
        `    return from${pascal}Row(row)`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("upsert")) {
    const onConflict = entry.upsert?.onConflict ?? "id"
    if (deferred) {
      body.push(
        `  async upsert(_data: Partial<${dtoName}>): Promise<${dtoName}> {`,
        deferThrow("upsert"),
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async upsert(data: Partial<${dtoName}>): Promise<${dtoName}> {`,
        `    const payload = to${pascal}Insert(data)`,
        `    const { data: row, error } = await this.supabase`,
        `      .from("${writeTable}")`,
        `      .upsert(payload, { onConflict: "${onConflict}" })`,
        `      .select("${sel}")`,
        `      .single()`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to upsert ${entry.table}.", { cause: error })`,
        `    }`,
        `    return from${pascal}Row(row)`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("delete")) {
    if (deferred) {
      body.push(`  async delete(_id: string): Promise<void> {`, deferThrow("delete"), `  }`, ``)
    } else {
      body.push(
        `  async delete(id: string): Promise<void> {`,
        `    const { error } = await this.supabase.from("${writeTable}").delete().eq("${idColumn}", id)`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to delete ${entry.table}.", { cause: error })`,
        `    }`,
        `  }`,
        ``
      )
    }
  }

  if (methods.has("softDelete")) {
    const col = entry.softDelete?.column ?? "deleted_at"
    if (deferred) {
      body.push(
        `  async softDelete(_id: string): Promise<void> {`,
        deferThrow("softDelete"),
        `  }`,
        ``
      )
    } else if (
      entry.softDelete &&
      typeof entry.softDelete === "object" &&
      Object.hasOwn(entry.softDelete, "value")
    ) {
      const literalPatch = JSON.stringify({ [col]: entry.softDelete.value })
      body.push(
        `  async softDelete(id: string): Promise<void> {`,
        `    const { error } = await this.supabase`,
        `      .from("${writeTable}")`,
        `      .update(${literalPatch} as Record<string, unknown>)`,
        `      .eq("${idColumn}", id)`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to soft-delete ${entry.table}.", { cause: error })`,
        `    }`,
        `  }`,
        ``
      )
    } else {
      body.push(
        `  async softDelete(id: string): Promise<void> {`,
        `    const { error } = await this.supabase`,
        `      .from("${writeTable}")`,
        `      .update({ ${col}: new Date().toISOString() } as Record<string, unknown>)`,
        `      .eq("${idColumn}", id)`,
        `    if (error) {`,
        `      throw new SupabaseRepositoryError("Failed to soft-delete ${entry.table}.", { cause: error })`,
        `    }`,
        `  }`,
        ``
      )
    }
  }

  for (const c of entry.customMethods ?? []) {
    body.push(
      `  async ${c.name}(): Promise<unknown> {`,
      `    throw new SupabaseRepositoryError("Not implemented (custom method: ${c.name}).", undefined)`,
      `  }`,
      ``
    )
  }

  const tail = [`}`, ``, `export { ${pascal}SupabaseRepository }`, ``]

  return [...head, ...body, ...tail].join("\n")
}

function emitIntegrationStub(
  pascal: string,
  domainId: string,
  table: string,
  entityKebab: string
): string {
  return `${CODEGEN_HEADER}import { describe, it } from "vitest"

import { ${pascal}SupabaseRepository } from "${planRepositoryImportSpecifier(domainId, entityKebab)}"

describe.skip("${entityKebab} repository (codegen scaffold)", () => {
  it("CRUD round-trip — wire Supabase test client and un-skip", () => {
    void ${pascal}SupabaseRepository
  })
})
`
}

function emitFromPlan(opts: EmitFromPlanOptions): EmitResult {
  const errors: string[] = []
  const filesWritten: string[] = []
  const { entry, domainId, repoRoot } = opts
  const pascal = pascalFromSnake(entry.table)
  const entityKebab = planModuleEntityKebab(entry.table)
  const camelFields = opts.columns.map((snake) => ({ snake, camel: camelFromSnake(snake) }))
  const rowRef = rowTypeRef(entry)
  const hasWriteMethods = entry.methods.some((method) =>
    ["insert", "update", "upsert", "delete", "softDelete"].includes(method)
  )
  const writeTable = hasWriteMethods ? (entry.write?.name ?? entry.table) : undefined
  const idColumn = entry.idColumn ?? "id"

  const targets: { path: string; content: string }[] = [
    {
      path: dtoPath(repoRoot, domainId, entry.table),
      content: emitDto(pascal, entry, opts.columns, camelFields),
    },
    {
      path: mapperPath(repoRoot, domainId, entry.table),
      content: emitMapper(pascal, entry, entityKebab, domainId, camelFields, rowRef, writeTable),
    },
    {
      path: portPath(repoRoot, domainId, entry.table),
      content: emitPort(pascal, entry, entityKebab, domainId),
    },
    {
      path: repositoryPath(repoRoot, domainId, entry.table),
      content: emitRepository(pascal, entry, entityKebab, domainId, opts.columns, idColumn),
    },
    {
      path: integrationTestPath(repoRoot, domainId, entry.table),
      content: emitIntegrationStub(pascal, domainId, entry.table, entityKebab),
    },
  ]

  for (const t of targets) {
    const r = ensureWrite(t.path, t.content, { checkOnly: opts.checkOnly, force: opts.force })
    if (!r.ok && r.error) {
      errors.push(r.error)
    }
    if (r.wrote) {
      filesWritten.push(t.path)
    }
  }

  return { errors, filesWritten }
}

export { emitFromPlan, type EmitResult }
