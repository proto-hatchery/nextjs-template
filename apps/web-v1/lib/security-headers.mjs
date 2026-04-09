/* global process */

const LOOPBACK_CONNECT_SOURCES = [
  "http://127.0.0.1:*",
  "http://localhost:*",
  "ws://127.0.0.1:*",
  "ws://localhost:*",
]

const REPORT_ONLY_CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  `connect-src 'self' https: wss: ${LOOPBACK_CONNECT_SOURCES.join(" ")}`,
]

function buildContentSecurityPolicyReportOnly() {
  return REPORT_ONLY_CSP_DIRECTIVES.join("; ")
}

/**
 * Request-scoped enforcing CSP (set from proxy + mirrored on the response).
 * Aligns with Next.js 16 guidance: nonces on script-src / style-src, strict-dynamic for scripts,
 * dev-only unsafe-eval, Supabase/local connect-src parity with report-only starter.
 *
 * @param {string} nonce
 */
function buildEnforcingContentSecurityPolicy(nonce) {
  const isDev = process.env.NODE_ENV === "development"
  const devEval = isDev ? " 'unsafe-eval'" : ""
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https:`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https:`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval} https:`,
    `connect-src 'self' https: wss: ${LOOPBACK_CONNECT_SOURCES.join(" ")}`,
  ]

  return directives.join("; ")
}

/**
 * @param {{ includeCspReportOnly?: boolean }} [options]
 *   When `includeCspReportOnly` is false (e.g. `CSP_ENFORCE=1`), omit report-only CSP so the
 *   proxy-owned enforcing policy is the single CSP source of truth.
 */
function buildSecurityHeaders(options = {}) {
  const { includeCspReportOnly = true } = options

  /** @type {{ key: string, value: string }[]} */
  const headers = []

  if (includeCspReportOnly) {
    headers.push({
      key: "Content-Security-Policy-Report-Only",
      value: buildContentSecurityPolicyReportOnly(),
    })
  }

  headers.push(
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "same-origin",
    },
    {
      key: "Permissions-Policy",
      value:
        "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    }
  )

  return headers
}

export {
  buildContentSecurityPolicyReportOnly,
  buildEnforcingContentSecurityPolicy,
  buildSecurityHeaders,
}
