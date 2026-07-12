"use client"

import { updateSecurityPreferencesAction } from "@workspace/supabase-data/actions/preferences/update-security-preferences"
import {
  securityPrefsSchema,
  type SecurityPrefsSchema,
} from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/schemas"
import { useActionForm } from "@workspace/forms/hooks/use-action-form"
import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Switch } from "@workspace/ui/components/switch"

type SecurityPreferencesFormProps = {
  initialValues: SecurityPrefsSchema
}

function SecurityPreferencesForm({ initialValues }: SecurityPreferencesFormProps) {
  const { form, handleSubmitWithAction, action } = useActionForm({
    action: updateSecurityPreferencesAction,
    schema: securityPrefsSchema,
    defaultValues: initialValues,
    values: initialValues,
  })
  const serverError =
    typeof action.result.serverError === "string" ? action.result.serverError : null

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={handleSubmitWithAction}>
        <div className="space-y-3 rounded-lg border p-4">
          {(
            [
              [
                "twoFactorEnabled",
                "Two-factor authentication",
                "Track MFA readiness here before deeper auth-management work lands.",
              ],
              [
                "recoveryEmailConfirmed",
                "Recovery email confirmed",
                "Keep recovery posture explicit until credential and device management migrate.",
              ],
              [
                "notificationsSecurityAlerts",
                "Security alerts",
                "Send operational security notifications when unusual access needs attention.",
              ],
            ] as const
          ).map(([fieldName, label, description]) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <FormLabel>{label}</FormLabel>
                    <p className="text-muted-foreground text-sm">{description}</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={action.isPending}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs/relaxed">
            This phase updates security posture preferences only. Password, device, and session
            management remain out of scope.
          </p>
          <Button type="submit" disabled={action.isPending}>
            {action.isPending ? "Saving..." : "Save security settings"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { SecurityPreferencesForm }
