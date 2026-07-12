/**
 * CI guard: forbidden filesystem paths and patterns (BAD-003, GR-013, packages/ui,
 * generated types, barrel re-exports, unstamped migrations, createAdminClient boundaries,
 * no Server Actions in apps/ ("use server" directive; forbid per-app actions/ dirs);
 * apps/ must not use package suffix filenames (.hook, .component, .provider);
 * packages/brand|core|forms|seo (not ui) must follow those suffixes under src/.
 * Run: pnpm check:forbidden
 *
 * packages/ui: fails if Git reports changes under packages/ui/ (staged, unstaged, or
 * commits on HEAD not in the merge-base with the default branch). Intentional shadcn
 * updates: ALLOW_PACKAGES_UI_CHANGES=1 pnpm check:forbidden
 * Regenerated DB types (pnpm supabase:types:local|linked): ALLOW_DATABASE_TYPES_CHANGES=1
 * Override base ref: FORBIDDEN_DIFF_BASE=origin/develop (otherwise origin/main, etc.)
 */
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const ALLOWED_SERVER_GET_SESSION_PATHS = new Set([
  join("packages", "supabase-auth", "src", "session", "get-session.ts"),
])
const IMMUTABLE_GENERATED_PATHS = new Set([
  join("packages", "supabase-infra", "src", "types", "database.types.ts"),
])

/** GR-001 barrel exceptions: package root `exports["."]` entrypoints (prefer explicit subpaths in new code). */
const ALLOWED_BARREL_INDEX_FILES = new Set([
  "packages/logging/src/index.ts",
  "packages/seo/src/index.ts",
  "packages/lexical-editor/src/index.ts",
])

/** @param {string} dir */
function existsDir(dir) {
  try {
    return statSync(dir).isDirectory()
  } catch {
    return false
  }
}

/** @param {string} dir */
function walkTsFiles(dir, out = []) {
  let names
  try {
    names = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of names) {
    if (name === "node_modules" || name === ".next" || name === "dist" || name === "coverage")
      continue
    const p = join(dir, name)
    try {
      const st = statSync(p)
      if (st.isSymbolicLink()) continue
      if (st.isDirectory()) walkTsFiles(p, out)
      else if (/\.(ts|tsx)$/.test(name)) out.push(p)
    } catch {
      continue
    }
  }
  return out
}

const errors = []

/** @param {string} p */
function normalizePathPosix(p) {
  return p.replace(/\\/g, "/")
}

/** @param {string} p */
function isUnderPackagesUi(p) {
  const n = normalizePathPosix(p)
  return n === "packages/ui" || n.startsWith("packages/ui/")
}

function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: root,
      stdio: "pipe",
    })
    return true
  } catch {
    return false
  }
}

/** @param {string} cmd */
function gitOutputLines(cmd) {
  try {
    const out = execSync(cmd, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim()
    return out ? out.split("\n").map(normalizePathPosix).filter(Boolean) : []
  } catch {
    return []
  }
}

/** @param {string} ref */
function gitRefExists(ref) {
  try {
    execSync(`git rev-parse --verify ${ref}`, {
      cwd: root,
      stdio: "pipe",
    })
    return true
  } catch {
    return false
  }
}

function collectGitChangedPaths() {
  const paths = new Set()
  for (const p of gitOutputLines("git diff --name-only")) paths.add(p)
  for (const p of gitOutputLines("git diff --name-only --cached")) paths.add(p)

  const baseCandidates = []
  if (process.env.FORBIDDEN_DIFF_BASE?.trim()) {
    baseCandidates.push(process.env.FORBIDDEN_DIFF_BASE.trim())
  } else if (process.env.GITHUB_BASE_REF?.trim()) {
    baseCandidates.push(`origin/${process.env.GITHUB_BASE_REF.trim()}`)
  } else {
    baseCandidates.push("origin/main", "origin/master", "main", "master")
  }

  for (const base of baseCandidates) {
    if (!gitRefExists(base)) continue
    for (const p of gitOutputLines(`git diff --name-only ${base}...HEAD`)) {
      paths.add(p)
    }
    break
  }

  return paths
}

const allowPackagesUi =
  process.env.ALLOW_PACKAGES_UI_CHANGES === "1" ||
  /^true$/i.test(process.env.ALLOW_PACKAGES_UI_CHANGES ?? "")

const allowDatabaseTypesChanges =
  process.env.ALLOW_DATABASE_TYPES_CHANGES === "1" ||
  /^true$/i.test(process.env.ALLOW_DATABASE_TYPES_CHANGES ?? "")

if (isGitRepository()) {
  const changed = collectGitChangedPaths()
  if (!allowPackagesUi) {
    for (const p of changed) {
      if (isUnderPackagesUi(p)) {
        errors.push(
          `Forbidden change under packages/ui (GR-001 / shadcn-only): ${p}\n  Set ALLOW_PACKAGES_UI_CHANGES=1 when committing intentional shadcn CLI output.`
        )
      }
    }
  }
  if (!allowDatabaseTypesChanges) {
    for (const p of changed) {
      if (IMMUTABLE_GENERATED_PATHS.has(p)) {
        errors.push(
          `Forbidden change to generated file: ${p}\n  Regenerate with pnpm supabase:types:local or pnpm supabase:types:linked instead of editing it by hand.\n  When committing CLI output, set ALLOW_DATABASE_TYPES_CHANGES=1.`
        )
      }
    }
  }
}

/** @param {string} rel */
function isTestFile(rel) {
  return (
    /\.(test|spec)\.(ts|tsx)$/.test(rel) ||
    /\.integration\.(test|spec)\.ts$/.test(rel) ||
    rel.endsWith(".rls.test.ts")
  )
}

function isBarrelReExport(text) {
  return (
    /^\s*export\s+\*\s+from\s+/m.test(text) ||
    /^\s*export\s+(type\s+)?\{[^}]+\}\s+from\s+/m.test(text)
  )
}

