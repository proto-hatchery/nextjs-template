import { ZodError } from "zod"

import { extractPublicViewNames } from "./extract-public-view-names"
import { parseDomainMapJson, type DomainMapFile } from "./domain-map-schema"
import { extractPublicTableNames } from "./extract-public-table-names"

type ValidateResult = { domainMap: DomainMapFile; errors: string[]; ok: boolean }

function validateDomainMapAgainstTypes(
  domainMap: DomainMapFile,
  publicTableNames: readonly string[],
  publicViewNames: readonly string[]
): string[] {
  const errors: string[] = []
  const publicTableSet = new Set(publicTableNames)
  const _publicViewSet = new Set(publicViewNames)
  const publicEntitySet = new Set([...publicTableNames, ...publicViewNames])
  const assigned = new Set<string>()
  const ignored = new Set(domainMap.ignoreTables ?? [])

  for (const t of ignored) {
    if (!publicTableSet.has(t)) {
      errors.push(`ignoreTables: unknown table "${t}" (not in Database["public"]["Tables"])`)
    }
  }

  for (const domain of domainMap.domains) {
    for (const table of domain.tables) {
      if (assigned.has(table)) {
        errors.push(`Table "${table}" appears in more than one domain`)
      }
      assigned.add(table)
      if (!publicEntitySet.has(table)) {
        errors.push(`Domain "${domain.id}": unknown table or view "${table}"`)
      }
      if (ignored.has(table)) {
        errors.push(`Table "${table}" is both in domain "${domain.id}" and ignoreTables`)
      }
    }
  }

  for (const t of publicTableNames) {
    if (!assigned.has(t) && !ignored.has(t)) {
      errors.push(`Table "${t}" is not assigned to any domain and not listed in ignoreTables`)
    }
  }

  return errors
}

function validateDomainMapContent(rawJson: unknown, databaseTypesSource: string): ValidateResult {
  let domainMap: DomainMapFile
  try {
    domainMap = parseDomainMapJson(rawJson)
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")
      return { domainMap: { version: 1, domains: [], ignoreTables: [] }, errors: [msg], ok: false }
    }
    throw e
  }

  const tables = extractPublicTableNames(databaseTypesSource)
  const views = extractPublicViewNames(databaseTypesSource)
  if (tables.length === 0) {
    return {
      domainMap,
      errors: ['Could not find Database["public"]["Tables"] in the types file'],
      ok: false,
    }
  }

  const errors = validateDomainMapAgainstTypes(domainMap, tables, views)
  return { domainMap, errors, ok: errors.length === 0 }
}

export { validateDomainMapAgainstTypes, validateDomainMapContent, type ValidateResult }
