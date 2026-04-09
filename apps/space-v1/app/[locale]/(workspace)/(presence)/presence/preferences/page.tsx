import { Switch } from "@workspace/ui/components/switch"

import { getPresenceSectionsView } from "@/app/[locale]/(workspace)/(presence)/presence/_lib/presence-view-model.server"
import { PresenceSectionSurface } from "@/app/[locale]/(workspace)/(presence)/presence/_components/presence-section-surface"

export default async function PresencePreferencesPage() {
  const { preferences } = await getPresenceSectionsView()

  return (
    <PresenceSectionSurface
      title="Publishing preferences"
      description="Visibility and presentation controls belong to the presence domain, not general workspace settings."
      asideTitle="Rollout notes"
      asideDescription="These controls now reflect the current shared presence-related state without enabling mutations yet."
      main={
        <div className="space-y-4">
          {preferences.items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
              <Switch checked={item.enabled} aria-label={item.label} disabled />
            </div>
          ))}
        </div>
      }
      aside={
        <ul className="space-y-3 text-sm">
          {preferences.rolloutNotes.map((item) => (
            <li key={item}>
              <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      }
    />
  )
}
