import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { parseRepositoryPlanJson } from "../../../packages/codegen-tools/src/repository-plan-schema"
import { renderActionFile, runActionsCodegen } from "../../../scripts/codegen/actions-hooks-codegen"
import { generateSemanticPlan } from "../../../scripts/codegen/actions-semantic-plan"

const repoRoot = resolve(process.cwd(), "../..")
const fixtureTypesPath = resolve(repoRoot, "packages/codegen-tools/fixtures/database.types.mock.ts")
const repositoryPlanPath = resolve(repoRoot, "config/repository-plan.example.json")
const domainMapPath = resolve(repoRoot, "config/domain-map.example.json")

function loadSemanticPlan() {
  const repositoryPlan = parseRepositoryPlanJson(
    JSON.parse(readFileSync(repositoryPlanPath, "utf8")) as unknown
  )
  const domainMap = JSON.parse(readFileSync(domainMapPath, "utf8")) as unknown
  const typesSource = readFileSync(fixtureTypesPath, "utf8")
  return generateSemanticPlan(repositoryPlan, domainMap, typesSource)
}

describe("actions-hooks-codegen", () => {
  it("builds a semantic plan without placeholders", () => {
    const semanticPlan = loadSemanticPlan()
    const listAction = semanticPlan.actions.find((action) => action.method === "list")
    const insertAction = semanticPlan.actions.find((action) => action.method === "insert")

    expect(semanticPlan.meta.requiresHumanReview).toBe(false)
    expect(listAction?.inputSchema.zodSchema).not.toContain("TODO")
    expect(listAction?.outputSchema.returnType).not.toContain("unknown")
    expect(insertAction?.actionPath).toContain("/actions/")
  })

  it("renders action without TODO placeholders", () => {
    const semanticPlan = loadSemanticPlan()
    const listAction = semanticPlan.actions.find((action) => action.method === "list")

    if (!listAction) {
      throw new Error("Missing expected list action for fixture")
    }

    const actionFile = renderActionFile(listAction)

    for (const content of [actionFile]) {
      expect(content).not.toContain("TODO")
      expect(content).not.toMatch(/[=]\s*unknown\b/)
      expect(content).not.toContain("Wire Server Action")
    }

    expect(actionFile).toContain(`export async function ${listAction.actionName}`)
    expect(actionFile).toContain("sanitizeForAudit")
  })

  it("keeps check mode operational", () => {
    const result = runActionsCodegen({
      checkOnly: true,
      domainMapPath,
      planPath: repositoryPlanPath,
      repoRoot,
      semanticPlanPath: undefined,
      typesPath: fixtureTypesPath,
    })

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })
})
