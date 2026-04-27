/**
 * CI guard: domain services in packages/supabase-data must declare `import "server-only"`
 * and must not import from Next.js.
 *
 * Two rules:
 *   A) Every .service.ts under packages/supabase-data/src/modules/{domain}/domain/services/
 *      must contain:  import "server-only"
 *   B) No such file may contain an import from "next/..."
 *
 * Run: pnpm check:service-layer
 *
 * Related: docs/architecture/business-logic-placement.md
 *          .cursor/rules/service-layer.mdc
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

const SERVICES_ROOT = join(root, "packages", "supabase-data", "src", "modules")

const SERVER_ONLY_RE = /\bimport\s+["']server-only["']/
const NEXT_IMPORT_RE = /\bfrom\s+["']next\//

/** @param {string} dir @param {string[]} out */
function walkServiceFiles(dir, out = []) {
  let names
  try {
    names = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of names) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue
    const p = join(dir, name)
    try {
      const st = statSync(p)
      if (st.isSymbolicLink()) continue
      if (st.isDirectory()) walkServiceFiles(p, out)
      else if (name.endsWith(".service.ts")) out.push(p)
    } catch {
      continue
    }
  }
  return out
}

const errors = []

let serviceFiles
try {
  statSync(SERVICES_ROOT)
  serviceFiles = walkServiceFiles(SERVICES_ROOT)
} catch {
  // No modules directory yet — nothing to check
  serviceFiles = []
}

for (const file of serviceFiles) {
  // Only check files under domain/services/
  const rel = relative(root, file)
  if (!rel.includes(`domain${join("/")}services`) && !rel.includes("domain/services")) continue

  const text = readFileSync(file, "utf8")

  if (!SERVER_ONLY_RE.test(text)) {
    errors.push(
      `${rel}\n  Missing: import "server-only"\n  Services must declare server-only to prevent accidental client bundle inclusion.\n  See docs/architecture/business-logic-placement.md`
    )
  }

  if (NEXT_IMPORT_RE.test(text)) {
    errors.push(
      `${rel}\n  Forbidden: import from "next/…"\n  Services must not depend on Next.js. Move revalidatePath/redirect/headers to the app-local action.\n  See docs/architecture/business-logic-placement.md`
    )
  }
}

if (errors.length) {
  console.error("check-service-layer failed:\n\n" + errors.join("\n\n"))
  process.exit(1)
}

console.log(`check-service-layer: OK (${serviceFiles.length} service file(s) checked)`)