// BAD-003: app-local DB abstractions
const appsDir = join(root, "apps")
if (existsDir(appsDir)) {
  for (const app of readdirSync(appsDir)) {
    const base = join(appsDir, app)
    try {
      const baseStat = statSync(base)
      if (baseStat.isSymbolicLink() || !baseStat.isDirectory()) continue
    } catch {
      continue
    }
    for (const forbidden of ["lib/db", "lib/repositories"]) {
      const p = join(base, ...forbidden.split("/"))
      if (existsDir(p)) {
        errors.push(`Forbidden path (BAD-003): ${relative(root, p)}`)
      }
    }

    const actionsRoot = join(base, "actions")
    if (existsDir(actionsRoot)) {
      errors.push(
        `Forbidden apps/*/actions/ (Server Actions belong in packages only): ${relative(root, actionsRoot)}\n  Move to packages/supabase-data/src/actions/<module>/ and scaffold with pnpm action:new -- <module> <name>. See docs/architecture/CRITICAL-RULES.md.`
      )
    }

    for (const file of walkTsFiles(base)) {
      const rel = relative(root, file)
      if (isTestFile(rel)) continue
      const text = readFileSync(file, "utf8")
      if (/^["']use server["']/m.test(text)) {
        // Exception: app-local _actions/*.action.ts are thin orchestrators (CRITICAL-RULES write path)
        const posix = normalizePathPosix(rel)
        const isAppLocalAction =
          posix.includes("/_actions/") && basename(file).endsWith(".action.ts")
        if (!isAppLocalAction) {
          errors.push(
            `Forbidden "use server" under apps/ (Server Actions live in packages/supabase-data only): ${rel}\n  Move to packages/supabase-data/src/actions/<module>/ (pnpm action:new). See docs/architecture/CRITICAL-RULES.md and AGENTS.md.`
          )
        }
      }
      const baseName = basename(file)
      if (
        /\.hook\.(ts|tsx)$/.test(baseName) ||
        /\.component\.(ts|tsx)$/.test(baseName) ||
        /\.provider\.(ts|tsx)$/.test(baseName)
      ) {
        errors.push(
          `Forbidden filename suffix under apps/ (use _hooks/, _providers/, route folders; not .hook/.component/.provider): ${rel}\n  See docs/standards/package-file-suffixes.md and apps/AGENTS.md.`
        )
      }
    }
  }
}

/** @see docs/standards/package-file-suffixes.md — keep this Set aligned when adding a composition package. Never includes `ui`. */
const PACKAGE_SUFFIX_CONVENTION = new Set(["brand", "core", "forms", "seo"])

/** @param {string} rel */
function packageNameFromRel(rel) {
  const m = /^packages\/([^/]+)\//.exec(normalizePathPosix(rel))
  return m ? m[1] : null
}

/** @param {string} rel @param {string} file */
function checkPackageLayerSuffixes(rel, file) {
  const pkg = packageNameFromRel(rel)
  if (!pkg || !PACKAGE_SUFFIX_CONVENTION.has(pkg) || pkg === "ui") return
  if (!/\/src\//.test(normalizePathPosix(rel))) return
  if (isTestFile(rel)) return

  const baseName = basename(file)
  const posix = normalizePathPosix(rel)

  if (
    /\/components\//.test(posix) &&
    baseName.endsWith(".tsx") &&
    !baseName.endsWith(".component.tsx")
  ) {
    errors.push(
      `Package component must use *.component.tsx: ${rel}\n  Rename or see docs/standards/package-file-suffixes.md.`
    )
  }

  if (/\/hooks\//.test(posix)) {
    if (
      baseName.endsWith(".ts") &&
      !baseName.endsWith(".hook.ts") &&
      !baseName.endsWith(".test.ts")
    ) {
      errors.push(
        `Package hook must use *.hook.ts: ${rel}\n  Rename or see docs/standards/package-file-suffixes.md.`
      )
    }
    if (baseName.endsWith(".tsx") && !baseName.endsWith(".hook.tsx")) {
      errors.push(
        `Package hook must use *.hook.tsx: ${rel}\n  Rename or see docs/standards/package-file-suffixes.md.`
      )
    }
  }

  if (/\/_providers\//.test(posix) || /\/providers\//.test(posix)) {
    if (baseName.endsWith(".tsx") && !baseName.endsWith(".provider.tsx")) {
      errors.push(
        `Package provider must use *.provider.tsx: ${rel}\n  Rename or see docs/standards/package-file-suffixes.md.`
      )
    }
  }
}

const packagesRoot = join(root, "packages")
if (existsDir(packagesRoot)) {
  for (const file of walkTsFiles(packagesRoot)) {
    const rel = relative(root, file)
    if (isUnderPackagesUi(rel)) continue
    checkPackageLayerSuffixes(rel, file)
  }
}

function pathAllowsCreateAdminClient(rel) {
  const n = normalizePathPosix(rel)
  if (n.startsWith("packages/supabase-data/")) {
    return true
  }
  if (
    n === "packages/supabase-infra/src/clients/create-admin-client.ts" ||
    n === "packages/supabase-infra/src/clients/create-admin-client.test.ts"
  ) {
    return true
  }
  return false
}

// Server: auth.getSession() (GR-013) — forbidden outside client modules
// createAdminClient — server-only service role; only data layer + infra implementation
for (const scope of ["apps", "packages"]) {
  const scopeRoot = join(root, scope)
  if (!existsDir(scopeRoot)) continue

  for (const file of walkTsFiles(scopeRoot)) {
    const rel = relative(root, file)

    if (isTestFile(rel)) continue
    if (ALLOWED_SERVER_GET_SESSION_PATHS.has(rel)) continue
    if (/\/client\//.test(file) || /\/_client\//.test(file)) continue

    const text = readFileSync(file, "utf8")
    if (/\bcreateAdminClient\b/.test(text) && !pathAllowsCreateAdminClient(rel)) {
      errors.push(
        `Forbidden createAdminClient reference outside @workspace/supabase-data / create-admin-client implementation: ${rel}\n  Use user-scoped Supabase clients in apps; reserve service role for packages/supabase-data and packages/supabase-infra/src/clients/create-admin-client.ts.`
      )
    }
    if (/^["']use client["']/m.test(text)) continue
    if (/\bgetSession\s*\(/.test(text)) {
      errors.push(`Forbidden getSession() outside client boundary (GR-013): ${rel}`)
    }
    if ((/\/index\.tsx?$/.test(file) || /\\index\.tsx?$/.test(file)) && isBarrelReExport(text)) {
      if (!ALLOWED_BARREL_INDEX_FILES.has(normalizePathPosix(rel))) {
        errors.push(`Forbidden barrel re-export (GR-001): ${rel}`)
      }
    }
  }
}

/** Only git-tracked migrations are validated (local-only SQL must not fail the hook). */
function gitTrackedMigrationRelPaths() {
  if (!isGitRepository()) {
    return []
  }
  try {
    const out = execSync("git ls-files supabase/migrations/*.sql", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim()
    return out ? out.split("\n").map(normalizePathPosix).filter(Boolean) : []
  } catch {
    return []
  }
}

const migrationsDir = join(root, "supabase", "migrations")
if (existsDir(migrationsDir)) {
  for (const rel of gitTrackedMigrationRelPaths()) {
    const abs = join(root, rel)
    let text
    try {
      text = readFileSync(abs, "utf8")
    } catch {
      continue
    }
    if (
      !text.includes("-- migration-created-via: pnpm supabase:migration:new") ||
      !text.includes("-- created-at-utc:")
    ) {
      errors.push(
        `Migration is missing the stamped header (GR-015): ${rel}\n  Create files with pnpm supabase:migration:new -- <name> and restore headers with pnpm supabase:migration:stamp when db diff overwrites them.`
      )
    }
  }
}

if (errors.length) {
  console.error("check-forbidden failed:\n", errors.join("\n"))
  process.exit(1)
}

console.log("check-forbidden: OK")
