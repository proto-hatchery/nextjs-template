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
    coverageInclude: [
      "app/[locale]/(auth)/_lib/auth-form-schemas.ts",
      "../../packages/supabase-auth/src/shared/auth-form-schemas.ts",
      "app/(auth-handlers)/auth/confirm/route.ts",
      "app/(auth-handlers)/callback/route.ts",
      "app/(auth-handlers)/logout/route.ts",
      "../../packages/supabase-auth/src/server/route-handlers/auth-confirm-get.ts",
      "../../packages/supabase-auth/src/server/route-handlers/callback-get.ts",
      "../../packages/supabase-auth/src/server/route-handlers/logout-get.ts",
    ],
    include: ["../../tests/unit/example/**/*.test.ts", "../../tests/unit/example/**/*.test.tsx"],
    name: "example-unit",
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
