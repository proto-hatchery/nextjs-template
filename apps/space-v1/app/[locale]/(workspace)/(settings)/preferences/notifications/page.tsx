import { NotificationPreferencesForm } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/notification-preferences-form"
import { PreferencesSectionSurface } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/preferences-section-surface"
import { getPreferencesSectionsView } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-view-model.server"

export default async function PreferencesNotificationsPage() {
  const { notifications } = await getPreferencesSectionsView()

  return (
    <PreferencesSectionSurface
      title="Notifications"
      description="Workflow and reminder preferences stay in this domain-specific settings subtree."
      asideTitle="Signal quality"
      asideDescription="The goal is useful operational signal, not more ambient noise."
      main={
        <NotificationPreferencesForm
          initialValues={{
            notificationsWhatsappReminders:
              notifications.find((item) => item.key === "notificationsWhatsappReminders")
                ?.enabled ?? false,
            notificationsEmailReminders:
              notifications.find((item) => item.key === "notificationsEmailReminders")?.enabled ??
              false,
            notificationsPaymentReceipts:
              notifications.find((item) => item.key === "notificationsPaymentReceipts")?.enabled ??
              false,
            notificationsBillingAlerts:
              notifications.find((item) => item.key === "notificationsBillingAlerts")?.enabled ??
              false,
            notificationsMarketing:
              notifications.find((item) => item.key === "notificationsMarketing")?.enabled ?? false,
          }}
        />
      }
      aside={
        <ul className="space-y-3 text-sm">
          <li>
            <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
            Prioritize operational reminders over generic app notifications
          </li>
          <li>
            <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
            Keep notification rules route-local to settings
          </li>
          <li>
            <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
            Add delivery-channel detail later without changing this subtree
          </li>
        </ul>
      }
    />
  )
}
