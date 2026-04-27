"use client"

import Image from "next/image"
import * as React from "react"

import { useAuthErrorTranslator } from "@/app/[locale]/(auth)/_lib/auth-error-message"
import { Link } from "@/i18n/navigation"
import { enrollTotpFactor } from "@workspace/supabase-auth/browser/enroll-totp-factor"
import { getAuthenticatorAssuranceLevel } from "@workspace/supabase-auth/browser/get-authenticator-assurance-level"
import { getMfaFactors } from "@workspace/supabase-auth/browser/get-mfa-factors"
import { unenrollFactor } from "@workspace/supabase-auth/browser/unenroll-factor"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

function MfaManagementCard() {
  const translateAuthError = useAuthErrorTranslator()
  const [loading, setLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [aal, setAal] = React.useState<string | null>(null)
  const [qrCode, setQrCode] = React.useState<string | null>(null)
  const [secret, setSecret] = React.useState<string | null>(null)
  const [verifiedTotpFactors, setVerifiedTotpFactors] = React.useState<
    Array<{ id: string; friendlyName?: string }>
  >([])

  const refreshState = React.useCallback(async () => {
    setLoading(true)
    setAuthError(null)

    const [aalResult, factorsResult] = await Promise.all([
      getAuthenticatorAssuranceLevel(),
      getMfaFactors(),
    ])

    if (aalResult.error) {
      setAuthError(translateAuthError(aalResult.error.message))
      setLoading(false)
      return
    }

    if (factorsResult.error) {
      setAuthError(translateAuthError(factorsResult.error.message))
      setLoading(false)
      return
    }

    setAal(aalResult.data.currentLevel)
    setVerifiedTotpFactors(
      factorsResult.data.totp
        .filter((factor): factor is typeof factor & { id: string } => factor.id !== undefined)
        .map((factor) => {
          const entry: { id: string; friendlyName?: string } = {
            id: factor.id,
          }
          if (factor.friendly_name !== null && factor.friendly_name !== undefined) {
            entry.friendlyName = factor.friendly_name
          }
          return entry
        })
    )
    setLoading(false)
  }, [translateAuthError])

  React.useEffect(() => {
    void refreshState()
  }, [refreshState])

  async function handleEnroll() {
    setAuthError(null)

    const { data, error } = await enrollTotpFactor({
      friendlyName: "Autenticador TOTP",
    })

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    setQrCode(`data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`)
    setSecret(data.totp.secret)
    await refreshState()
  }

  async function handleUnenroll(factorId: string) {
    setAuthError(null)

    const { error } = await unenrollFactor({ factorId })

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    setQrCode(null)
    setSecret(null)
    await refreshState()
  }

  return (
    <Card className="border-border w-full rounded-2xl border shadow-none">
      <CardHeader>
        <CardTitle>Aplicação autenticadora (TOTP)</CardTitle>
        <CardDescription>
          Nível de garantia atual:{" "}
          <span className="text-foreground font-medium">{aal ?? "a carregar…"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {authError ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs/relaxed">
            {authError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={loading} onClick={() => void handleEnroll()} type="button">
            {loading ? "A carregar…" : "Registar novo autenticador"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/mfa/challenge">Verificar um fator registado</Link>
          </Button>
        </div>

        {qrCode ? (
          <div className="border-border grid gap-2 rounded-xl border bg-zinc-100 p-4 dark:bg-zinc-900">
            <p className="text-muted-foreground text-xs/relaxed">
              Leia este código QR na aplicação de autenticação e confirme na página de desafio MFA.
            </p>
            <Image
              alt="Código QR TOTP"
              className="h-48 w-48 rounded-md bg-white p-2"
              height={192}
              src={qrCode}
              unoptimized
              width={192}
            />
            <code className="bg-background rounded-md px-3 py-2 text-xs break-all">{secret}</code>
          </div>
        ) : null}

        <div className="grid gap-2">
          <h2 className="font-medium">Fatores verificados</h2>
          {verifiedTotpFactors.length === 0 ? (
            <p className="text-muted-foreground text-xs/relaxed">
              Ainda não existem fatores TOTP verificados.
            </p>
          ) : (
            verifiedTotpFactors.map((factor) => (
              <div
                key={factor.id}
                className="border-border/60 flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <div className="font-medium">
                    {factor.friendlyName ?? "Aplicação autenticadora"}
                  </div>
                  <div className="text-muted-foreground text-xs/relaxed">{factor.id}</div>
                </div>
                <Button
                  onClick={() => void handleUnenroll(factor.id)}
                  type="button"
                  variant="outline"
                >
                  Remover
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { MfaManagementCard }
