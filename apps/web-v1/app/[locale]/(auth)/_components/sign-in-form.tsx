"use client"

import * as React from "react"
import type { z } from "zod"

import { AuthSubmitFooter } from "@/app/[locale]/(auth)/_components/auth-submit-footer"
import { useAuthErrorTranslator } from "@/app/[locale]/(auth)/_lib/auth-error-message"
import { useAuthFormSchemas } from "@/app/[locale]/(auth)/_lib/auth-form-schemas"
import { Link } from "@/i18n/navigation"
import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { signInWithPassword } from "@workspace/supabase-auth/browser/sign-in-with-password"
import { buildAuthContinueUrl } from "@workspace/supabase-auth/shared/app-destination"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

type SignInFormProps = {
  redirectTo: string
}

function SignInForm({ redirectTo }: SignInFormProps) {
  const translateAuthError = useAuthErrorTranslator()
  const schemas = useAuthFormSchemas()
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const form = useAppForm({
    schema: schemas.signInSchema,
    defaultValues: schemas.signInDefaultValues,
  })

  async function onSubmit(value: z.output<typeof schemas.signInSchema>) {
    setAuthError(null)
    setNotice(null)

    const { error } = await signInWithPassword(value)

    if (error) {
      setAuthError(translateAuthError(error.message))
      return
    }

    setNotice("Sessão iniciada. A verificar o acesso e a redirecionar…")
    window.location.assign(buildAuthContinueUrl(redirectTo))
  }

  return (
    <div className="w-full max-w-md">
      <header className="mb-8 space-y-1.5">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Bem-vindo de volta!
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          Por favor, introduza as suas credenciais para iniciar sessão.
        </p>
      </header>

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
                    className="border-border bg-background h-11 rounded-lg"
                    disabled={form.formState.isSubmitting}
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Palavra-passe</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="current-password"
                    className="border-border bg-background h-11 rounded-lg"
                    disabled={form.formState.isSubmitting}
                    placeholder="palavra-passe"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AuthSubmitFooter
            canSubmit
            isDirty={form.formState.isDirty}
            isSubmitting={form.formState.isSubmitting}
            showStatusRow={false}
            submitLabel="Iniciar sessão"
            submittingLabel="A iniciar sessão…"
          />

          <div className="-mt-1 text-center">
            <Link
              className="text-sm font-medium text-[#4F6EF7] underline-offset-4 hover:underline"
              href={`/forgot-password?redirect_to=${encodeURIComponent(redirectTo)}`}
            >
              Esqueceu-se da palavra-passe?
            </Link>
          </div>

          <p className="text-muted-foreground text-center text-sm">
            As contas são criadas por administradores. Se precisa de acesso, contacte a equipa
            responsável.
          </p>
        </form>
      </Form>
    </div>
  )
}

export { SignInForm }
