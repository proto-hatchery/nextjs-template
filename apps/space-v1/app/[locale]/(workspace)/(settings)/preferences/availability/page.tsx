import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { PreferencesSectionSurface } from "@/app/[locale]/(workspace)/(settings)/preferences/_components/preferences-section-surface"
import { getPreferencesSectionsView } from "@/app/[locale]/(workspace)/(settings)/preferences/_lib/preferences-view-model.server"

export default async function PreferencesAvailabilityPage() {
  const { availability } = await getPreferencesSectionsView()

  return (
    <PreferencesSectionSurface
      title="Availability rules"
      description="Scheduling-facing preferences stay within this settings subtree instead of leaking into calendar routes."
      asideTitle="Operational posture"
      asideDescription="These route-local settings shape how the future calendar and booking surfaces behave."
      main={
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Weekly capacity</p>
              <Input defaultValue={availability.weeklyCapacity} aria-label="Weekly capacity" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Buffer policy</p>
              <Input defaultValue={availability.bufferPolicy} aria-label="Buffer policy" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Booking horizon</p>
            <Input defaultValue={availability.bookingHorizon} aria-label="Booking horizon" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Internal notes</p>
            <Textarea defaultValue={availability.notes} className="min-h-24" aria-label="Availability notes" />
          </div>
        </div>
      }
      aside={
        <ul className="space-y-3 text-sm">
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />{availability.activeServicesSummary}</li>
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />Protect documentation time alongside patient-facing capacity</li>
          <li><span className="bg-primary mr-3 inline-flex size-2 rounded-full" />Use this section as the future contract for calendar defaults</li>
        </ul>
      }
    />
  )
}
