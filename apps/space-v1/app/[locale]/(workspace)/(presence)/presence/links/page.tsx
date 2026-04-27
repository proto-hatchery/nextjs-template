import { PresenceSectionSurface } from "@/app/[locale]/(workspace)/(presence)/presence/_components/presence-section-surface"
import { getPresenceSectionsView } from "@/app/[locale]/(workspace)/(presence)/presence/_lib/presence-view-model.server"
import { Badge } from "@workspace/ui/components/badge"

export default async function PresenceLinksPage() {
  const { links } = await getPresenceSectionsView()

  return (
    <PresenceSectionSurface
      title="Link management"
      description="Booking, contact, and public links stay coordinated inside the presence subtree."
      asideTitle={links.visibleLinksCountLabel}
      asideDescription="Presence-specific link priorities should not leak into workspace preferences."
      main={
        <div className="space-y-3">
          {links.items.map((link) => (
            <div key={link.href} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">{link.label}</p>
                <Badge variant="outline">{link.status}</Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{link.href}</p>
            </div>
          ))}
        </div>
      }
      aside={
        <ul className="space-y-3 text-sm">
          {links.guidance.map((item) => (
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
