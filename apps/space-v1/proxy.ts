import { randomUUID } from "node:crypto"

import createMiddleware from "next-intl/middleware"
import { NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { extractCorrelationFromHeaders } from "@workspace/logging/correlation"
import { updateSession } from "@workspace/supabase-auth/proxy/update-session"
import { getAuthAppOrigin } from "@workspace/supabase-auth/shared/auth-redirect"
import { AUTH_ROUTE_PATH_PREFIXES } from "@workspace/supabase-auth/shared/auth-route-paths"

import { buildEnforcingContentSecurityPolicy } from "./lib/security-headers.mjs"

const handleI18nRouting = createMiddleware(routing)

const isCspEnforce = process.env.CSP_ENFORCE === "1"

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/")
  const locale = segments[1]

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return pathname
  }

  const stripped = pathname.slice(locale.length + 1)
  return stripped.length > 0 ? stripped : "/"
}

function isAuthCompatibilityPath(pathname: string) {
  const normalizedPath = stripLocalePrefix(pathname)

  return AUTH_ROUTE_PATH_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  )
}

export async function proxy(request: NextRequest) {
  if (isAuthCompatibilityPath(request.nextUrl.pathname)) {
    const authOrigin = getAuthAppOrigin()

    if (request.nextUrl.origin !== authOrigin) {
      const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, authOrigin)
      return Response.redirect(redirectUrl, 307)
    }
  }

  const i18nResponse = handleI18nRouting(request)

  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse
  }

  let requestForSession = request
  let enforcingCsp: string | undefined

  if (isCspEnforce) {
    const nonce = Buffer.from(randomUUID()).toString("base64")
    enforcingCsp = buildEnforcingContentSecurityPolicy(nonce)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-nonce", nonce)
    requestHeaders.set("Content-Security-Policy", enforcingCsp)
    requestForSession = new NextRequest(request.url, {
      headers: requestHeaders,
    })
  }

  const response = await updateSession(
    requestForSession,
    extractCorrelationFromHeaders(request.headers),
    i18nResponse
  )

  if (enforcingCsp) {
    response.headers.set("Content-Security-Policy", enforcingCsp)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next|_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
