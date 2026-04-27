import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { mergeConfig } from "vitest/config"

import { createReactProject } from "@workspace/vitest-config/react"

const require = createRequire(import.meta.url)
const dir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(dir, "../..")
const supabaseAuthSrc = resolve(dir, "../../packages/supabase-auth/src")

export default mergeConfig(
  createReactProject({
    include: ["../../tests/unit/space-v1/**/*.test.ts", "../../tests/unit/space-v1/**/*.test.tsx"],
    name: "space-v1-unit",
    root: ".",
  }),
  {
    resolve: {
      dedupe: ["next"],
      alias: {
        "@": resolve(dir, "."),
        "@workspace/supabase-auth": supabaseAuthSrc,
        "react/jsx-runtime": require.resolve("react/jsx-runtime"),
        "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
      },
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
    test: {
      server: {
        deps: {
          inline: [
            "next",
            "@supabase/ssr",
            /@workspace\/supabase-auth/,
            /@workspace\/supabase-infra/,
            /@workspace\/logging/,
          ],
        },
      },
    },
  }
)
