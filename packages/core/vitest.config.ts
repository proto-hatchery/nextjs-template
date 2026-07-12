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
    include: [
      "../../tests/unit/core/**/*.test.ts",
      "../../tests/unit/core/**/*.test.tsx",
    ],
    name: "core-unit",
    root: ".",
  }),
  {
    resolve: {
      alias: {
        "@workspace/core": resolve(dir, "src"),
        "@workspace/ui": resolve(dir, "../ui/src"),
        "react": dirname(require.resolve("react/package.json")),
        "react/jsx-runtime": dirname(require.resolve("react/package.json")),
        "react/jsx-dev-runtime": dirname(require.resolve("react/package.json")),
      },
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  }
)
