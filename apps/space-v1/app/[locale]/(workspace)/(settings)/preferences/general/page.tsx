import { GeneralPreferencesForm } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/general-preferences-form"
import { PreferencesSectionSurface } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/preferences-section-surface"
import { getPreferencesSectionsView } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-view-model.server"

export default async function PreferencesGeneralPage() {
  const { general } = await getPreferencesSectionsView()

  return (
    <PreferencesSectionSurface
      title="General workspace settings"
      description="Identity and workspace basics stay local to the preferences domain."
      asideTitle="Integration signal"
      asideDescription="Read-only indicators can surface here without turning this phase into a settings mutation flow."
      main={
        <GeneralPreferencesForm
          initialValues={{
            displayName: general.displayName,
            locale: general.locale,
            timezone: general.timezone,
            workspaceName: general.workspaceName,
          }}
        />
      }
      aside={
        <ul className="space-y-3 text-sm">
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />{general.integrationIndicator}</li>
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />Keep account identity fields inside the settings subtree</li>
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />Reuse route-local forms when this section gets real persistence</li>
        </ul>
      }
    />
  )
}
