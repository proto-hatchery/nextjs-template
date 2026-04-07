#!/usr/bin/env tsx
/**
 * Generate index migration from database.types.ts analysis
 *
 * Analyzes foreign keys and common query patterns
 *
 * Usage:
 *   pnpm tsx scripts/codegen/generate-index-migrations.ts --write
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "../../..")

function extractTablesFromTypes(typesSource: string): Array<{
  table: string
  columns: string[]
  relationships: Array<{ column: string; referencedTable: string }>
}> {
  const tables: Array<{
    table: string
    columns: string[]
    relationships: Array<{ column: string; referencedTable: string }>
  }> = []

  const tableMatches = typesSource.matchAll(/(\w+):\s*\{[^}]*Insert:\s*\{([^}]*)\}/gs)

  for (const match of tableMatches) {
    const tableName = match[1]
    const insertType = match[2]

    const columns = Array.from(insertType.matchAll(/(\w+):\s*/g)).map((m) => m[1])

    const relationships: Array<{ column: string; referencedTable: string }> = []

    for (const column of columns) {
      if (column.endsWith("_id") && column !== "id") {
        const referencedTable = column.replace("_id", "")
        relationships.push({ column, referencedTable })
      }
    }

    tables.push({ table: tableName, columns, relationships })
  }

  return tables
}

function generateIndexMigration(
  tables: Array<{
    table: string
    columns: string[]
    relationships: Array<{ column: string; referencedTable: string }>
  }>
): string {
  const generatedAt = new Date()
  const generatedIso = generatedAt.toISOString()
  const migrationIdStamp = generatedIso.replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  let migration = `-- Performance Indexes (Auto-generated from database.types.ts)
-- Generated: ${generatedIso}
-- Migration id stamp: ${migrationIdStamp}
-- DO NOT EDIT - This file is auto-generated
-- Run: pnpm codegen:generate-index-migrations --write

-- This migration creates indexes for:
-- 1. Primary keys (id columns)
-- 2. Foreign key columns (tenant isolation, relationships)
-- 3. Common query filter columns

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding TO 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`

  for (const { table, columns, relationships } of tables) {
    migration += `\n-- ============================================\n`
    migration += `-- ${table.toUpperCase()} INDEXES\n`
    migration += `-- ============================================\n\n`

    if (columns.includes("id")) {
      migration += `-- Primary key index\n`
      migration += `CREATE INDEX IF NOT EXISTS idx_${table}_id ON public.${table} USING btree (id);\n\n`
    }

    for (const { column } of relationships) {
      migration += `-- Foreign key index (tenant isolation / relationship)\n`
      migration += `CREATE INDEX IF NOT EXISTS idx_${table}_${column} ON public.${table} USING btree (${column});\n\n`
    }

    if (columns.includes("created_at")) {
      migration += `-- Common query pattern: ORDER BY created_at\n`
      migration += `CREATE INDEX IF NOT EXISTS idx_${table}_created_at ON public.${table} USING btree (created_at);\n\n`
    }

    if (columns.includes("updated_at")) {
      migration += `-- Common query pattern: ORDER BY updated_at\n`
      migration += `CREATE INDEX IF NOT EXISTS idx_${table}_updated_at ON public.${table} USING btree (updated_at);\n\n`
    }

    if (relationships.length > 0 && columns.includes("created_at")) {
      const fkColumn = relationships[0].column
      migration += `-- Composite index: tenant isolation + ordering\n`
      migration += `CREATE INDEX IF NOT EXISTS idx_${table}_${fkColumn}_created_at ON public.${table} USING btree (${fkColumn}, created_at DESC);\n\n`
    }
  }

  migration += `\n-- Index creation complete\n`
  migration += `-- Note: Monitor index usage with pg_stat_user_indexes\n`
  migration += `-- Remove unused indexes to reduce write overhead\n`

  return migration
}

// Main
if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write")
  const typesPath =
    process.argv.find((_, i) => process.argv[i - 1] === "--types") ??
    resolve(repoRoot, "packages/supabase-infra/src/types/database.types.ts")

  if (!existsSync(typesPath)) {
    process.stderr.write("❌ database.types.ts not found\n")
    process.stderr.write("Run: pnpm supabase:types:local first\n")
    process.exit(1)
  }

  const typesSource = readFileSync(typesPath, "utf8")

  console.log(`📝 Analyzing database.types.ts for index opportunities...`)
  console.log(`   Types: ${typesPath}`)
  console.log("")

  const tables = extractTablesFromTypes(typesSource)
  console.log(`   Found ${tables.length} tables`)
  console.log(`   Relationships: ${tables.reduce((sum, t) => sum + t.relationships.length, 0)}`)
  console.log("")

  const migration = generateIndexMigration(tables)

  if (!write) {
    console.log("Would generate migration:")
    console.log(migration)
  } else {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")
    const migrationName = `generate_performance_indexes_from_types`
    const migrationPath = resolve(repoRoot, `supabase/migrations/${timestamp}_${migrationName}.sql`)

    writeFileSync(migrationPath, migration, "utf8")
    console.log(`✅ Generated: ${migrationPath}`)
    console.log("")
    console.log("📝 Next steps:")
    console.log("   1. Review generated indexes (remove unnecessary ones)")
    console.log("   2. Run: pnpm supabase db push")
    console.log("   3. Monitor with: SELECT * FROM pg_stat_user_indexes;")
  }
}

export { extractTablesFromTypes, generateIndexMigration }
