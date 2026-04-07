#!/usr/bin/env tsx
/**
 * Generate unit tests for TanStack Query Hooks
 *
 * Usage:
 *   pnpm tsx scripts/codegen/generate-hook-tests.ts --write
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

import type { SemanticPlanFile } from "./actions-semantic-plan"

const repoRoot = resolve(process.cwd())

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

function generateHookTest(domainId: string, table: string, hookType: "query" | "mutation"): string {
  const domainKebab = toKebabCase(domainId)
  const tableKebab = toKebabCase(table)
  const domainCamel = toCamelCase(domainId)
  const tableCamel = toCamelCase(table)
  const queryKeysExport = `${domainCamel}QueryKeys`
  const hookName =
    hookType === "query" ? `use${toPascalCase(table)}Query` : `use${toPascalCase(table)}Mutation`

  return `/**
 * Unit tests for ${hookName}
 * 
 * @codegen-generated
 */
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ${hookName} } from "@workspace/supabase-data/hooks/${domainKebab}/${tableKebab}-${hookType}.hook.codegen"
import { ${queryKeysExport} } from "@workspace/supabase-data/hooks/${domainKebab}/query-keys.codegen"

vi.mock("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-${hookType === "query" ? "list" : "insert"}.codegen", () => ({
  ${hookType === "query" ? `list${toPascalCase(table)}Action` : `insert${toPascalCase(table)}Action`}: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("${hookName}", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

${
  hookType === "query"
    ? `
  it("should fetch data on mount", async () => {
    const actionMock = await import("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-list.codegen")
    vi.mocked(actionMock.list${toPascalCase(table)}Action).mockResolvedValue({ data: [], total: 0 })

    const { result } = renderHook(() => ${hookName}(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [], total: 0 })
  })

  it("should use correct query key from ${queryKeysExport}", async () => {
    const { result } = renderHook(() => ${hookName}({ limit: 10 }), {
      wrapper: createWrapper(),
    })

    const expectedKey = ${queryKeysExport}.${tableCamel}List({ limit: 10 })
    const actualKey = result.current.queryKey

    expect(actualKey).toEqual(expectedKey)
  })

  it("should handle error state", async () => {
    const actionMock = await import("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-list.codegen")
    vi.mocked(actionMock.list${toPascalCase(table)}Action).mockRejectedValue(new Error("Test error"))

    const { result } = renderHook(() => ${hookName}(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
`
    : `
  it("should mutate data on mutate call", async () => {
    const actionMock = await import("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-insert.codegen")
    vi.mocked(actionMock.insert${toPascalCase(table)}Action).mockResolvedValue({ id: "test-id" })

    const { result } = renderHook(() => ${hookName}(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ testData: "value" } as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actionMock.insert${toPascalCase(table)}Action).toHaveBeenCalledWith({ testData: "value" })
  })

  it("should invalidate query cache on success", async () => {
    const actionMock = await import("@workspace/supabase-data/actions/${domainKebab}/${tableKebab}-insert.codegen")
    vi.mocked(actionMock.insert${toPascalCase(table)}Action).mockResolvedValue({ id: "test-id" })

    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => ${hookName}(), { wrapper })

    result.current.mutate({ testData: "value" } as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cacheKeys = queryClient.getQueryCache().getAll()
    expect(cacheKeys.some(key => key.queryKey[0] === "${domainKebab}")).toBe(true)
  })
`
}

  describe("Query Key Factory", () => {
    it("should generate consistent keys", () => {
      const allKey = ${queryKeysExport}.all
      expect(allKey).toEqual(["${domainKebab}"])
    })

    it("should generate ${tableCamel} key", () => {
      const ${tableCamel}Key = ${queryKeysExport}.${tableCamel}()
      expect(${tableCamel}Key).toContain("${domainKebab}")
      expect(${tableCamel}Key).toContain("${tableKebab}")
    })
  })
})
`
}

// Main
if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write")
  const planPath =
    process.argv.find((_, i) => process.argv[i - 1] === "--plan") ??
    resolve(repoRoot, "config/action-semantic-plan.json")

  if (!existsSync(planPath)) {
    process.stderr.write("❌ action-semantic-plan.json not found\n")
    process.exit(1)
  }

  const plan = JSON.parse(readFileSync(planPath, "utf8")) as SemanticPlanFile

  console.log(`📝 Generating hook tests...`)
  console.log("")

  let generated = 0
  const testsDir = join(repoRoot, "tests/unit/supabase-data/hooks")

  const domains = new Map<string, Set<string>>()
  for (const action of plan.actions) {
    let tables = domains.get(action.domainId)
    if (!tables) {
      tables = new Set()
      domains.set(action.domainId, tables)
    }
    tables.add(action.table)
  }

  for (const [domainId, tables] of domains) {
    const domainKebab = toKebabCase(domainId)

    for (const table of tables) {
      const tableKebab = toKebabCase(table)

      // Query hook test
      const queryTestFile = join(testsDir, domainKebab, `${tableKebab}-query.hook.codegen.test.tsx`)
      if (!write) {
        console.log(`Would generate: ${domainKebab}/${tableKebab}-query.hook.codegen.test.tsx`)
      } else {
        mkdirSync(dirname(queryTestFile), { recursive: true })
        writeFileSync(queryTestFile, generateHookTest(domainId, table, "query"), "utf8")
        console.log(`✅ Generated: ${domainKebab}/${tableKebab}-query.hook.codegen.test.tsx`)
      }
      generated++

      // Mutation hook test
      const action = plan.actions.find(
        (a) => a.domainId === domainId && a.table === table && a.method === "insert"
      )
      if (action) {
        const mutationTestFile = join(
          testsDir,
          domainKebab,
          `${tableKebab}-mutation.hook.codegen.test.tsx`
        )
        if (!write) {
          console.log(`Would generate: ${domainKebab}/${tableKebab}-mutation.hook.codegen.test.tsx`)
        } else {
          mkdirSync(dirname(mutationTestFile), { recursive: true })
          writeFileSync(mutationTestFile, generateHookTest(domainId, table, "mutation"), "utf8")
          console.log(`✅ Generated: ${domainKebab}/${tableKebab}-mutation.hook.codegen.test.tsx`)
        }
        generated++
      }
    }
  }

  console.log("")
  console.log(`🎉 Generated ${generated} hook test files!`)
}

export { generateHookTest }
