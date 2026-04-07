#!/usr/bin/env tsx
/**
 * Phase 0: Semantic Plan Generation
 *
 * Analyzes repository-plan.json and generates semantic plan JSON
 * This semantic plan is then consumed by actions-fill-todos.ts (Phase 1)
 *
 * Usage:
 *   pnpm tsx scripts/codegen/actions-semantic-plan.ts
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import {
  parseRepositoryPlanJson,
  type RepositoryPlanFile,
} from "../../packages/codegen-tools/src/repository-plan-schema"

const repoRoot = resolve(process.cwd())

interface ActionSemanticPlan {
  domainId: string
  table: string
  method: string
  actionName: string
  inputSchema: {
    zodSchema: string
    typeName: string
    fields: Array<{
      name: string
      type: string
      validation: string[]
      required: boolean
      description?: string
    }>
  }
  outputSchema: {
    returnType: string
    fields: Array<{ name: string; type: string; source: "row" | "computed" | "relation" }>
  }
  repositoryCall: {
    method: string
    arguments: string[]
    errorHandling?: boolean
  }
  auth: {
    requiredRole?: string
    tenantScoping: boolean
    customChecks?: string[]
  }
  logging: {
    successMetadata: string[]
    errorMetadata: string[]
  }
  cacheInvalidation?: {
    invalidateKeys: string[]
    optimisticUpdate: boolean
    setQueryData?: {
      queryKey: string
      updaterFn: string
    }
  }
  notes?: string[]
}

interface SemanticPlanFile {
  version: number
  generatedAt: string
  actions: ActionSemanticPlan[]
  meta: {
    generator: string
    modelUsed?: string
    confidence: "high" | "medium" | "low"
    requiresHumanReview: boolean
  }
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

function generateSemanticPlan(plan: RepositoryPlanFile): SemanticPlanFile {
  const actions: ActionSemanticPlan[] = []

  for (const entry of plan.entries || []) {
    for (const method of entry.methods) {
      const actionSemantic: ActionSemanticPlan = {
        domainId: entry.domainId,
        table: entry.table,
        method,
        actionName: `${method}${toPascalCase(entry.table)}Action`,
        inputSchema: {
          zodSchema: `z.object({
  // TODO: Define fields based on ${entry.table}.${method} requirements
})`,
          typeName: `${toPascalCase(entry.table)}${toPascalCase(method)}Input`,
          fields: [],
        },
        outputSchema: {
          returnType: `Promise<{ data: ${toPascalCase(entry.table)}DTO[] }>`,
          fields: [{ name: "data", type: `${toPascalCase(entry.table)}DTO[]`, source: "row" }],
        },
        repositoryCall: {
          method: method === "list" ? "list" : method === "findById" ? "findById" : method,
          arguments:
            method === "list"
              ? ["{}"]
              : method === "insert"
                ? ["validated"]
                : ["validated.id", method === "update" ? "validated.data" : ""],
          errorHandling: true,
        },
        auth: {
          tenantScoping: entry.table.includes("patient") || entry.table.includes("psychologist"),
          customChecks: [],
        },
        logging: {
          successMetadata: ["entityId: result?.id"],
          errorMetadata: ["input: JSON.stringify(input)"],
        },
        cacheInvalidation:
          method !== "list" && method !== "findById"
            ? {
                invalidateKeys: [`["${entry.domainId}","${toKebabCase(entry.table)}"]`],
                optimisticUpdate: false,
              }
            : undefined,
        notes: [],
      }

      actions.push(actionSemantic)
    }
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    actions,
    meta: {
      generator: "actions-semantic-plan",
      confidence: "medium",
      requiresHumanReview: true,
    },
  }
}

// Main
if (import.meta.url === `file://${process.argv[1]}`) {
  const planPath = resolve(repoRoot, "config/repository-plan.json")

  try {
    const plan = parseRepositoryPlanJson(JSON.parse(readFileSync(planPath, "utf8")))
    const semanticPlan = generateSemanticPlan(plan)

    const outputPath = resolve(repoRoot, "config/action-semantic-plan.json")
    writeFileSync(outputPath, JSON.stringify(semanticPlan, null, 2) + "\n", "utf8")

    console.log(`✅ Generated semantic plan: ${outputPath}`)
    console.log(`   - ${semanticPlan.actions.length} action plans`)
    console.log(`   - Confidence: ${semanticPlan.meta.confidence}`)
    console.log(`   - Requires human review: ${semanticPlan.meta.requiresHumanReview}`)
    console.log("")
    console.log("📝 Next steps:")
    console.log("   1. Review and edit config/action-semantic-plan.json")
    console.log(
      "   2. Run: pnpm codegen:actions-fill-todos --plan config/action-semantic-plan.json"
    )
    console.log("   3. Review generated code")
    console.log("   4. Run: pnpm typecheck && pnpm lint")
  } catch (error) {
    console.error(
      "❌ Error generating semantic plan:",
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

export type { ActionSemanticPlan, SemanticPlanFile }
