import { FlowScaffoldPage } from "@/app/[locale]/(flows)/_components/flow-scaffold-page"

export default function OnboardingSuccessPage() {
  return (
    <FlowScaffoldPage
      stepLabel="Protected completion state"
      title="Onboarding complete"
      description="This route stays in the flow group because it closes a bounded setup journey before the user returns to the persistent workspace shell."
      milestones={[
        "Completion summary and next-step messaging",
        "Success-state UI kept inside the onboarding tree",
        "No need for shell navigation in this protected bare flow",
      ]}
    />
  )
}
