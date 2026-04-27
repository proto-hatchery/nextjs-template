"use client"

import * as React from "react"
import type { z } from "zod"

import { AuthSubmitFooter } from "@/app/[locale]/(auth)/_components/auth-submit-footer"
import { useAuthErrorTranslator } from "@/app/[locale]/(auth)/_lib/auth-error-message"
import { useAuthFormSchemas } from "@/app/[locale]/(auth)/_lib/auth-form-schemas"
import { Link } from "@/i18n/navigation"
import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { getMfaFactors } from "@workspace/supabase-auth/browser/get-mfa-factors"
import { verifyTotpChallenge } from "@workspace/supabase-auth/browser/verify-totp-challenge"
import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type MfaChallengeFormProps = {
  redirectTo: string
}

function MfaChallengeForm({ redirectTo }: MfaChallengeFormProps) {
  const translateAuthError = useAuthErrorTranslator()
  const schemas = useAuthFormSchemas()
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [factorId, setFactorId] = React.useState<string>("")
  const [loadingFactors, setLoadingFactors] = React.useState(true)

  React.useEffect(() => {
    async function loadFactors() {
      const { data, error } = await getMfaFactors()

      if (error) {
        setAuthError(translateAuthError(error.message))
        setLoadingFactors(false)
        return
      }

      const firstFactor = data.all[0]

      if (firstFactor) {
        setFactorId(firstFactor.id)
      }

      setLoadingFactors(false)
    }

    void loadFactors()
  }, [translateAuthError])

  const form = useAppForm({
    schema: schemas.mfaCodeSchema,
    defaultValues: schemas.mfaCodeDefaultValues,
  })

  async function onSubmit(value: z.output<typeof schemas.mfaCodeSchema>) {
    setAuthError(null)

    if (!factorId) {
      setAuthError("Registe um fator TOTP antes de tentar o desafio MFA.")
      return
    }

    const { error } = await verifyTotpChallenge({
      code: value.code,
      factorId,
    })

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    window.location.assign(redirectTo)
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        {authError ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs/relaxed">
            {authError}
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label
            className={!factorId && !loadingFactors ? "text-destructive" : undefined}
            htmlFor="factor-id"
          >
            ID do fator
          </Label>
          <Input
            className="h-11 rounded-lg"
            disabled={loadingFactors}
            id="factor-id"
            onChange={(event) => setFactorId(event.target.value)}
            placeholder="ID do fator verificado"
            value={factorId}
          />
          <p className="text-muted-foreground text-xs/relaxed">
            O primeiro fator registado é carregado automaticamente. Substitua o valor se precisar de
            outro fator.
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de 6 dígitos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="one-time-code"
                  className="h-11 rounded-lg"
                  disabled={form.formState.isSubmitting}
                  inputMode="numeric"
                  placeholder="123456"
                />
              </FormControl>
              <FormDescription>
                Introduza o código temporário da aplicação de autenticação que registou.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthSubmitFooter
          canSubmit={Boolean(factorId) && !loadingFactors}
          isDirty={form.formState.isDirty}
          isSubmitting={form.formState.isSubmitting}
          submitLabel="Verificar fator"
          submittingLabel="A verificar…"
        />

        <Button asChild type="button" variant="ghost">
          <Link href="/mfa">Voltar às definições MFA</Link>
        </Button>
      </form>
    </Form>
  )
}

export { MfaChallengeForm }
