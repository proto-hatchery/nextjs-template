"use client"

import { useAction } from "next-safe-action/hooks"

import { useAppForm } from "@workspace/forms/hooks/use-app-form"
import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form"
import { Switch } from "@workspace/ui/components/switch"

import { updateSecurityPreferencesAction } from "../_actions/update-security-preferences.action"
import { securityPrefsSchema, type SecurityPrefsSchema } from "../_lib/schemas"

type SecurityPreferencesFormProps = {
  initialValues: SecurityPrefsSchema
}

function SecurityPreferencesForm({ initialValues }: SecurityPreferencesFormProps) {
  const { executeAsync, isPending: isSubmitting, result } = useAction(updateSecurityPreferencesAction)

  const form = useAppForm({
    schema: securityPrefsSchema,
    defaultValues: initialValues,
  })

  const onSubmit = form.handleSubmit(async (value) => {
    const res = await executeAsync(value)
    if (!res || res.serverError || res.validationErrors) {
      return
    }
    form.reset(value)
  })

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={onSubmit}>
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
                      disabled={isSubmitting}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        {result.serverError ? (
          <p className="text-destructive text-sm">{result.serverError}</p>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs/relaxed">
            This phase updates security posture preferences only. Password, device, and session
            management remain out of scope.
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save security settings"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { SecurityPreferencesForm }
