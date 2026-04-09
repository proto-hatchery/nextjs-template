#!/usr/bin/env tsx

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import type { QueryFrontendContract, SemanticPlanFile } from "./actions-semantic-plan"

const repoRoot = resolve(process.cwd())

const PLACEHOLDER_PATTERNS = [
  /\bTODO\b/,
  /\bas never\b/,
  /\bas unknown as\b/,
  /[=]\s*unknown\b/,
  /Use(?:Query|Mutation)Result<unknown/,
  /Wire Server Action/,
]

function read(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), "utf8")
}

function main(): void {
  const semanticPlan = JSON.parse(read("config/action-semantic-plan.json")) as SemanticPlanFile
  const errors: string[] = []

  for (const action of semanticPlan.actions) {
    const domainKebab = action.domainId
    const tableKebab = action.table.replace(/_/g, "-")
    const methodSegment = action.method
    const actionFile = resolve(
      repoRoot,
      `packages/supabase-data/src/actions/${domainKebab}/${tableKebab}-${methodSegment}.codegen.ts`
    )

    if (!existsSync(actionFile)) {
      errors.push(`Missing generated action: ${actionFile}`)
      continue
    }

    const actionContent = readFileSync(actionFile, "utf8")
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(actionContent)) {
        errors.push(`Placeholder detected in action: ${actionFile}`)
        break
      }
    }

    if (!actionContent.includes("Schema = z.object(")) {
      errors.push(`Missing input schema in action: ${actionFile}`)
    }

    if (action.kind === "query") {
      const queryContract = action.frontendContract as QueryFrontendContract
      const hookRelative =
        queryContract.hookImportPath.replace(
          "@workspace/supabase-data/",
          "packages/supabase-data/src/"
        ) + ".ts"
      const hookFile = resolve(repoRoot, hookRelative)

      if (!existsSync(hookFile)) {
        errors.push(`Missing generated hook: ${hookFile}`)
        continue
      }

      const hookContent = readFileSync(hookFile, "utf8")
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(hookContent)) {
          errors.push(`Placeholder detected in hook: ${hookFile}`)
          break
        }
      }

      if (!hookContent.includes(action.actionName)) {
        errors.push(`Hook does not call action ${action.actionName}: ${hookFile}`)
      }
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error)
    }
    process.exit(1)
  }

  console.log("Generated frontend artifacts are complete.")
}

main()
