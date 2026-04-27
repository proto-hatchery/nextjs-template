"use client"

import { updateNotificationsPreferencesAction } from "@/app/[locale]/(workspace)/(settings)/preferences/_actions/update-notifications-preferences.action"
import {
  notificationsPrefsSchema,
  type NotificationsPrefsSchema,
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

type NotificationPreferencesFormProps = {
  initialValues: NotificationsPrefsSchema
}

function NotificationPreferencesForm({ initialValues }: NotificationPreferencesFormProps) {
  const { form, handleSubmitWithAction, action } = useActionForm({
    action: updateNotificationsPreferencesAction,
    schema: notificationsPrefsSchema,
    defaultValues: initialValues,
    values: initialValues,
  })
  const serverError =
    typeof action.result.serverError === "string" ? action.result.serverError : null

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={handleSubmitWithAction}>
        <div className="space-y-4">
          {(
            [
              [
                "notificationsWhatsappReminders",
                "Session reminders",
                "Notify before the first session of the day and before newly booked follow-ups.",
              ],
              [
                "notificationsEmailReminders",
                "Email reminders",
                "Send scheduling and operational reminder emails when timing matters.",
              ],
              [
                "notificationsPaymentReceipts",
                "Payment receipts",
                "Alert when payments are confirmed and receipt-related follow-up is available.",
              ],
              [
                "notificationsBillingAlerts",
                "Billing alerts",
                "Flag invoices or packages that still need manual confirmation.",
              ],
              [
                "notificationsMarketing",
                "Marketing updates",
                "Receive product news and low-priority announcements.",
              ],
            ] as const
          ).map(([fieldName, label, description]) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="flex items-start justify-between gap-4 rounded-lg border p-4">
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
            Keep notifications operational and local to this settings subtree.
          </p>
          <Button type="submit" disabled={action.isPending}>
            {action.isPending ? "Saving..." : "Save notification settings"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { NotificationPreferencesForm }
