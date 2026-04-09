/* oxlint-disable complexity -- single validation pass over plan entries */
import type { DomainMapFile } from "./domain-map-schema"
import { extractPublicTableNames } from "./extract-public-table-names"
import { extractPublicViewNames } from "./extract-public-view-names"
import { extractRowColumnNames } from "./extract-table-row-columns"
import type { RepositoryPlanEntry, RepositoryPlanFile } from "./repository-plan-schema"

type MergeRepositoryPlanOptions = {
  databaseTypesSource: string
  domainMap: DomainMapFile
  plan: RepositoryPlanFile
  strict: boolean
  filterDomainId?: string
  filterTable?: string
}

type MergeRepositoryPlanResult = {
  errors: string[]
  ok: boolean
  entriesByKey: Map<string, RepositoryPlanEntry>
}

function entryKey(domainId: string, table: string): string {
  return `${domainId}::${table}`
}

function listCodegenTables(
  domainMap: DomainMapFile
): { domainId: string; table: string; readOnly: boolean }[] {
  const out: { domainId: string; table: string; readOnly: boolean }[] = []
  for (const d of domainMap.domains) {
    if (d.codegen === false) {
      continue
    }
    for (const table of d.tables) {
      out.push({ domainId: d.id, table, readOnly: d.readOnly })
    }
  }
  return out
}

function mergeAndValidateRepositoryPlan(
  opts: MergeRepositoryPlanOptions
): MergeRepositoryPlanResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const entriesByKey = new Map<string, RepositoryPlanEntry>()

  const publicTables = new Set(extractPublicTableNames(opts.databaseTypesSource))
  const publicViews = new Set(extractPublicViewNames(opts.databaseTypesSource))

  for (const e of opts.plan.entries) {
    if (opts.filterDomainId && e.domainId !== opts.filterDomainId) {
      continue
    }
    if (opts.filterTable && e.table !== opts.filterTable) {
      continue
    }

    const k = entryKey(e.domainId, e.table)
    if (seen.has(k)) {
      errors.push(`Duplicate repository-plan entry for ${k}`)
      continue
    }
    seen.add(k)

    const domain = opts.domainMap.domains.find((d) => d.id === e.domainId)
    if (!domain) {
      errors.push(`repository-plan: unknown domainId "${e.domainId}"`)
      continue
    }
    if (domain.codegen === false) {
      errors.push(`repository-plan: domain "${e.domainId}" has codegen: false`)
      continue
    }
    if (!domain.tables.includes(e.table)) {
      errors.push(`repository-plan: table "${e.table}" is not in domain "${e.domainId}"`)
      continue
    }

    if (domain.readOnly) {
      const forbidden = new Set(["insert", "update", "upsert", "delete", "softDelete"])
      for (const m of e.methods) {
        if (forbidden.has(m)) {
          errors.push(
            `repository-plan: domain "${e.domainId}" is readOnly but entry for "${e.table}" includes "${m}"`
          )
        }
      }
    }

    if (e.read.kind === "table" && !publicTables.has(e.read.name)) {
      errors.push(
        `repository-plan: read name "${e.read.name}" is not in Database["public"]["Tables"]`
      )
    }
    if (e.read.kind === "view" && !publicViews.has(e.read.name)) {
      errors.push(
        `repository-plan: read name "${e.read.name}" is not in Database["public"]["Views"]`
      )
    }

    const hasWriteMethods = e.methods.some((method) =>
      ["insert", "update", "upsert", "delete", "softDelete"].includes(method)
    )
    const writeTarget = hasWriteMethods
      ? (e.write ?? { kind: "table" as const, name: e.table })
      : null

    if (writeTarget) {
      if (writeTarget.kind !== "table") {
        errors.push(`repository-plan: write.kind must be "table" for "${k}"`)
        continue
      }
      if (!publicTables.has(writeTarget.name)) {
        errors.push(
          `repository-plan: write name "${writeTarget.name}" is not in Database["public"]["Tables"]`
        )
      }
    }

    const readBucket = e.read.kind === "view" ? "Views" : "Tables"
    const readCols = extractRowColumnNames(opts.databaseTypesSource, e.read.name, readBucket)
    const readColSet = new Set(readCols)

    const idCol = e.idColumn ?? "id"
    if (e.methods.includes("findById") && readCols.length > 0 && !readColSet.has(idCol)) {
      errors.push(
        `repository-plan: findById uses idColumn "${idCol}" but it is not on Row for "${e.read.name}"`
      )
    }

    if (e.dto.include !== "all_columns") {
      for (const c of e.dto.include.columns) {
        if (readCols.length > 0 && !readColSet.has(c)) {
          errors.push(`repository-plan: dto column "${c}" is not on Row for read "${e.read.name}"`)
        }
      }
    }

    if (writeTarget && e.methods.includes("softDelete") && e.softDelete) {
      const writeCols = extractRowColumnNames(opts.databaseTypesSource, writeTarget.name, "Tables")
      const writeColSet = new Set(writeCols)
      if (writeCols.length > 0 && !writeColSet.has(e.softDelete.column)) {
        errors.push(
          `repository-plan: softDelete.column "${e.softDelete.column}" is not on write table "${writeTarget.name}"`
        )
      }
    }

    entriesByKey.set(k, e)
  }

  const codegenTables = listCodegenTables(opts.domainMap).filter((row) => {
    if (opts.filterDomainId && row.domainId !== opts.filterDomainId) {
      return false
    }
    if (opts.filterTable && row.table !== opts.filterTable) {
      return false
    }
    return true
  })

  if (opts.strict) {
    for (const row of codegenTables) {
      const k = entryKey(row.domainId, row.table)
      if (!entriesByKey.has(k)) {
        errors.push(
          `strict repository-plan: missing entry for codegen table "${row.table}" in domain "${row.domainId}"`
        )
      }
    }
  }

  return { errors, ok: errors.length === 0, entriesByKey }
}

export {
  entryKey,
  listCodegenTables,
  mergeAndValidateRepositoryPlan,
  type MergeRepositoryPlanResult,
}
