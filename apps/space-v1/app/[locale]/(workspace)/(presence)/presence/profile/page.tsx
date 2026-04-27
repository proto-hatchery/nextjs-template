import { PresenceSectionSurface } from "@/app/[locale]/(workspace)/(presence)/presence/_components/presence-section-surface"
import { getPresenceSectionsView } from "@/app/[locale]/(workspace)/(presence)/presence/_lib/presence-view-model.server"
import { Badge } from "@workspace/ui/components/badge"

export default async function PresenceProfilePage() {
  const { profile } = await getPresenceSectionsView()

  return (
    <PresenceSectionSurface
      title="Profile presentation"
      description="This surface owns the public-facing framing of the professional profile."
      asideTitle={profile.completenessLabel}
      asideDescription={profile.publicStatusLabel}
      main={
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">{profile.headline}</p>
              <Badge variant="outline">{profile.completenessLabel}</Badge>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">{profile.bio}</p>
            {profile.profileUrl ? (
              <p className="text-muted-foreground mt-3 text-xs">
                Public URL: <span className="text-foreground">{profile.profileUrl}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.serviceHighlights.map((item) => (
              <Badge key={item} variant="ghost">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      }
      aside={
        <ul className="space-y-3 text-sm">
          {profile.readinessChecks.map((check) => (
            <li key={check}>
              <span className="bg-primary mr-3 inline-flex size-2 rounded-full" />
              {check}
            </li>
          ))}
        </ul>
      }
    />
  )
}
