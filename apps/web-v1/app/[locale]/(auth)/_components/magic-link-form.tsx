"use client"

import * as React from "react"
import type { z } from "zod"

import { AuthSubmitFooter } from "@/app/[locale]/(auth)/_components/auth-submit-footer"
import { useAuthErrorTranslator } from "@/app/[locale]/(auth)/_lib/auth-error-message"
import { useAuthFormSchemas } from "@/app/[locale]/(auth)/_lib/auth-form-schemas"
import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { signInWithMagicLink } from "@workspace/supabase-auth/browser/sign-in-with-magic-link"
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

type MagicLinkFormProps = {
  redirectTo: string
}

function MagicLinkForm({ redirectTo }: MagicLinkFormProps) {
  const translateAuthError = useAuthErrorTranslator()
  const schemas = useAuthFormSchemas()
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const form = useAppForm({
    schema: schemas.emailSchema,
    defaultValues: schemas.emailDefaultValues,
  })

  async function onSubmit(value: z.output<typeof schemas.emailSchema>) {
    setAuthError(null)
    setNotice(null)

    const { error } = await signInWithMagicLink({
      email: value.email,
      redirectTo,
    })

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    setNotice(
      "Ligação enviada. Conclua o início de sessão a partir do e-mail, neste browser e dispositivo."
    )
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="email"
                  className="h-11 rounded-lg"
                  disabled={form.formState.isSubmitting}
                  placeholder="nome@organizacao.org"
                  type="email"
                />
              </FormControl>
              <FormDescription>
                Apenas início de sessão: não são criadas contas novas por este fluxo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthSubmitFooter
          canSubmit
          isDirty={form.formState.isDirty}
          isSubmitting={form.formState.isSubmitting}
          submitLabel="Enviar ligação mágica"
          submittingLabel="A enviar…"
        />
      </form>
    </Form>
  )
}

export { MagicLinkForm }
