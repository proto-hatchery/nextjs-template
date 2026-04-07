/**
 * One-way copy: `.cursor/rules/<name>.mdc` → `docs/standards/rules/<name>.md`.
 * Strips YAML frontmatter, writes a new `.md` file (no symlinks, no git links).
 * The `.mdc` file remains the editor/Cursor source of truth.
 *
 * Run: node scripts/ci/sync-cursor-rules-to-docs.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const cursorDir = join(root, ".cursor", "rules")
const docsDir = join(root, "docs", "standards", "rules")

/** @param {string} raw */
function stripFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return raw.trim()
  }
  const rest = raw.slice(3)
  const end = rest.indexOf("\n---")
  if (end === -1) {
    return raw.trim()
  }
  return rest
    .slice(end + 4)
    .replace(/^\s*\n/, "")
    .trim()
}

for (const name of readdirSync(cursorDir).filter((f) => f.endsWith(".mdc"))) {
  const base = name.replace(/\.mdc$/, "")
  const body = stripFrontmatter(readFileSync(join(cursorDir, name), "utf8"))
  const out =
    `> **Contributors without Cursor:** Same rule as [\`.cursor/rules/${base}.mdc\`](../../../.cursor/rules/${base}.mdc). Regenerate: \`node scripts/ci/sync-cursor-rules-to-docs.mjs\`.\n\n` +
    `---\n\n` +
    body +
    "\n"
  writeFileSync(join(docsDir, `${base}.md`), out, "utf8")
}

console.log("sync-cursor-rules-to-docs: OK")
