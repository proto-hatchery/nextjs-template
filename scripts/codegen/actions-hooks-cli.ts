#!/usr/bin/env tsx
/**
 * CLI wrapper for automated Server Actions and TanStack Query hooks codegen.
 *
 * Usage:
 *   pnpm codegen:actions-hooks --check
 *   pnpm codegen:actions-hooks --write
 */

import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { runActionsHooksCodegen } from "./actions-hooks-codegen"
import { resolveDomainMapPath, resolveRepositoryPlanPath } from "./config-defaults"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

function argValue(flag: string): string | undefined {
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

const typesPath =
  argValue("--types") ?? resolve(repoRoot, "packages/supabase-infra/src/types/database.types.ts")
const mapPath = resolveDomainMapPath(repoRoot, argValue("--map"))
const planPath = resolveRepositoryPlanPath(repoRoot, argValue("--plan"))
const domainFilter = argValue("--domain")
const force = process.argv.includes("--force")

if (!mapPath) {
  process.stderr.write(
    "Missing domain map: copy config/domain-map.example.json to config/domain-map.json or pass --map\n"
  )
  process.exit(1)
}

if (!planPath) {
  process.stderr.write(
    "Missing repository plan: copy config/repository-plan.example.json to config/repository-plan.json or pass --plan\n"
  )
  process.exit(1)
}

const gen = runActionsHooksCodegen({
  repoRoot,
  typesPath,
  planPath,
  domainMapPath: mapPath,
  checkOnly,
  force,
  domainFilter,
})

if (!gen.ok) {
  for (const e of gen.errors) {
    process.stderr.write(`${e}\n`)
  }
  process.exit(1)
}

if (checkOnly) {
  process.stdout.write(
    `codegen:actions-hooks --check OK: ${gen.actionsGenerated} actions, ${gen.hooksGenerated} hooks, ${gen.queryKeysUpdated} query key files would be generated.\n`
  )
} else if (write && gen.filesWritten.length > 0) {
  process.stdout.write(`Generated ${gen.filesWritten.length} file(s):\n`)
  for (const f of gen.filesWritten) {
    process.stdout.write(`  ${f}\n`)
  }
  process.stdout.write(
    "\nNext steps:\n  1. Add explicit exports in packages/supabase-data/package.json\n  2. Run: pnpm typecheck\n  3. Run: pnpm lint\n  4. Review TODOs in generated files\n"
  )
} else if (write) {
  process.stdout.write("Nothing to generate.\n")
}
