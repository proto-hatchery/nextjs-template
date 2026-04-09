import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { mergeConfig } from "vitest/config"

import { createReactProject } from "@workspace/vitest-config/react"

const require = createRequire(import.meta.url)
const dir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(dir, "../..")

export default mergeConfig(
  createReactProject({
    include: ["../../tests/unit/forms/**/*.test.ts", "../../tests/unit/forms/**/*.test.tsx"],
    name: "forms-unit",
    root: ".",
  }),
  {
    resolve: {
      alias: {
        "@workspace/forms/hooks/use-app-form": resolve(dir, "src/hooks/use-app-form.hook.ts"),
        "@workspace/forms/hooks/use-action-form": resolve(dir, "src/hooks/use-action-form.hook.ts"),
        "@workspace/forms": resolve(dir, "src"),
        "@workspace/ui": resolve(dir, "../ui/src"),
        zod: require.resolve("zod"),
        "react/jsx-runtime": require.resolve("react/jsx-runtime"),
        "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
      },
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  }
)
