import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

let cached = false

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../")

function resolveLocalSupabaseEnv() {
  const output = execFileSync("pnpm", ["supabase", "status", "-o", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })

  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes("="))
      .map((line) => line.split("=", 2) as [string, string])
      .map(([key, value]) => [key, value.replace(/^"|"$/g, "")])
  )
}

async function ensureSupabaseTestEnv() {
  if (cached) {
    return
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const env = resolveLocalSupabaseEnv()

    process.env.NEXT_PUBLIC_SUPABASE_URL ??= env.API_URL
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= env.ANON_KEY
    process.env.SUPABASE_URL ??= env.API_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY ??= env.SERVICE_ROLE_KEY
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Local Supabase is not ready. Run `pnpm test:integration:prepare`.")
  }

  process.env.NEXT_PUBLIC_AUTH_APP_URL ??= "http://127.0.0.1:3000"

  cached = true
}

function getSupabaseTestEnv() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase test environment has not been initialized.")
  }

  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  }
}

export { ensureSupabaseTestEnv, getSupabaseTestEnv, repoRoot }
