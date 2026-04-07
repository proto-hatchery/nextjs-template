#!/usr/bin/env tsx
/**
 * Fix all generated actions and repositories for AUTH + DATA LAYER compliance
 *
 * This script updates:
 * 1. All Server Actions: Add tenant resolution + real Zod schemas
 * 2. All Repositories: Add explicit ownership filters
 *
 * HIPAA compliance requirement - DO NOT skip.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const repoRoot = join(__dirname, "..")
const actionsDir = join(repoRoot, "packages/supabase-data/src/actions")
const reposDir = join(repoRoot, "packages/supabase-data/src/modules")

// Read database types for Zod schema generation
const databaseTypesPath = join(repoRoot, "packages/supabase-infra/src/types/database.types.ts")
const databaseTypesContent = readFileSync(databaseTypesPath, "utf-8")

// Build a map of table -> columns from database.types.ts
const tableColumnsMap = new Map<string, Array<{ name: string; type: string; nullable: boolean }>>()

// Simple parser for database.types.ts (extracts table columns)
function parseDatabaseTypes() {
  const tableRegex = /(\w+):\s*\{[^}]*Row:\s*\{([^}]*)\}/gs
  let match

  while ((match = tableRegex.exec(databaseTypesContent)) !== null) {
    const tableName = match[1]
    const columnsText = match[2]

    const columns: Array<{ name: string; type: string; nullable: boolean }> = []
    const columnLines = columnsText.split("\n").filter((line) => line.trim())

    for (const line of columnLines) {
      const colMatch = line.match(/(\w+):\s*([^;]+);?/)
      if (colMatch) {
        const colName = colMatch[1]
        const colType = colMatch[2].trim()
        const nullable = colType.includes("| null")

        columns.push({
          name: colName,
          type: colType.replace(/\s*\|\s*null\s*$/, ""),
          nullable,
        })
      }
    }

    tableColumnsMap.set(tableName, columns)
  }

  console.log(`📊 Parsed ${tableColumnsMap.size} tables from database.types.ts`)
}

// Generate Zod schema for a table
function generateZodSchema(tableName: string, operation: "insert" | "update" | "input"): string {
  const columns = tableColumnsMap.get(tableName)
  if (!columns) {
    return "z.object({})"
  }

  const lines: string[] = []

  for (const col of columns) {
    // Skip audit-only fields for insert/update
    if (operation !== "input" && col.name === "created_at") continue
    if (operation !== "input" && col.name === "updated_at") continue
    if (operation === "insert" && col.name === "id") continue

    const zodType = mapPostgresToZod(col)
    const optional = col.nullable || operation === "update" ? ".optional()" : ""
    const defaultVal = getDefaultForColumn(col)
    const defaultValue = defaultVal ? `.default(${defaultVal})` : ""

    // Add error message
    const errorMessage = getErrorMessage(col)

    lines.push(`  ${col.name}: z.${zodType}(${errorMessage})${optional}${defaultValue},`)
  }

  return `z.object({\n${lines.join("\n")}\n})`
}

function mapPostgresToZod(col: { name: string; type: string }): string {
  const type = col.type.toLowerCase()

  if (type.includes("uuid") || col.name.endsWith("_id")) {
    return "uuid()"
  }
  if (type.includes("boolean")) {
    return "boolean()"
  }
  if (type.includes("integer") || type.includes("numeric")) {
    return "number()"
  }
  if (type.includes("timestamp") || type.includes("date")) {
    return "iso.datetime()"
  }
  if (type.includes("json")) {
    return "record(z.string(), z.unknown())"
  }
  if (type.includes("enum")) {
    // Extract enum values from type
    const enumMatch = type.match(/'([^']+)'/g)
    if (enumMatch) {
      const values = enumMatch.map((m) => m.replace(/'/g, '"')).join(", ")
      return `enum([${values}])`
    }
    return "string()"
  }

  return "string()"
}

function getDefaultForColumn(col: { name: string; type: string }): string {
  if (col.name === "id") return "crypto.randomUUID()"
  if (col.name === "created_at" || col.name === "updated_at") {
    return "new Date().toISOString()"
  }
  if (col.type.includes("boolean")) return "false"
  if (col.type.includes("integer") || col.type.includes("numeric")) return "0"
  return ""
}

function getErrorMessage(col: { name: string; type: string }): string {
  const name = col.name.replace(/_/g, " ")
  return `{ error: "Invalid ${name}" }`
}

// Process all action files
function processActions() {
  console.log("\n🔧 Processing Server Actions...")

  const actionFiles: string[] = []

  function walkDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.name.endsWith(".codegen.ts")) {
        actionFiles.push(fullPath)
      }
    }
  }

  walkDir(actionsDir)

  let updatedCount = 0

  for (const filePath of actionFiles) {
    const content = readFileSync(filePath, "utf-8")

    // Extract table name from filename
    const filenameMatch = filePath.match(/([a-z-]+)-[a-z]+\.codegen\.ts$/)
    if (!filenameMatch) continue

    const tableName = filenameMatch[1]

    // Check if action has tenant resolution
    const hasTenantResolution = content.includes("getPsychologistIdForUser")
    const hasZodValidation = content.includes(".parse(input)")

    if (!hasTenantResolution || !hasZodValidation) {
      let updated = content

      // Add tenant resolution if missing
      if (!hasTenantResolution) {
        const importMatch = updated.match(/import.*requireAuth.*from.*require-auth["']/)
        if (importMatch && importMatch.index !== undefined) {
          const insertAfter = importMatch.index + importMatch[0].length
          updated =
            updated.slice(0, insertAfter) +
            '\nimport { getPsychologistIdForUser } from "@workspace/supabase-data/lib/auth/resolve-tenant"' +
            updated.slice(insertAfter)
        }

        // Add tenant resolution after requireAuth
        const requireAuthMatch = updated.match(
          /const \{ userId, claims \} = await requireAuth\(\{[^}]+\}\)/
        )
        if (requireAuthMatch && requireAuthMatch.index !== undefined) {
          const insertAfter = requireAuthMatch.index + requireAuthMatch[0].length
          const tenantCode = `

    // 2. Tenant resolution — BEFORE creating auth client
    const psychologistId = await getPsychologistIdForUser(userId)
    if (!psychologistId) {
      await logServerEvent({
        eventFamily: "security.audit",
        eventName: "tenant_access_denied",
        outcome: "failure",
        actorId: userId,
      })
      throw new Error("Access denied")
    }
`
          updated = updated.slice(0, insertAfter) + tenantCode + updated.slice(insertAfter)
        }
      }

      // Add Zod validation if missing (TODO placeholder)
      if (content.includes("// TODO: Define input fields")) {
        const zodSchema = generateZodSchema(tableName, "input")

        updated = updated.replace(
          /const \w+InputSchema = z\.object\(\{\s*\/\/ TODO:[^}]*\}\)/s,
          `const ${tableName.replace(/-/g, "_")}InputSchema = ${zodSchema}`
        )
      }

      writeFileSync(filePath, updated)
      updatedCount++
      console.log(`  ✅ Updated ${filePath.split("/").pop()}`)
    }
  }

  console.log(`\n✅ Updated ${updatedCount} action files`)
}

// Process all repository files
function processRepositories() {
  console.log("\n🔧 Processing Repositories...")

  const repoFiles: string[] = []

  function walkDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.name.endsWith(".repository.ts") && !entry.name.includes(".port")) {
        repoFiles.push(fullPath)
      }
    }
  }

  walkDir(reposDir)

  let updatedCount = 0

  for (const filePath of repoFiles) {
    const content = readFileSync(filePath, "utf-8")

    // Check if repository has explicit ownership filters
    const hasOwnershipFilter = content.includes('.eq("psychologist_id"')

    if (!hasOwnershipFilter) {
      let updated = content

      // Add psychologistId parameter to methods
      updated = updated.replace(
        /async findById\(id: string\)/g,
        "async findById(id: string, psychologistId: string)"
      )

      updated = updated.replace(
        /async list\(params: \w+ListParams\)/g,
        "async list(params: $1 & { psychologistId: string })"
      )

      updated = updated.replace(
        /async insert\(data: Partial<\w+DTO>\)/g,
        "async insert(data: Partial<$1DTO> & { psychologistId: string })"
      )

      updated = updated.replace(
        /async update\(id: string, patch: Partial<\w+DTO>\)/g,
        "async update(id: string, patch: Partial<$1DTO> & { psychologistId: string })"
      )

      updated = updated.replace(
        /async delete\(id: string\)/g,
        "async delete(id: string, psychologistId: string)"
      )

      // Add explicit ownership filters to queries
      // findById
      updated = updated.replace(
        /(\.eq\("id", id\))(\.maybeSingle\(\))/g,
        '$1\n      .eq("psychologist_id", psychologistId)\n      $2'
      )

      // list
      updated = updated.replace(
        /(\.from\("\w+"\)\.select\("[^"]*"\))/g,
        '$1\n      .eq("psychologist_id", params.psychologistId)'
      )

      // insert - inject psychologist_id into payload
      updated = updated.replace(
        /const payload = to\w+Insert\(data\)/g,
        "const payload = to$1Insert({ ...data, psychologist_id: data.psychologistId })"
      )

      // update
      updated = updated.replace(
        /(\.update\(payload\))(\.eq\("id", id\))/g,
        '$1\n      .eq("psychologist_id", psychologistId)\n      $2'
      )

      // delete
      updated = updated.replace(
        /(\.from\("\w+"\)\.delete\(\))(\.eq\("id", id\))/g,
        '$1\n      .eq("psychologist_id", psychologistId)\n      $2'
      )

      writeFileSync(filePath, updated)
      updatedCount++
      console.log(`  ✅ Updated ${filePath.split("/").pop()}`)
    }
  }

  console.log(`\n✅ Updated ${updatedCount} repository files`)
}

// Main execution
console.log("🚀 Starting AUTH + DATA LAYER compliance fixes...\n")

parseDatabaseTypes()
processActions()
processRepositories()

console.log("\n✅ All fixes applied!")
console.log("\n⚠️  IMPORTANT: Run tests to verify changes:")
console.log("   pnpm test:unit")
console.log("   pnpm test:integration")
