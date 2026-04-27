import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function PatientDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <Card className="w-full rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>Patient area</CardTitle>
          <CardDescription>
            `web-v1` now owns the canonical auth surface and the default patient landing area.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed">
          Feature migration for the patient experience stays for a later phase. This route exists
          only so centralized auth can resolve patient users to a protected surface without relying
          on `space-v1`.
        </CardContent>
      </Card>
    </div>
  )
}
