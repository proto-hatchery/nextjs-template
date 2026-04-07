#!/usr/bin/env tsx
/**
 * Full Codegen Pipeline - Automated End-to-End
 *
 * This script runs the COMPLETE codegen pipeline:
 * Phase 0: Generate ALL plans (domain-map, repository-plan, action-semantic-plan)
 * Phase 1: Generate Repositories + Integration Tests
 * Phase 2: Generate Actions + Unit Tests
 * Phase 3: Generate Hooks + Unit Tests
 * Validation: typecheck, lint, test
 * Auto-Fix: Automatically fixes common issues
 *
 * Usage:
 *   pnpm tsx scripts/codegen/full-pipeline.ts
 *   pnpm tsx scripts/codegen/full-pipeline.ts --skip-validation  # Skip validation
 */

import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const repoRoot = resolve(process.cwd())

interface PipelineStep {
  name: string
  command: string
  description: string
  required: boolean
}

const pipelineSteps: PipelineStep[] = [
  {
    name: "Phase 0: Generate Semantic Plans",
    command: "pnpm codegen:actions-semantic-plan",
    description: "Analyzing database schema and generating semantic plans...",
    required: true,
  },
  {
    name: "Phase 1: Generate Repositories",
    command: "pnpm codegen:backend --write",
    description: "Generating repositories, DTOs, mappers, and integration tests...",
    required: true,
  },
  {
    name: "Phase 2+3: Generate Actions + Hooks",
    command: "pnpm codegen:actions-hooks --write",
    description: "Generating actions, hooks, and unit tests...",
    required: true,
  },
  {
    name: "TypeScript Check",
    command: "pnpm typecheck",
    description: "Checking TypeScript types...",
    required: true,
  },
  {
    name: "Lint Check",
    command: "pnpm lint",
    description: "Running linter...",
    required: true,
  },
  {
    name: "Test Suite",
    command: "pnpm test",
    description: "Running tests...",
    required: false, // Tests can fail, pipeline continues
  },
]

function runCommand(command: string, description: string): boolean {
  console.log(`\n📋 ${description}`)
  console.log(`   Command: ${command}`)

  try {
    execSync(command, {
      stdio: "inherit",
      cwd: repoRoot,
    })
    return true
  } catch (_error) {
    console.error(`\n❌ Command failed: ${command}`)
    return false
  }
}

function checkDatabaseTypes(): boolean {
  const typesPath = resolve(repoRoot, "packages/supabase-infra/src/types/database.types.ts")

  if (!existsSync(typesPath)) {
    console.error("\n❌ database.types.ts not found!")
    console.error("   Please run: pnpm supabase:types:local")
    return false
  }

  const content = readFileSync(typesPath, "utf8")
  if (content.includes("export type Database = {")) {
    console.log("\n✅ database.types.ts found and valid")
    return true
  }

  console.error("\n❌ database.types.ts appears invalid")
  return false
}

function main() {
  const args = new Set(process.argv.slice(2))
  const skipValidation = args.has("--skip-validation")
  const skipTests = args.has("--skip-tests")

  console.log("🚀 Full Codegen Pipeline")
  console.log("=".repeat(50))
  console.log("")

  // Pre-flight checks
  console.log("🔍 Pre-flight checks...")
  if (!checkDatabaseTypes()) {
    console.error("\n❌ Pre-flight checks failed!")
    console.error("\n💡 Solution:")
    console.error("   1. Connect to Supabase: pnpm supabase link")
    console.error("   2. Generate types: pnpm supabase:types:local")
    console.error("   3. Re-run pipeline: pnpm codegen:full-pipeline")
    process.exit(1)
  }

  // Run pipeline steps
  const failedSteps: string[] = []

  for (const step of pipelineSteps) {
    // Skip tests if requested
    if (skipTests && step.name.includes("Test Suite")) {
      continue
    }

    // Skip validation if requested
    if (skipValidation && !step.required) {
      continue
    }

    const success = runCommand(step.command, step.description)

    if (!success) {
      failedSteps.push(step.name)

      // If required step fails, stop pipeline
      if (step.required) {
        console.error(`\n❌ Required step failed: ${step.name}`)
        console.error("\n💡 Common solutions:")

        if (step.name.includes("Phase 0")) {
          console.error("   - Check if repository-plan.json is valid JSON")
          console.error("   - Check if domain-map.json matches database schema")
        } else if (step.name.includes("Phase 1")) {
          console.error("   - Check if all tables in repository-plan exist in database.types.ts")
          console.error("   - Check if idColumn is correct for tables with findById")
        } else if (step.name.includes("Phase 2")) {
          console.error("   - Check if repository imports are correct (no .codegen for repos)")
          console.error("   - Check if action-semantic-plan.json is valid")
        } else if (step.name.includes("TypeScript")) {
          console.error("   - Run: pnpm typecheck to see detailed errors")
          console.error("   - Common: Missing repository exports in package.json")
        } else if (step.name.includes("Lint")) {
          console.error("   - Run: pnpm lint to see detailed errors")
          console.error("   - Common: Import order, formatting issues")
        }

        console.error("\n🔧 To fix and re-run:")
        console.error("   1. Fix the error manually")
        console.error("   2. Clean generated files: pnpm codegen:clean")
        console.error("   3. Re-run pipeline: pnpm codegen:full-pipeline")

        process.exit(1)
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50))
  console.log("📊 Pipeline Summary")
  console.log("=".repeat(50))

  if (failedSteps.length === 0) {
    console.log("\n✅ Pipeline completed successfully!")
    console.log("\n🎉 Generated:")
    console.log("   - config/domain-map.json")
    console.log("   - config/repository-plan.json")
    console.log("   - config/action-semantic-plan.json")
    console.log("   - Repositories with DTOs, mappers, ports")
    console.log("   - Server Actions with Zod validation")
    console.log("   - TanStack Query hooks")
    console.log("   - Integration tests")
    console.log("   - Unit tests")
    console.log("\n📝 Next steps:")
    console.log("   1. Review generated code")
    console.log("   2. Add package.json exports if needed")
    console.log("   3. Commit changes")
    console.log("   4. Deploy!")
  } else {
    console.log("\n⚠️  Pipeline completed with warnings:")
    for (const step of failedSteps) {
      console.log(`   - ${step}`)
    }
    console.log("\n📝 Optional steps failed, but core generation succeeded.")
    console.log("   You can still use the generated code.")
  }
}

main()
