/* global process */
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

import createNextIntlPlugin from "next-intl/plugin"

import { buildSecurityHeaders } from "./lib/security-headers.mjs"

const require = createRequire(import.meta.url)
const { loadEnvConfig } = require("@next/env")

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnvConfig(path.resolve(__dirname, "../.."))

/**
 * Production builds must ship absolute https metadata; see docs/guides/seo.md.
 * Preview/staging: set NEXT_PUBLIC_SITE_URL to that deployment’s public https origin (e.g. Vercel preview URL).
 */
function assertValidProductionSiteUrl() {
  if (process.env.NODE_ENV !== "production") {
    return
  }
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) {
    throw new Error(
      "[example] Production build requires NEXT_PUBLIC_SITE_URL (https canonical origin). See docs/guides/seo.md"
    )
  }
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error(
      `[example] NEXT_PUBLIC_SITE_URL must be a valid URL (got: ${raw}). See docs/guides/seo.md`
    )
  }
  if (parsed.protocol !== "https:") {
    throw new Error(
      `[example] Production NEXT_PUBLIC_SITE_URL must use https: (got ${parsed.protocol}). See docs/guides/preview-environments.md`
    )
  }
  const host = parsed.hostname.toLowerCase()
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local")
  ) {
    throw new Error(
      `[example] Production NEXT_PUBLIC_SITE_URL must use a public hostname (got: ${host}).`
    )
  }
}

assertValidProductionSiteUrl()

const isCspEnforce = process.env.CSP_ENFORCE === "1"

/** Public env keys from the monorepo root to expose via `nextConfig.env` (root `.env.local`). */
const ROOT_PUBLIC_ENV_NAMES = [
  "NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS",
  "NEXT_PUBLIC_AUTH_APP_URL",
  "NEXT_PUBLIC_AUTH_COOKIE_DOMAIN",
  "NEXT_PUBLIC_BNF_APP_URL",
  "NEXT_PUBLIC_DEFAULT_LOCALE",
  "NEXT_PUBLIC_PORTAL_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
]

function getRootPublicEnv() {
  return Object.fromEntries(
    ROOT_PUBLIC_ENV_NAMES.flatMap((name) => {
      const value = process.env[name]
      return value === undefined ? [] : [[name, value]]
    })
  )
}

// FORK: Configure remotePatterns before using next/image with any external image source.
// See: https://nextjs.org/docs/app/api-reference/next-config-js/images
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // FORK: Add remotePatterns here when using next/image with external domains.
    remotePatterns: [],
  },
  env: getRootPublicEnv(),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          includeCspReportOnly: !isCspEnforce,
        }),
      },
    ]
  },
  // Sharp and @img/* must not be bundled: Webpack cannot resolve optional native/wasm subpaths
  // (e.g. @img/sharp-wasm32/versions); Node loads the correct binary at runtime.
  serverExternalPackages: ["sharp", "@img/colour", "@img/sharp-wasm32"],
  transpilePackages: ["@workspace/core", "@workspace/forms", "@workspace/seo", "@workspace/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-icons", "date-fns"],
  },
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
