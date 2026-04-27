import { FlowScaffoldPage } from "@/app/[locale]/(flows)/_components/flow-scaffold-page"

export default function OnboardingPage() {
  return (
    <FlowScaffoldPage
      stepLabel="Protected setup flow"
      title="Onboarding"
      description="Onboarding is a focused protected journey, not a persistent workspace destination. It belongs in the flow group so setup can evolve without shell chrome competing for attention."
      milestones={[
        "Protected onboarding steps that should not sit in the main shell",
        "Profile, service, and setup forms kept inside the onboarding tree",
        "Completion and success states routed from this bare area only",
      ]}
    />
  )
}
