#!/usr/bin/env tsx
/**
 * TanStack Query hook scaffold
 *
 * Usage:
 *   pnpm hook:new -- <domain> <entity> query
 *
 * Example:
 *   pnpm hook:new -- catalog reference-values query
 *
 * Creates:
 *   packages/supabase-data/src/hooks/<domain>/use-<entity>-query.hook.codegen.ts
 *   packages/supabase-data/src/hooks/<domain>/query-keys.codegen.ts (if missing)
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const args = process.argv.slice(2).filter((a) => a !== "--")
const [domain, entity, hookType] = args

if (!domain || !entity || !hookType) {
  console.error("Usage: pnpm hook:new -- <domain> <entity> query")
  console.error("Example: pnpm hook:new -- catalog reference-values query")
  process.exit(1)
}

if (hookType !== "query") {
  console.error(`Invalid type "${hookType}". Only "query" is supported.`)
  process.exit(1)
}

function toKebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
}

function toCamel(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

const domainSegment = toKebab(domain)
const entitySegment = toKebab(entity)
const domainCamel = toCamel(domainSegment)
const entityCamel = toCamel(entitySegment)
const keysExportName = `${domainCamel}QueryKeys`

const hooksRoot = join(process.cwd(), "packages/supabase-data/src/hooks", domainSegment)
if (!existsSync(hooksRoot)) {
  mkdirSync(hooksRoot, { recursive: true })
  console.log(`✅ Created directory: ${hooksRoot}`)
}

const queryKeysPath = join(hooksRoot, "query-keys.codegen.ts")
if (!existsSync(queryKeysPath)) {
  const queryKeysBody = `/**
 * TanStack Query key factory for domain "${domainSegment}".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/${domainSegment}/query-keys
 * codegen:new-hook (generated)
 */
export const ${keysExportName} = {
  all: ["${domainSegment}"] as const,
  ${entityCamel}: () => [...${keysExportName}.all, "${entitySegment}"] as const,
  ${entityCamel}List: (filters?: Record<string, unknown>) =>
    [...${keysExportName}.${entityCamel}(), "list", filters ?? {}] as const,
}
`
  writeFileSync(queryKeysPath, queryKeysBody, "utf-8")
  console.log(`✅ Created query keys: ${queryKeysPath}`)
} else {
  console.log(`ℹ️  query-keys.codegen.ts already exists`)
}

const hookFileBase = `use-${entitySegment}-${hookType}`
const hookPath = join(hooksRoot, `${hookFileBase}.hook.codegen.ts`)

const hookFnName = hookFileBase
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("")

const body = `/**
 * ${hookFnName} — TanStack Query wrapper for a Server Action.
 *
 * TODO: Import the Server Action from \`@workspace/supabase-data/actions/...\` and
 * replace the queryFn body. Do not add console.log — observability lives in the action (logServerEvent).
 *
 * @module @workspace/supabase-data/hooks/${domainSegment}/${hookFileBase}
 * codegen:new-hook (generated)
 */
"use client"

import { useQuery } from "@tanstack/react-query"

import { ${keysExportName} } from "@workspace/supabase-data/hooks/${domainSegment}/query-keys.codegen"

// TODO: import { /* yourListAction */ } from "@workspace/supabase-data/actions/${domainSegment}/..."

export function ${hookFnName}(filters?: Record<string, unknown>) {
return useQuery({
  queryKey: ${keysExportName}.${entityCamel}List(filters),
  queryFn: async () => {
    // TODO: return yourListAction(filters ?? {})
    throw new Error("Wire Server Action in queryFn")
  },
})
}
`
writeFileSync(hookPath, body, "utf-8")

console.log(`✅ Created hook: ${hookPath}`)
console.log("")
console.log("📝 Next steps:")
console.log("  1. Add explicit exports in packages/supabase-data/package.json")
console.log("  2. Wire Server Action imports; remove TODO throws")
console.log("  3. In the action: logServerEvent on success/failure with metadata + durationMs")
console.log("")
