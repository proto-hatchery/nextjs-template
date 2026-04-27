"use client"

import * as React from "react"
import type { z } from "zod"

import { AuthSubmitFooter } from "@/app/[locale]/(auth)/_components/auth-submit-footer"
import { useAuthErrorTranslator } from "@/app/[locale]/(auth)/_lib/auth-error-message"
import { useAuthFormSchemas } from "@/app/[locale]/(auth)/_lib/auth-form-schemas"
import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { updatePassword } from "@workspace/supabase-auth/browser/update-password"
import { buildAuthContinueUrl } from "@workspace/supabase-auth/shared/app-destination"
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

type ResetPasswordFormProps = {
  redirectTo: string
}

function ResetPasswordForm({ redirectTo }: ResetPasswordFormProps) {
  const translateAuthError = useAuthErrorTranslator()
  const schemas = useAuthFormSchemas()
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const form = useAppForm({
    schema: schemas.passwordResetSchema,
    defaultValues: schemas.passwordResetDefaultValues,
  })

  async function onSubmit(value: z.output<typeof schemas.passwordResetSchema>) {
    setAuthError(null)
    setNotice(null)

    const { error } = await updatePassword({ password: value.password })

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    setNotice("Palavra-passe atualizada. A redirecionar…")
    window.setTimeout(() => {
      window.location.assign(buildAuthContinueUrl(redirectTo))
    }, 500)
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        {notice ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs/relaxed text-emerald-700 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}
        {authError ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs/relaxed">
            {authError}
          </div>
        ) : null}

        {(["password", "confirmPassword"] as const).map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldName === "password" ? "Nova palavra-passe" : "Confirmar palavra-passe"}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete={fieldName === "password" ? "new-password" : "off"}
                    className="h-11 rounded-lg"
                    disabled={form.formState.isSubmitting}
                    placeholder={
                      fieldName === "password"
                        ? "Escolha uma nova palavra-passe"
                        : "Repita a palavra-passe"
                    }
                    type="password"
                  />
                </FormControl>
                <FormDescription>
                  A sessão de recuperação mantém-se ativa na aplicação até concluir a alteração.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <AuthSubmitFooter
          canSubmit
          isDirty={form.formState.isDirty}
          isSubmitting={form.formState.isSubmitting}
          submitLabel="Atualizar palavra-passe"
          submittingLabel="A atualizar…"
        />
      </form>
    </Form>
  )
}

export { ResetPasswordForm }
