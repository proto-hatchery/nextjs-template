#!/usr/bin/env tsx
/**
 * Generate RLS policies from semantic plan
 *
 * Uses cached (SELECT auth.uid()) pattern for performance
 * FOR ALL tenant-scoped tables
 *
 * Usage:
 *   pnpm tsx scripts/codegen/generate-rls-policies.ts --write
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import {
  parseRepositoryPlanJson,
  type RepositoryPlanFile,
} from "../../packages/codegen-tools/src/repository-plan-schema"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "../../..")

function generateRLSPolicy(
  table: string,
  domainId: string,
  auth: "session" | "admin" | "public",
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  tenantColumn: string = "psychologist_id"
): string {
  const policyName = `${domainId}_${operation.toLowerCase()}_${table}`

  const toClause =
    auth === "public"
      ? "TO anon, authenticated  -- Public read access"
      : auth === "admin"
        ? "TO authenticated  -- Admin-only (role checked in USING)"
        : "TO authenticated  -- Session-only access"

  let usingClause = "true"
  let withCheckClause = "true"

  if (auth === "session") {
    usingClause = `
    -- Tenant isolation: User can only access their own ${tenantColumn}
    -- Uses cached (select auth.uid()) for performance (evaluated once per statement, not per row)
    ${tenantColumn} = (
      SELECT ${tenantColumn} 
      FROM ${tenantColumn.replace("_id", "")}s
      WHERE user_id = (SELECT auth.uid())  -- Cached via initPlan
    )`

    withCheckClause = `
    -- Tenant isolation: User can only insert/update their own ${tenantColumn}
    ${tenantColumn} = (
      SELECT ${tenantColumn} 
      FROM ${tenantColumn.replace("_id", "")}s
      WHERE user_id = (SELECT auth.uid())
    )`
  } else if (auth === "admin") {
    usingClause = `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`
    withCheckClause = `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`
  }

  if (operation === "UPDATE") {
    return `
-- ${operation} policy for ${table} (${domainId} domain)
-- Tenant isolation with cached auth.uid() for performance
CREATE POLICY "${policyName}"
  ON public.${table}
  FOR ${operation}
  ${toClause}
  USING (${usingClause})
  WITH CHECK (${withCheckClause});
`
  }

  if (operation === "INSERT") {
    return `
-- ${operation} policy for ${table} (${domainId} domain)
-- Tenant isolation with cached auth.uid() for performance
CREATE POLICY "${policyName}"
  ON public.${table}
  FOR ${operation}
  ${toClause}
  WITH CHECK (${withCheckClause});
`
  }

  return `
-- ${operation} policy for ${table} (${domainId} domain)
-- Tenant isolation with cached auth.uid() for performance
CREATE POLICY "${policyName}"
  ON public.${table}
  FOR ${operation}
  ${toClause}
  USING (${usingClause});
`
}

function generateIndex(table: string, columns: string[]): string {
  const indexName = `idx_${table}_${columns.join("_")}`
  return `
-- Performance index for ${table}
CREATE INDEX IF NOT EXISTS ${indexName} ON public.${table} USING btree (${columns.join(", ")});
`
}

function generateMigration(plan: RepositoryPlanFile): string {
  const generatedAt = new Date()
  const generatedIso = generatedAt.toISOString()
  const migrationIdStamp = generatedIso.replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  let migration = `-- RLS Policies and Indexes (Auto-generated)
-- Generated: ${generatedIso}
-- Migration id stamp: ${migrationIdStamp}
-- DO NOT EDIT - This file is auto-generated
-- Run: pnpm codegen:generate-rls-policies --write
--
-- PERFORMANCE PATTERNS USED:
-- 1. Cached auth.uid() via (SELECT auth.uid()) - evaluated once per statement (initPlan)
-- 2. Explicit indexes on tenant isolation columns
-- 3. TO clause filters before evaluating USING (eliminates anon early)
--
-- FOR ALL TENANT-SCOPED TABLES:
-- All tables with codegen: true and auth: "session" get tenant isolation policies
-- Default tenant column: psychologist_id (configurable per table if needed)

`

  const domainTables = new Map<string, Set<string>>()
  for (const entry of plan.entries || []) {
    let tables = domainTables.get(entry.domainId)
    if (!tables) {
      tables = new Set()
      domainTables.set(entry.domainId, tables)
    }
    tables.add(entry.table)
  }

  for (const [domainId, tables] of domainTables) {
    migration += `\n-- ============================================\n`
    migration += `-- ${domainId.toUpperCase()} DOMAIN\n`
    migration += `-- ============================================\n\n`

    for (const table of tables) {
      const auth = "session" as const
      const tenantColumn =
        table.includes("user_") ||
        table === "user_admins" ||
        table === "user_assistants" ||
        table === "user_patients"
          ? "user_id"
          : "psychologist_id"

      migration += `-- ============================================\n`
      migration += `-- ${table} (tenant column: ${tenantColumn})\n`
      migration += `-- ============================================\n\n`

      migration += `-- RLS Policies (tenant isolation with cached auth.uid())\n`
      migration += generateRLSPolicy(table, domainId, auth, "SELECT", tenantColumn)
      migration += generateRLSPolicy(table, domainId, auth, "INSERT", tenantColumn)
      migration += generateRLSPolicy(table, domainId, auth, "UPDATE", tenantColumn)
      migration += generateRLSPolicy(table, domainId, auth, "DELETE", tenantColumn)

      migration += `\n-- Indexes (tenant isolation + query performance)\n`
      migration += generateIndex(table, ["id"])
      migration += generateIndex(table, [tenantColumn])
      if (table.includes("created_at")) {
        migration += generateIndex(table, ["created_at"])
      }
      if (table.includes("updated_at")) {
        migration += generateIndex(table, ["updated_at"])
      }
      if (table.includes("created_at")) {
        migration += generateIndex(table, [tenantColumn, "created_at"])
      }
      migration += `\n`
    }
  }

  migration += `\n-- ============================================\n`
  migration += `-- CUSTOMIZATION NOTES\n`
  migration += `-- ============================================\n`
  migration += `\n`
  migration += `-- Tenant column convention (automatically detected):\n`
  migration += `-- - psychologist_id: Tables scoped to psychologist (default)\n`
  migration += `-- - user_id: Tables scoped to user (user_admins, user_assistants, user_patients)\n`
  migration += `\n`
  migration += `-- To customize tenant column for specific tables:\n`
  migration += `-- 1. Edit this file and add table-specific logic\n`
  migration += `-- 2. Or manually edit the generated migration before applying\n`
  migration += `\n`
  migration += `-- Performance monitoring:\n`
  migration += `-- SELECT * FROM pg_stat_user_indexes WHERE indexrelname LIKE 'idx_%';\n`

  return migration
}

// Main
if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write")
  const planPath =
    process.argv.find((_, i) => process.argv[i - 1] === "--plan") ??
    resolve(repoRoot, "config/repository-plan.json")

  if (!existsSync(planPath)) {
    process.stderr.write("❌ repository-plan.json not found\n")
    process.exit(1)
  }

  const plan = parseRepositoryPlanJson(JSON.parse(readFileSync(planPath, "utf8")))

  console.log(`📝 Generating RLS policies and indexes...`)
  console.log(`   Tables: ${plan.entries?.length ?? 0}`)
  console.log("")

  const migration = generateMigration(plan)

  if (!write) {
    console.log("Would generate migration:")
    console.log(migration)
  } else {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")
    const migrationName = `generate_rls_policies_and_indexes`
    const migrationPath = resolve(repoRoot, `supabase/migrations/${timestamp}_${migrationName}.sql`)

    writeFileSync(migrationPath, migration, "utf8")
    console.log(`✅ Generated: ${migrationPath}`)
    console.log("")
    console.log("📝 Next steps:")
    console.log("   1. Review generated policies (add tenant isolation logic)")
    console.log("   2. Run: pnpm supabase db push")
    console.log("   3. Test RLS policies with: pnpm test:rls")
  }
}

export { generateRLSPolicy, generateIndex, generateMigration }
