import { randomUUID } from "node:crypto"

import createMiddleware from "next-intl/middleware"
import { NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { extractCorrelationFromHeaders } from "@workspace/logging/correlation"
import { updateSession } from "@workspace/supabase-auth/proxy/update-session"

import { buildEnforcingContentSecurityPolicy } from "./lib/security-headers.mjs"

const handleI18nRouting = createMiddleware(routing)

const isCspEnforce = process.env.CSP_ENFORCE === "1"

export async function proxy(request: NextRequest) {
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
