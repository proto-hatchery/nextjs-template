import { PreferencesSectionSurface } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/preferences-section-surface"
import { SecurityPreferencesForm } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/security-preferences-form"
import { getPreferencesSectionsView } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-view-model.server"
import { Badge } from "@workspace/ui/components/badge"

export default async function PreferencesSecurityPage() {
  const { security } = await getPreferencesSectionsView()

  return (
    <PreferencesSectionSurface
      title="Security posture"
      description="Recovery, active sessions, and account protection controls stay inside the preferences tree."
      asideTitle="Recovery status"
      asideDescription="Security-specific UX should land here without reviving app-global settings pages."
      main={
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Last preferences update</p>
            <p className="text-muted-foreground mt-2 text-sm">{security.lastPreferencesUpdate}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Active policies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {security.activePolicies.map((policy) => (
                <Badge key={policy} variant="ghost">
                  {policy}
                </Badge>
              ))}
            </div>
          </div>
          <SecurityPreferencesForm
            initialValues={{
              twoFactorEnabled: security.twoFactorEnabled,
              recoveryEmailConfirmed: security.recoveryEmailConfirmed,
              notificationsSecurityAlerts: security.securityAlertsEnabled,
            }}
          />
        </div>
      }
      aside={
        <div className="space-y-3 text-sm">
          <p>{security.recoveryState}</p>
          <ul className="space-y-3">
            <li>
              <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
              Surface MFA and recovery later inside this section
            </li>
            <li>
              <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
              Keep device and recovery UI local to security settings
            </li>
            <li>
              <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
              Avoid scattering auth-adjacent settings across the app
            </li>
          </ul>
        </div>
      }
    />
  )
}
